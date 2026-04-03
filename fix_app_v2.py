with open('src/App.tsx', 'r') as f:
    content = f.read()

# I added void projectsLoading; in the wrong function ProjectMembersAvatars
content = content.replace('function ProjectMembersAvatars({ projectId }: { projectId: string }) {\n  void projectsLoading;', 'function ProjectMembersAvatars({ projectId }: { projectId: string }) {')

with open('src/App.tsx', 'w') as f:
    f.write(content)
