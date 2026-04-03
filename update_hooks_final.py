import re

with open('src/hooks/use-masar.ts', 'r') as f:
    content = f.read()

# Helper to wrap hook return and state
def wrap_hook_final(hook_name, initial_val, data_type, var_name):
    global content

    # State
    old_state = f"const [{var_name}, set{var_name[0].upper()}{var_name[1:]}] = useState<{data_type}{' | null' if 'null' in initial_val else ''}>({initial_val});"
    new_state = f"const [{var_name}, set{var_name[0].upper()}{var_name[1:]}] = useState<{data_type}{' | null' if 'null' in initial_val else ''}>({initial_val});\n  const [loading, setLoading] = useState(true);"

    content = content.replace(old_state, new_state)

    # fetch call
    content = content.replace(f"set{var_name[0].upper()}{var_name[1:]}(data", f"set{var_name[0].upper()}{var_name[1:]}(data;\n      setLoading(false);")
    # Actually setX(data) is sometimes setX(data as X)
    content = re.sub(rf"set{var_name[0].upper()}{var_name[1:]}\(data(.*?)\);", rf"set{var_name[0].upper()}{var_name[1:]}(data\1);\n      setLoading(false);", content)

    # fetch execution
    content = content.replace(f"fetch{hook_name[3:] if hook_name != 'useProjects' else 'Projects'}();", f"setLoading(true);\n    fetch{hook_name[3:] if hook_name != 'useProjects' else 'Projects'}();")

    # Early return in useEffect
    content = re.sub(rf"set{var_name[0].upper()}{var_name[1:]}\(null\);", f"set{var_name[0].upper()}{var_name[1:]}(null);\n      setLoading(false);", content)

    # return
    content = content.replace(f"return {var_name};", f"return {{ {var_name}, loading }};")

wrap_hook_final("useProjects", "[]", "Project", "projects")
wrap_hook_final("useProject", "null", "Project", "project")
wrap_hook_final("useTasks", "[]", "Task", "tasks")
wrap_hook_final("useTopLevelTasks", "[]", "Task", "tasks")
wrap_hook_final("useTask", "null", "Task", "task")

with open('src/hooks/use-masar.ts', 'w') as f:
    f.write(content)
