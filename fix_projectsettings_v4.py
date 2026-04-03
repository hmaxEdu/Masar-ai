with open('src/components/ProjectSettings.tsx', 'r') as f:
    content = f.read()

# I messed up the loading UI insertion for ProjectSettings
# I'll just rewrite the whole component with the loading UI.
# Or just find where to insert it.

content = content.replace('  const myRole = useMyRole(projectId);', """  const myRole = useMyRole(projectId);

  if (projectLoading) return (
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
  );""")

# Remove the void projectLoading
content = content.replace('  void projectLoading;', '')

with open('src/components/ProjectSettings.tsx', 'w') as f:
    f.write(content)
