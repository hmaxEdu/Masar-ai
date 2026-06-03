// src/components/task-detail/TaskDescriptionEditor.tsx
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";

interface TaskDescriptionEditorProps {
  description: string;
  onChange: (content: string) => void;
}

export function TaskDescriptionEditor({ description, onChange }: TaskDescriptionEditorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground flex items-center gap-2">Description</Label>
      <RichTextEditor
        content={description}
        onChange={onChange}
        placeholder="Describe this task..."
      />
    </div>
  );
}