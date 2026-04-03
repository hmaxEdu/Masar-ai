with open('src/components/ProjectSettings.tsx', 'r') as f:
    content = f.read()

# I added void projectLoading; but I also have a loading UI that uses projectLoading.
# Wait, why did TS say it's never read?
# Ah, maybe I have a different branch or I didn't actually use it?

loading_ui = """  if (projectLoading) return (
    <div className="flex-1 p-4 sm:p-8 space-y-8 font-['ibm-ar']" dir="rtl">"""

if loading_ui in content:
    # It is used. Why the error?
    # error TS6133: 'projectLoading' is declared but its value is never read.
    # Ah, maybe I have a duplicate declaration?
    pass

with open('src/components/ProjectSettings.tsx', 'w') as f:
    f.write(content)
