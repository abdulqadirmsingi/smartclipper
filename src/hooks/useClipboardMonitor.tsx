import { useEffect } from "react";
import { toast } from "sonner";

export const useClipboardMonitor = (
  onNewClipboardEntry: (content: string, type: "text" | "link") => void
) => {
  useEffect(() => {
    const handleClipboardChange = async () => {
      try {
        const text = await navigator.clipboard.readText();
        console.log("New clipboard content detected:", text);
        
        // Determine if the content is a link
        const isLink = text.startsWith("http://") || text.startsWith("https://");
        
        onNewClipboardEntry(text, isLink ? "link" : "text");
        toast.success("New item added to clipboard history");
      } catch (error) {
        console.error("Failed to read clipboard:", error);
        toast.error("Failed to read clipboard content");
      }
    };

    // Listen for copy events
    document.addEventListener("copy", handleClipboardChange);

    return () => {
      document.removeEventListener("copy", handleClipboardChange);
    };
  }, [onNewClipboardEntry]);
};