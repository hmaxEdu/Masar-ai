// src/components/EmptyState.tsx
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border/60 rounded-3xl bg-muted/20 min-h-[400px]",
        className
      )}
    >
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/5 border border-primary/20">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="text-2xl font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm text-sm leading-relaxed mb-8">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && (
          <Button onClick={onAction} className="h-10 px-6 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> {actionLabel}
          </Button>
        )}
        
        {secondaryActionLabel && (
          <Button 
            variant="outline" 
            onClick={onSecondaryAction} 
            className="h-10 px-6 bg-background/50 border-primary/20 text-primary hover:bg-primary/10"
          >
            <Sparkles className="mr-2 h-4 w-4" /> {secondaryActionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}