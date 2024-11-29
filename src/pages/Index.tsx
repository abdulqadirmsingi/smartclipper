import { useState } from "react";
import { ClipboardEntry } from "@/components/ClipboardEntry";
import { SearchBar } from "@/components/SearchBar";
import { toast } from "sonner";

// Mock data for demonstration
const mockEntries = [
  {
    id: "1",
    content: "https://example.com/awesome-article",
    type: "link" as const,
    timestamp: "2 minutes ago",
    tags: ["work", "research"],
    isFavorite: true,
  },
  {
    id: "2",
    content: "Remember to buy groceries: milk, eggs, bread",
    type: "text" as const,
    timestamp: "15 minutes ago",
    tags: ["personal"],
    isFavorite: false,
  },
  {
    id: "3",
    content: "The quick brown fox jumps over the lazy dog",
    type: "text" as const,
    timestamp: "1 hour ago",
    tags: [],
    isFavorite: false,
  },
];

const Index = () => {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(mockEntries);

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
        </div>
      </div>
    </div>
  );
};

export default Index;