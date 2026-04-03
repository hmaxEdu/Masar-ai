import re

# App.tsx
with open('src/App.tsx', 'r') as f:
    content = f.read()
content = content.replace('const { data: projects, loading: projectsLoading } = useProjects(session.user.id);',
                          'const { projects, loading: projectsLoading } = useProjects(session.user.id);')
# Fix references in App.tsx: projects.map, projects.find
with open('src/App.tsx', 'w') as f:
    f.write(content)

# ListView.tsx
with open('src/components/ListView.tsx', 'r') as f:
    content = f.read()
content = content.replace('const { data: tasks, loading: tasksLoading } = useTasks(projectId);',
                          'const { tasks, loading: tasksLoading } = useTasks(projectId);')
content = content.replace('const { data: projects, loading: projectsLoading } = useProjects();',
                          'const { projects, loading: projectsLoading } = useProjects();')
with open('src/components/ListView.tsx', 'w') as f:
    f.write(content)

# TaskDetailDialog.tsx
with open('src/components/TaskDetailDialog.tsx', 'r') as f:
    content = f.read()
content = content.replace('const { data: task, loading: taskLoading } = useTask(taskId);',
                          'const { task, loading: taskLoading } = useTask(taskId);')
content = content.replace('const { data: allTasks, loading: allTasksLoading } = useTasks(task?.project_id || \'all\');',
                          'const { tasks: allTasks, loading: allTasksLoading } = useTasks(task?.project_id || \'all\');')
with open('src/components/TaskDetailDialog.tsx', 'w') as f:
    f.write(content)

# ProjectSettings.tsx
with open('src/components/ProjectSettings.tsx', 'r') as f:
    content = f.read()
content = content.replace('const { data: project, loading: projectLoading } = useProject(projectId);',
                          'const { project, loading: projectLoading } = useProject(projectId);')
with open('src/components/ProjectSettings.tsx', 'w') as f:
    f.write(content)
