import { useState, useCallback, useEffect } from "react";
import { ClipboardEntry } from "@/components/ClipboardEntry";
import { SearchBar } from "@/components/SearchBar";
import { toast } from "sonner";
import { useClipboardMonitor } from "@/hooks/useClipboardMonitor";
import { supabase } from "@/lib/supabase";

interface ClipboardItem {
  id: string;
  content: string;
  type: "text" | "link";
  timestamp: string;
  tags: string[];
  isFavorite: boolean;
}

const Index = () => {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<ClipboardItem[]>([]);

  // Fetch initial entries
  useEffect(() => {
    const fetchEntries = async () => {
      console.log("Fetching clipboard entries from Supabase");
      const { data, error } = await supabase
        .from('clipboard_entries')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error("Error fetching entries:", error);
        toast.error("Failed to load clipboard history");
        return;
      }

      setEntries(data.map(entry => ({
        id: entry.id,
        content: entry.content,
        type: entry.type,
        timestamp: new Date(entry.timestamp).toLocaleString(),
        tags: entry.tags || [],
        isFavorite: entry.is_favorite
      })));
    };

    fetchEntries();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('clipboard_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'clipboard_entries' },
        payload => {
          console.log("Received realtime update:", payload);
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleNewClipboardEntry = useCallback((content: string, type: "text" | "link") => {
    console.log("Adding new clipboard entry:", { content, type });
    
    const newEntry: ClipboardItem = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date().toLocaleString(),
      tags: [],
      isFavorite: false,
    };

    setEntries((prevEntries) => [newEntry, ...prevEntries]);
  }, []);

  // Initialize clipboard monitoring
  useClipboardMonitor(handleNewClipboardEntry);

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('clipboard_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
      return;
    }

    setEntries(entries.filter((entry) => entry.id !== id));
    toast.success("Entry deleted");
  };

  const handleToggleFavorite = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    const { error } = await supabase
      .from('clipboard_entries')
      .update({ is_favorite: !entry.isFavorite })
      .eq('id', id);

    if (error) {
      console.error("Error updating favorite status:", error);
      toast.error("Failed to update favorite status");
      return;
    }

    setEntries(
      entries.map((entry) =>
        entry.id === id
          ? { ...entry, isFavorite: !entry.isFavorite }
          : entry
      )
    );
  };

  const filteredEntries = entries.filter((entry) =>
    entry.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">SmartClip</h1>
        <div className="mb-6">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <ClipboardEntry
              key={entry.id}
              content={entry.content}
              type={entry.type}
              timestamp={entry.timestamp}
              tags={entry.tags}
              isFavorite={entry.isFavorite}
              onCopy={() => handleCopy(entry.content)}
              onDelete={() => handleDelete(entry.id)}
              onToggleFavorite={() => handleToggleFavorite(entry.id)}
            />
          ))}
          {filteredEntries.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No clipboard entries found. Copy some text to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;