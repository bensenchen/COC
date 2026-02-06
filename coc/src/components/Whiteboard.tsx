'use client';

import { Tldraw, Editor, TldrawFile, createTLStore, defaultShapeUtils, throttle } from 'tldraw';
import 'tldraw/tldraw.css';
import { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

interface WhiteboardProps {
  roomId: string;
  initialContent?: any;
  onEditorMount?: (editor: Editor) => void;
  readOnly?: boolean;
  className?: string;
  userId?: string;
  userName?: string;
}

export default function Whiteboard({ 
  roomId, 
  initialContent, 
  onEditorMount, 
  readOnly = false, 
  className,
  userId = 'anon',
  userName = 'Anonymous' 
}: WhiteboardProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [store] = useState(() => {
    const newStore = createTLStore({
      shapeUtils: defaultShapeUtils,
    });
    if (initialContent) {
      newStore.loadSnapshot(initialContent);
    }
    return newStore;
  });

  // Handle Supabase Realtime
  useEffect(() => {
    if (!editor) return;

    const channel = supabase.channel(`whiteboard:${roomId}`);
    const clientId = uuidv4();

    // Throttle updates to avoid flooding Supabase
    const broadcastUpdate = throttle(50, (update: any) => {
      channel.send({
        type: 'broadcast',
        event: 'update',
        payload: update,
      });
    });

    // Throttle presence updates
    const broadcastPresence = throttle(100, (presence: any) => {
      channel.track(presence);
    });

    channel
      .on('broadcast', { event: 'update' }, ({ payload }) => {
        // Apply remote changes
        // Filter out changes from self if any (though broadcast usually doesn't echo back to sender if configured, but Supabase does echo)
        // Actually Supabase broadcast echoes to everyone including sender by default? No, usually not.
        // But let's be safe. Tldraw's mergeRemoteChanges handles this if we pass the right source?
        // Actually, we should just apply it.
        try {
          // We need to be careful not to trigger another update loop.
          // Tldraw's store.mergeRemoteChanges is designed for this.
          // But payload here is likely the changes object.
          
          // If we are sending the whole 'changes' object from store.listen:
          editor.store.mergeRemoteChanges(() => {
             const { changes } = payload;
             // We need to apply these changes.
             // Tldraw's mergeRemoteChanges expects a callback where we mutate the store?
             // No, it expects a function that returns void, and inside we use store.put, etc.
             // Actually, mergeRemoteChanges is for applying changes from a remote source.
             
             // Let's look at how we send data.
             // store.listen gives us { changes: { added, updated, removed } }
             
             // To apply:
             const { added, updated, removed } = changes;
             
             Object.values(added).forEach((record: any) => {
               editor.store.put([record]);
             });
             Object.values(updated).forEach((record: any) => {
               const [from, to] = record as [any, any];
               editor.store.put([to]);
             });
             Object.values(removed).forEach((record: any) => {
               editor.store.remove([record.id]);
             });
          });
        } catch (e) {
          console.error('Error applying remote update:', e);
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Handle presence sync (cursors)
        // Tldraw expects peer presence in the store.
        // We need to map Supabase presence to Tldraw peer presence records.
        
        const peerPresenceRecords: any[] = [];
        
        Object.entries(state).forEach(([key, presences]) => {
          // presences is an array of presence objects for this key
          // We assume one presence per client
          const p = presences[0] as any;
          if (p.clientId !== clientId && p.presence) {
            peerPresenceRecords.push(p.presence);
          }
        });

        // Update peers in Tldraw
        // We can put these records into the store directly?
        // Tldraw handles instance_presence records.
        if (peerPresenceRecords.length > 0) {
           editor.store.put(peerPresenceRecords);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
           // Initial presence
           // We'll track presence in the store listener
        }
      });

    // Listen to local store changes
    const cleanupListener = editor.store.listen(
      (update) => {
        // Broadcast changes
        // We only want to broadcast changes that are "local" (source === 'user')
        if (update.source !== 'user') return;

        const { changes } = update;
        // Filter out instance_presence changes from 'changes' payload if we want to handle them separately via presence channel?
        // Actually, Tldraw treats presence as just another record in the store (instance_presence).
        // But usually we want to use the ephemeral presence channel for cursors to avoid saving them to DB history if we were saving history.
        // For broadcast-only, we can send everything.
        // However, Supabase Presence is better for cursors (ephemeral).
        
        const contentChanges = {
          added: {},
          updated: {},
          removed: {},
        } as any;
        
        let hasContentChanges = false;
        let presenceUpdate = null;

        // Separate presence updates from content updates
        // Tldraw records: 'instance_presence' is for cursors/selection
        
        const processRecord = (record: any, type: 'added' | 'updated' | 'removed') => {
            if (record.typeName === 'instance_presence') {
                // This is my presence
                // We should send this via channel.track
                presenceUpdate = record;
            } else if (record.typeName === 'instance') {
                // Local instance state (zoom, etc) - usually don't need to sync this to others
            } else if (record.typeName === 'pointer') {
                // Pointer events - usually handled via instance_presence
            } else {
                // Shapes, assets, etc.
                contentChanges[type][record.id] = record;
                hasContentChanges = true;
            }
        };

        Object.values(changes.added).forEach((r: any) => processRecord(r, 'added'));
        Object.values(changes.updated).forEach((r: any) => processRecord(r[1], 'updated')); // r is [from, to]
        Object.values(changes.removed).forEach((r: any) => processRecord(r, 'removed'));

        if (hasContentChanges) {
          broadcastUpdate({ changes: contentChanges, sender: clientId });
        }

        if (presenceUpdate) {
          // We need to augment presence with user info
          const presenceWithUser = {
            ...presenceUpdate,
            userId,
            userName,
            clientId, // Add clientId to identify self
          };
          broadcastPresence({ clientId, presence: presenceWithUser });
        }
      },
      { scope: 'all', source: 'user' }
    );

    return () => {
      cleanupListener();
      supabase.removeChannel(channel);
    };
  }, [editor, roomId, userId, userName]);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    if (readOnly) {
      editor.updateInstanceState({ isReadonly: true });
    }
    if (onEditorMount) {
      onEditorMount(editor);
    }
    
    // Set user info
    editor.user.updateUserPreferences({
      name: userName,
      id: userId,
    });
  }, [readOnly, onEditorMount, userId, userName]);

  return (
    <div className={`w-full h-full min-h-[500px] border border-gray-200 rounded-lg overflow-hidden relative ${className || ''}`}>
      <Tldraw
        store={store}
        onMount={handleMount}
        persistenceKey={readOnly ? undefined : `whiteboard-${roomId}`} // Use room-specific persistence
      />
    </div>
  );
}
