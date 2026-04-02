1. Fix Realtime channel collisions in `src/hooks/use-masar.ts`.
   - Append a unique suffix to each channel name in hooks (`useProjects`, `useTasks`, `useTopLevelTasks`, `useChildTasks`, `useTask`, `useDependencies`, `useProjectMembers`) to prevent "cannot add postgres_changes callbacks after subscribe" error.
2. Add guards to hooks in `src/hooks/use-masar.ts` to prevent invalid API calls.
   - Specifically check for empty `taskId` in `useDependencies`, `useTask`, etc.
3. Fix the relationship between `project_members` and `profiles` in the database.
   - Add a foreign key constraint from `project_members(user_id)` to `profiles(id)` to allow joining in Supabase queries.
4. Complete pre commit steps to ensure proper testing and verification.
5. Submit the changes.
