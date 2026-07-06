// src/components/TaskDetail/TaskDescriptionEditor.tsx
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";

interface TaskDescriptionEditorProps {
  description: string;
  onChange: (content: string) => void;
}

export function TaskDescriptionEditor({ description, onChange }: TaskDescriptionEditorProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">Description</Label>
      <RichTextEditor
        content={description}
        onChange={onChange}
        placeholder="Describe this task..."
      />
    </div>
  );
}