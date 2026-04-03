import re

with open('src/hooks/use-masar.ts', 'r') as f:
    content = f.read()

# useProjects
content = content.replace(
    'const [data, setData] = useState<Project[]>([]);\n  const [loading, setLoading] = useState(true);',
    'const [projects, setProjects] = useState<Project[]>([]);\n  const [loading, setLoading] = useState(true);'
)
content = content.replace('if (data) setData(data as Project[]);', 'if (data) setProjects(data as Project[]);')
content = content.replace('return { data, loading };', 'return { projects, loading };')

# useTasks
content = content.replace(
    'const [data, setData] = useState<Task[]>([]);\n  const [loading, setLoading] = useState(true);',
    'const [tasks, setTasks] = useState<Task[]>([]);\n  const [loading, setLoading] = useState(true);'
)
content = content.replace('if (data) setData(data);', 'if (data) setTasks(data);')
# Special case for return
content = content.replace('return { data, loading };', 'return { tasks, loading };')

# useTask
content = content.replace(
    'const [data, setData] = useState<Task | null>(null);\n  const [loading, setLoading] = useState(true);',
    'const [task, setTask] = useState<Task | null>(null);\n  const [loading, setLoading] = useState(true);'
)
content = content.replace('if (data) setData(data);', 'if (data) setTask(data);')
content = content.replace('setData(null);', 'setTask(null);')
content = content.replace('return { data, loading };', 'return { task, loading };')

# useProject (singular)
content = content.replace(
    'const [data, setData] = useState<Project | null>(null);\n  const [loading, setLoading] = useState(true);',
    'const [project, setProject] = useState<Project | null>(null);\n  const [loading, setLoading] = useState(true);'
)
content = content.replace('if (data) setData(data as Project);', 'if (data) setProject(data as Project);')
content = content.replace('setData(null);', 'setProject(null);')
content = content.replace('return { data, loading };', 'return { project, loading };')

with open('src/hooks/use-masar.ts', 'w') as f:
    f.write(content)
