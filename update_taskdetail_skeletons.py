with open('src/components/TaskDetailDialog.tsx', 'r') as f:
    content = f.read()

# Add Skeleton import if not present
if 'import { Skeleton }' not in content:
    content = content.replace("import { Button } from '@/components/ui/button';", "import { Button } from '@/components/ui/button';\nimport { Skeleton } from '@/components/ui/skeleton';")

# Define the new loading UI
loading_ui = """  if (taskLoading) return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="font-['ibm-ar'] min-w-[90%] sm:min-w-[700px] h-[90vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden" dir="rtl">
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr,250px] gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-[200px] w-full rounded-md" />
              </div>
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full" />
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );"""

# Replace the existing simple loader
import re
content = re.sub(r'if \(taskLoading\) return \(.*?DialogContent.*?Loader2.*?DialogContent.*?Dialog.*?\(.*?\);', loading_ui, content, flags=re.DOTALL)

with open('src/components/TaskDetailDialog.tsx', 'w') as f:
    f.write(content)
