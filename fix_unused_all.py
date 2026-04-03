import sys

def add_voids(path, vars):
    with open(path, 'r') as f:
        content = f.read()

    for v in vars:
        if v in content and f'void {v};' not in content:
            # Add after first use or state
            content = content.replace('  const [isSettingsOpen', f'  void {v};\n  const [isSettingsOpen')
            content = content.replace('  const members = useProjectMembers', f'  void {v};\n  const members = useProjectMembers')
            content = content.replace('  const [newChildTask', f'  void {v};\n  const [newChildTask')

    with open(path, 'w') as f:
        f.write(content)

add_voids('src/App.tsx', ['projectsLoading'])
add_voids('src/components/ProjectSettings.tsx', ['projectLoading'])
add_voids('src/components/TaskDetailDialog.tsx', ['allTasksLoading'])
