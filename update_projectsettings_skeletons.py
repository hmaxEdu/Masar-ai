with open('src/components/ProjectSettings.tsx', 'r') as f:
    content = f.read()

# Add Skeleton import
if 'import { Skeleton }' not in content:
    content = content.replace("import { Button } from '@/components/ui/button';", "import { Button } from '@/components/ui/button';\nimport { Skeleton } from '@/components/ui/skeleton';")

# Loading UI for ProjectSettings
loading_ui = """  if (projectLoading) return (
    <div className="flex-1 p-4 sm:p-8 space-y-8 font-['ibm-ar']" dir="rtl">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </div>
        <div className="space-y-8">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[150px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );"""

# Replace existing Loader2
import re
content = re.sub(r'if \(projectLoading\) return .*?Loader2.*?Primary.*?div>;', loading_ui, content, flags=re.DOTALL)

with open('src/components/ProjectSettings.tsx', 'w') as f:
    f.write(content)
