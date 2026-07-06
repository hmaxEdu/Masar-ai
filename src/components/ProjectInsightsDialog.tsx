import { MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTasks } from "@/hooks/use-masar";
import { getProjectInsights } from "@/lib/ai";
import { Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface ProjectInsightsDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectInsightsDialog({
  projectId,
  isOpen,
  onClose,
}: ProjectInsightsDialogProps) {
  const { tasks } = useTasks(projectId);
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tasks.length > 0 && !insights) {
      generateInsights();
    }
  }, [isOpen]);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjectInsights(tasks);
      setInsights(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[80vh] flex flex-col"
        dir="ltr"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" /> AI Project Manager
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-4"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <Shimmer className="text-sm font-medium">
                  Analyzing project tasks and priorities...
                </Shimmer>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                className="text-destructive text-sm text-center py-8"
              >
                <p>Failed to generate insights.</p>
                <p className="font-mono text-xs mt-2 bg-destructive/10 p-2 rounded">
                  {error}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={generateInsights}
                >
                  Try Again
                </Button>
              </motion.div>
            ) : insights ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="markdown-content prose prose-sm dark:prose-invert max-w-none px-2"
              >
                <MessageResponse>{insights}</MessageResponse>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}