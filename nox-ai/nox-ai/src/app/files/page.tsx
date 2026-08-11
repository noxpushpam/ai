"use client";

import { useEffect, useState } from "react";
import { FolderOpen, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  type: string;
  title: string;
  preview: string;
  timestamp: number;
}

export default function FilesPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nox_history");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const clearAll = () => {
    localStorage.removeItem("nox_history");
    setItems([]);
    toast.success("History cleared");
  };

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Files & History</h1>
          <p className="text-sm text-muted-foreground">
            Recent sessions stored locally on your device
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No local history yet. Start a chat or upload a file.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border p-4"
            >
              {item.type === "image" ? (
                <ImageIcon className="h-5 w-5 text-primary" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.preview}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
