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
        const text = await navigator.clipboard.readText();
        
        // Only process if content has changed
        if (text && text !== lastContent.current) {
          console.log("New clipboard content detected:", text);
          lastContent.current = text;
          
          // Determine if the content is a link
          const isLink = text.startsWith("http://") || text.startsWith("https://");
          
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
            toast.error("Failed to save clipboard content");
            return;
          }
          
          onNewClipboardEntry(text, isLink ? "link" : "text");
          toast.success("New item added to clipboard history");
        }
      } catch (error) {
        console.error("Failed to read clipboard:", error);
      }
    };

    // Check clipboard every 2 seconds
    const intervalId = setInterval(checkClipboard, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [onNewClipboardEntry]);
};