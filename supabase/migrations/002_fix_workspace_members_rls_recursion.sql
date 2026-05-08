-- Fix infinite recursion in workspace_members RLS policies
-- The self-referential subquery in wm_select_member causes a recursion loop:
-- workspaces_select_member → workspace_members → wm_select_member → workspace_members → ...
-- Solution: use direct user_id = auth.uid() for SELECT, and a SECURITY DEFINER
-- helper function for INSERT/DELETE to avoid the same recursion pattern.

DROP POLICY IF EXISTS wm_select_member ON workspace_members;
DROP POLICY IF EXISTS wm_insert_owner_admin ON workspace_members;
DROP POLICY IF EXISTS wm_delete_owner_admin ON workspace_members;

-- SELECT: each user sees only their own membership rows (no self-referential subquery)
CREATE POLICY wm_select_member ON workspace_members
  FOR SELECT USING (user_id = auth.uid());

-- Helper function: bypasses RLS to check role without triggering recursion
CREATE OR REPLACE FUNCTION is_workspace_owner_or_admin(ws_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$;

CREATE POLICY wm_insert_owner_admin ON workspace_members
  FOR INSERT WITH CHECK (is_workspace_owner_or_admin(workspace_id));

CREATE POLICY wm_delete_owner_admin ON workspace_members
  FOR DELETE USING (is_workspace_owner_or_admin(workspace_id));
