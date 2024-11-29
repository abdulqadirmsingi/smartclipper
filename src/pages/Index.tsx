import { useState, useCallback } from "react";
import { ClipboardEntry } from "@/components/ClipboardEntry";
import { SearchBar } from "@/components/SearchBar";
import { toast } from "sonner";
import { useClipboardMonitor } from "@/hooks/useClipboardMonitor";

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

  const handleNewClipboardEntry = useCallback((content: string, type: "text" | "link") => {
    console.log("Adding new clipboard entry:", { content, type });
    
    const newEntry: ClipboardItem = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: "Just now",
      tags: [],
      isFavorite: false,
    };

    setEntries((prevEntries) => [newEntry, ...prevEntries]);
  }, []);

  // Initialize clipboard monitoring
  useClipboardMonitor(handleNewClipboardEntry);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
    toast.success("Entry deleted");
  };

  const handleToggleFavorite = (id: string) => {
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