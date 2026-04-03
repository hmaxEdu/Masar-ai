import sys
import re

# Helper to fix destructuring
def fix_file(path, hook_name, data_field, data_var):
    with open(path, 'r') as f:
        content = f.read()

    # Replace destructuring
    # e.g. const { projects: projectsData, loading: projectsLoading } = useProjects(...)
    # to const { projects: projects, loading: projectsLoading } = useProjects(...)
    pattern = rf'const\s+{{\s*{data_field}:\s*\w+,\s*loading:\s*(\w+)\s*}}\s*=\s*{hook_name}\((.*?)\);'
    replacement = rf'const {{ {data_field}: {data_var}, loading: \1 }} = {hook_name}(\2);'
    content = re.sub(pattern, replacement, content)

    with open(path, 'w') as f:
        f.write(content)

# Actually I just want to use the original variable names for the data.
# e.g. projects, tasks, task, project.

fix_file('src/App.tsx', 'useProjects', 'projects', 'projects')
fix_file('src/components/ListView.tsx', 'useTasks', 'tasks', 'tasks')
fix_file('src/components/ListView.tsx', 'useProjects', 'projects', 'projects')
fix_file('src/components/TaskDetailDialog.tsx', 'useTask', 'task', 'task')
fix_file('src/components/TaskDetailDialog.tsx', 'useTasks', 'tasks', 'allTasks')
fix_file('src/components/ProjectSettings.tsx', 'useProject', 'project', 'project')

with open('src/components/ProjectSettings.tsx', 'r') as f:
    content = f.read()
# Revert some accidental replacements of project. with projectData.
content = content.replace('projectData.', 'project.')
content = content.replace('projectData?', 'project?')
with open('src/components/ProjectSettings.tsx', 'w') as f:
    f.write(content)

with open('src/components/TaskDetailDialog.tsx', 'r') as f:
    content = f.read()
# Revert taskData. to task. and allTasksData to allTasks
content = content.replace('taskData.', 'task.')
content = content.replace('taskData?', 'task?')
content = content.replace('allTasksData.', 'allTasks.')
content = content.replace('allTasksData?', 'allTasks?')
# Handle useMemo dependencies too
content = content.replace('[allTasksData,', '[allTasks,')
with open('src/components/TaskDetailDialog.tsx', 'w') as f:
    f.write(content)

# For App.tsx too
with open('src/App.tsx', 'r') as f:
    content = f.read()
content = content.replace('projectsData.', 'projects.')
content = content.replace('projectsData?', 'projects?')
with open('src/App.tsx', 'w') as f:
    f.write(content)

# For ListView.tsx
with open('src/components/ListView.tsx', 'r') as f:
    content = f.read()
content = content.replace('tasksData.', 'tasks.')
content = content.replace('tasksData?', 'tasks?')
content = content.replace('projectsData.', 'projects.')
content = content.replace('projectsData?', 'projects?')
with open('src/components/ListView.tsx', 'w') as f:
    f.write(content)
