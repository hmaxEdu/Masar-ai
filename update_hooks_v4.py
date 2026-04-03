import re

with open('src/hooks/use-masar.ts', 'r') as f:
    content = f.read()

# Reverting to returning just the data but keeping the loading state in a separate hook if needed?
# No, let's just use the original return type but with a loading state that components can opt-in.
# Actually, the user wants loading skeletons.

# Let's use a more standard pattern: useProjects() returns Project[]
# And if we want loading, we use another hook or we return a tuple/object.

# I will stick to returning the data directly to minimize breakage,
# and if I need loading state I will add it as an optional return or separate.
# Actually, let's just go back to the original hook signature and maybe find another way?
# No, I already modified many files.

# THE FIX: I will ensure that the destructuring in components matches the hook return.
# I will use: return { projects, loading }
# and in components: const { projects, loading: projectsLoading } = useProjects(...)

content = content.replace('return { projects, loading };', 'return { projects, loading };')

with open('src/hooks/use-masar.ts', 'w') as f:
    f.write(content)
