// src/components/TaskDetail/TaskDescriptionEditor.tsx
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import { useRef, useEffect, useState } from "react";

interface TaskDescriptionEditorProps {
  description: string;
  onChange: (content: string) => void;
}

export function TaskDescriptionEditor({ description, onChange }: TaskDescriptionEditorProps) {
  // FIX: Added explicit `null` initial value for React 19 strict typings
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [localContent, setLocalContent] = useState(description);

  // Sync local state if external description changes (e.g., switching tasks)
  useEffect(() => {
    setLocalContent(description);
  }, [description]);

  // Clean up timeouts to prevent memory leaks on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Debounce the rich text editor output to prevent firing a Supabase DB request on every keystroke
  const handleDebouncedChange = (html: string) => {
    setLocalContent(html);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(html);
    }, 1000); // 1 second debounce
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 block">
        Description
      </Label>
      <RichTextEditor
        content={localContent}
        onChange={handleDebouncedChange}
        placeholder="Describe this task in detail..."
      />
    </div>
  );
}