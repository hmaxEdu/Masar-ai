import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Error was: src/App.tsx(130,30): error TS2339: Property 'find' does not exist on type '{ projects: Project[]; loading: boolean; }'.
# This means `projects` is the object, but I didn't destructure it in App.tsx!

content = content.replace('const projects = useProjects(session.user.id);', 'const { projects, loading: projectsLoading } = useProjects(session.user.id);')

with open('src/App.tsx', 'w') as f:
    f.write(content)
