-- CAP-PLATFORM-01: authenticated per-user funding-workspace state.
-- Existing 4PLANET OS project; this is not an actor/programme/capital truth database.
-- No alteration of any pre-existing table. Every row is owned by the canonical 4PLANET ID auth.users account.
CREATE TABLE IF NOT EXISTS public.finance_user_state (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 app_state jsonb NOT NULL DEFAULT '{"active":"4planet","workspaces":{"4planet":{"projects":[],"pipeline":[]},"personal":{"projects":[],"pipeline":[]}}}'::jsonb,
 revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT finance_user_state_shape CHECK (
  jsonb_typeof(app_state)='object'
  AND jsonb_typeof(app_state -> 'workspaces')='object'
  AND jsonb_typeof(app_state -> 'workspaces' -> '4planet' -> 'pipeline')='array'
  AND jsonb_typeof(app_state -> 'workspaces' -> 'personal' -> 'pipeline')='array'
  AND jsonb_typeof(app_state -> 'workspaces' -> '4planet' -> 'projects')='array'
  AND jsonb_typeof(app_state -> 'workspaces' -> 'personal' -> 'projects')='array'
  AND app_state ->> 'active' IN ('4planet','personal')
  AND pg_column_size(app_state) <= 1000000
 )
);
ALTER TABLE public.finance_user_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.finance_user_state FROM anon, PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_user_state TO authenticated;
DROP POLICY IF EXISTS finance_user_state_owner_select ON public.finance_user_state;
DROP POLICY IF EXISTS finance_user_state_owner_insert ON public.finance_user_state;
DROP POLICY IF EXISTS finance_user_state_owner_update ON public.finance_user_state;
DROP POLICY IF EXISTS finance_user_state_owner_delete ON public.finance_user_state;
CREATE POLICY finance_user_state_owner_select ON public.finance_user_state FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY finance_user_state_owner_insert ON public.finance_user_state FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY finance_user_state_owner_update ON public.finance_user_state FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE POLICY finance_user_state_owner_delete ON public.finance_user_state FOR DELETE TO authenticated USING (user_id=auth.uid());
COMMENT ON TABLE public.finance_user_state IS '4PLANET Finance: only user-owned private UI decisions, pipeline and project drafts. Actor and funding facts remain in BRAIN/x500. No multi-user organisation membership is implied.';
