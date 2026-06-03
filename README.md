
# Masar 🚀 | AI-Driven Project & Task Management

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Live Demo:** [Link to your live Vercel/Netlify deployment]
> **Video Walkthrough:** [Link to YouTube/Loom video]

Masar is a modern, highly interactive project management platform that brings real AI automation to enterprise workflows. It combines a robust collaborative workspace with streaming, context-aware AI agents capable of autonomously generating task breakdowns, analyzing bottlenecks, and executing UI actions.

![Masar Hero Screenshot](link-to-your-screenshot.png)

## ✨ Key Features

- **Multi-View Workspace:** Seamlessly switch between drag-and-drop Kanban boards (`@dnd-kit`), detailed List views, and real-time analytical Dashboards (`recharts`).
- **Context-Aware AI Agent:** A floating AI assistant utilizing Edge Functions to stream responses, autonomously create tasks, manage dependencies, and assign team members based on project context.
- **Smart Task Breakdowns:** Leverage AI to instantly generate actionable sub-tasks from broad project descriptions.
- **Real-Time Collaboration:** Powered by Supabase WebSockets, enabling instantaneous sync across all connected clients for tasks, dependencies, and team roles.
- **Advanced State Management:** Optimistic UI updates ensure zero-latency interactions (e.g., drag-and-drop) while background network requests sync with the database.
- **Modern UI/UX:** Built with Tailwind CSS, `shadcn/ui`, and Framer Motion, featuring rich-text editing (TipTap), dark mode, and a custom WebGL glass-morphism background.

## 🛠️ Technical Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling & UI:** Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons
- **State & Data Fetching:** React Hooks, Supabase Realtime Subscriptions
- **Backend & Auth:** Supabase (PostgreSQL, Edge Functions, Authentication)
- **Utilities:** `@dnd-kit` (drag-and-drop), `recharts` (data viz), `TipTap` (rich text), `Dexie.js` (local storage/migration)

## 🧠 Architectural Highlights

- **AI Streaming Integration:** Implemented custom NDJSON streaming parsers to handle real-time chunked responses from AI edge functions, allowing the UI to type out responses and trigger internal tools (like creating tasks) mid-stream.
- **Optimistic UI:** Board interactions use optimistic state updates. When a user drags a task card to a new column, the UI updates instantly, while the database syncs asynchronously, providing a native-app feel.
- **Complex Dependency Graph:** Built a custom dependency management system preventing circular dependencies, automatically blocking/unblocking tasks based on the completion status of parent requirements.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Project (with Edge Functions configured for AI)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/masar.git
   cd masar
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 👨‍💻 Author
**[Your Name]** - *CS Student & Front-End Developer*
[LinkedIn](your-linkedin) • [Portfolio](your-portfolio)

