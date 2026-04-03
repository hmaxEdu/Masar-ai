import sys

# App.tsx
with open('src/App.tsx', 'r') as f:
    content = f.read()
content = content.replace('const { projects, loading: projectsLoading } = useProjects(session.user.id);',
                          'const { projects, loading: projectsLoading } = useProjects(session.user.id);')
# Actually the error says Property 'find' does not exist on type '{ projects: Project[]; loading: boolean; }'.
# This means I am using projects as the object { projects, loading }.
# I should have used:
# const { projects: projectsData, loading: projectsLoading } = useProjects(session.user.id);
# and then use projectsData instead of projects.
# But I kept the variable name 'projects'.

# Let's fix the destructuring to actually rename the data part.
content = content.replace('const { projects, loading: projectsLoading } = useProjects(session.user.id);',
                          'const { projects: projectsData, loading: projectsLoading } = useProjects(session.user.id);')
# Then replace all usage of projects with projectsData where it refers to the array.
content = content.replace('projects.find', 'projectsData.find')
content = content.replace('projects.map', 'projectsData.map')
# Avoid replacing 'useProjects' or other things incorrectly.
# Re-reading the error: src/App.tsx(130,30): error TS2339: Property 'find' does not exist on type '{ projects: Project[]; loading: boolean; }'.

with open('src/App.tsx', 'w') as f:
    f.write(content)

# ListView.tsx
with open('src/components/ListView.tsx', 'r') as f:
    content = f.read()
content = content.replace('const { tasks, loading: tasksLoading } = useTasks(projectId);',
                          'const { tasks: tasksData, loading: tasksLoading } = useTasks(projectId);')
content = content.replace('const { projects, loading: projectsLoading } = useProjects();',
                          'const { projects: projectsData, loading: projectsLoading } = useProjects();')

# Replace tasks with tasksData and projects with projectsData
content = content.replace('tasks.filter', 'tasksData.filter')
content = content.replace('tasks.reduce', 'tasksData.reduce')
content = content.replace('tasks.length', 'tasksData.length')
content = content.replace('tasks.forEach', 'tasksData.forEach')
content = content.replace('projects.find', 'projectsData.find')

with open('src/components/ListView.tsx', 'w') as f:
    f.write(content)

# TaskDetailDialog.tsx
with open('src/components/TaskDetailDialog.tsx', 'r') as f:
    content = f.read()
content = content.replace('const { task, loading: taskLoading } = useTask(taskId);',
                          'const { task: taskData, loading: taskLoading } = useTask(taskId);')
content = content.replace('const { tasks: allTasks, loading: allTasksLoading } = useTasks(task?.project_id || \'all\');',
                          'const { tasks: allTasksData, loading: allTasksLoading } = useTasks(taskData?.project_id || \'all\');')

# Replace task with taskData and allTasks with allTasksData
content = content.replace('task.id', 'taskData.id')
content = content.replace('task.title', 'taskData.title')
content = content.replace('task.description', 'taskData.description')
content = content.replace('task.status', 'taskData.status')
content = content.replace('task.priority', 'taskData.priority')
content = content.replace('task.started_at', 'taskData.started_at')
content = content.replace('task.finished_at', 'taskData.finished_at')
content = content.replace('task.project_id', 'taskData.project_id')
content = content.replace('allTasks.filter', 'allTasksData.filter')
content = content.replace('allTasks.find', 'allTasksData.find')

with open('src/components/TaskDetailDialog.tsx', 'w') as f:
    f.write(content)

# ProjectSettings.tsx
with open('src/components/ProjectSettings.tsx', 'r') as f:
    content = f.read()
content = content.replace('const { project, loading: projectLoading } = useProject(projectId);',
                          'const { project: projectData, loading: projectLoading } = useProject(projectId);')
content = content.replace('project.name', 'projectData.name')
content = content.replace('project.visibility', 'projectData.visibility')
content = content.replace('project.owner_id', 'projectData.owner_id')

with open('src/components/ProjectSettings.tsx', 'w') as f:
    f.write(content)
