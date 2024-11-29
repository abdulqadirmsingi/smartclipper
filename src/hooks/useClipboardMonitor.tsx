import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const useClipboardMonitor = (
  onNewClipboardEntry: (content: string, type: "text" | "link") => void
) => {
  const lastContent = useRef<string>("");

  useEffect(() => {
    const checkClipboard = async () => {
      try {
        // Check if document has focus
        if (!document.hasFocus()) {
          console.log("Document not focused, skipping clipboard check");
          return;
        }

        // Check clipboard permissions
        const permission = await navigator.permissions.query({
          name: 'clipboard-read' as PermissionName
        });

        if (permission.state === 'denied') {
          console.error("Clipboard permission denied");
          toast.error("Please allow clipboard access in your browser settings");
          return;
        }

        const text = await navigator.clipboard.readText();
        
        // Only process if content has changed and exists
        if (text && text !== lastContent.current) {
          console.log("New clipboard content detected:", text);
          lastContent.current = text;
          
          // Determine if the content is a link
          const isLink = text.startsWith("http://") || text.startsWith("https://");
          
          try {
            // Save to Supabase
            const { error } = await supabase
              .from('clipboard_entries')
              .insert([
                {
                  content: text,
                  type: isLink ? 'link' : 'text',
                  timestamp: new Date().toISOString(),
                }
              ]);

            if (error) {
              console.error("Failed to save to Supabase:", error);
              toast.error("Failed to save to database");
              return;
            }
            
            onNewClipboardEntry(text, isLink ? "link" : "text");
            toast.success("New item added to clipboard history");
          } catch (supabaseError) {
            console.error("Supabase error:", supabaseError);
            toast.error("Failed to connect to database");
          }
        }
      } catch (error) {
        console.error("Clipboard error:", error);
        if (error instanceof Error) {
          // Only show error toast if it's a new error
          if (error.message !== lastContent.current) {
            lastContent.current = error.message;
            toast.error("Unable to access clipboard");
          }
        }
      }
    };

    // Check clipboard every 2 seconds
    const intervalId = setInterval(checkClipboard, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [onNewClipboardEntry]);
};