
# Masar 🚀

Masar is a modern, collaborative project and task management workspace built on React 19, TypeScript, and Supabase. Engineered with an agentic workflow design, Masar integrates context-aware AI agents directly into your projects, allowing teams to automate task breakdowns, analyze delivery bottlenecks, and coordinate real-time progress.

---

## 🛠️ Tech Stack & Architecture

Masar utilizes a highly optimized client-server architecture designed for sub-millisecond local latency combined with instant global synchronization.

*   **Frontend Framework:** React 19, TypeScript, Vite
*   **Styling & Design System:** Tailwind CSS, `shadcn/ui`, Custom WebGL Background (animated glass-morphism)
*   **State & Real-time Sync:** Supabase Postgres Realtime Subscriptions (WebSockets)
*   **Local Storage & Migration:** Dexie.js (for offline fallback and automated DB migrations to Supabase)
*   **Interactive Graphics:** Framer Motion, Custom SVG Pipeline Graphs, Recharts (Data Visualization)
*   **Rich Text Editor:** TipTap (ProseMirror-based WYSIWYG)

---

## ✨ Key Capabilities

### 1. Unified Multi-View Workspace
Seamlessly toggle between different layouts without losing filter states or context:
*   **Dashboard View:** Multi-dimensional analytics tracking active team workloads, task status distributions, and priorities via responsive `recharts` [1, 2].
*   **List View:** A tree-structured, searchable, and sortable spreadsheet-like view that visualizes deep task hierarchies and subtask progress bars [2].
*   **Board View:** A responsive drag-and-drop Kanban interface powered by `@dnd-kit` with touch support, auto-scroll, and optimistic UI transitions.

### 2. Context-Aware AI Agent (`src/components/AIAgent.tsx`)
A floating AI assistant connected to your active workspace:
*   **NDJSON Streaming Parser:** Utilizes custom chunked parsers to typographically stream AI agent responses as they generate [2].
*   **Agentic Actions:** The agent can autonomously execute structured workspace actions mid-stream, including task creation, dependency linking, priority adjustment, and team assignments [2].
*   **Multimodal Input:** Supports local image attachments and screenshot captures sent alongside text prompts [2].

### 3. Symmetrical Dependency Graphs
Prevent chaotic workflows with mathematical constraints:
*   **Circular Dependency Prevention:** Employs graph traversal algorithms to prevent circular dependencies before they can be committed to the database.
*   **Automatic Propagation:** Automatically flags dependent tasks as `Blocked` if their prerequisite blockers are incomplete, and auto-unlocks them to `To Do` once blockers are resolved.

### 4. Interactive Pipeline Visualizer (`src/components/IntegrationGraph.tsx`)
A highly polished, responsive SVG-based glassmorphism tree graph that dynamically showcases your orchestration pipeline, flowing data particles from the central engine down to core technology hubs like React, Supabase, and Vite.

---

## 📁 Directory Structure

```
Masar/
├── src/
│   ├── assets/
│   │   └── fonts/                 # Custom typefaces (DM Sans)
│   ├── components/
│   │   ├── Dashboard/             # Chart components (Status, Workload, KPIs) [1]
│   │   ├── TaskDetail/            # Nested subtasks, description editors, and metadata [1]
│   │   ├── ai-elements/           # Reusable atomic UX units for AI interactions [1]
│   │   ├── AIAgent.tsx            # Floating agent controller & stream consumer [1]
│   │   ├── BoardView.tsx          # Kanban board layout with DnD [1]
│   │   ├── Footer.tsx             # System-operational monitoring footer [1]
│   │   ├── IntegrationGraph.tsx   # Custom animated SVG pipeline component [1]
│   │   ├── LandingPage.tsx        # High-fidelity entrance page [1]
│   │   └── ListView.tsx           # Collapsible tree-list spreadsheet [1]
│   ├── hooks/
│   │   └── use-masar.ts           # Global reactive Supabase state hooks [1]
│   ├── lib/
│   │   ├── ai.ts                  # Edge function API wrappers and stream handlers [1]
│   │   ├── db.ts                  # Offline IndexedDB/Dexie schema fallback [1]
│   │   └── supabase.ts            # Client initializer and types [1]
│   ├── App.tsx                    # Route definitions and global dialog modals [1]
│   └── main.tsx                   # App mounting & context initializers [1]
```

---

## 🧬 Database & AI Edge Functions

The backend is powered by **Supabase PostgreSQL** and **Edge Functions**, orchestrating LLM interactions with direct database access.

### Core Tables
*   `projects`: Stores workspace metadata, ownership, and privacy constraints.
*   `project_members`: Coordinates workspace access roles (`owner`, `admin`, `editor`, `viewer`).
*   `tasks`: Manages individual work items, assignees, priorities, and parent-child hierarchy relationships.
*   `dependencies`: Maps blockages between tasks (`blocking_task_id` and `blocked_task_id`).

### Dedicated Edge Functions (`src/lib/ai.ts`)
*   `agent-chat`: Consumes multi-turn messages to drive the active agent stream and parse tool call triggers [2].
*   `generate-subtasks`: Evaluates a high-level task and returns clean, structured arrays of child task candidates [2].
*   `analyze-project`: Aggregates active workspace data to deliver immediate project insights and bottleneck summaries [2].
*   `ai-planner`: Drafts comprehensive, multi-phase project roadmaps from simple plain-text prompts [2].

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [pnpm](https://pnpm.io/) (Recommended) or `npm`
*   A active [Supabase](https://supabase.com) project with SQL schemas set up.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/masar.git
    cd masar
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=https://your-project-ref.supabase.co
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  **Run the local development server:**
    ```bash
    pnpm dev
    ```

5.  **Build for production:**
    ```bash
    pnpm build
    ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.
