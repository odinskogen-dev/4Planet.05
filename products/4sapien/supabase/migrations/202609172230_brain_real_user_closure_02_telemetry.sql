-- BRAIN REAL-USER CLOSURE 02 — telemetry policy
-- Uses the existing 4BRANDS audit stream; no new telemetry/truth table.

drop policy if exists four_brands_audit_brain_insert on public.four_brands_audit_events;
create policy four_brands_audit_brain_insert
on public.four_brands_audit_events
for insert
to authenticated
with check (
  actor_user_id = auth.uid()
  and object_type = 'brain_profile'
  and object_id = company_id::text
  and public.four_brands_member_role(company_id) is not null
  and action in (
    'brain_context_added',
    'brain_changed',
    'brain_asked',
    'brain_grounded_answer',
    'brain_learning_proposed',
    'brain_corrected',
    'brain_removed'
  )
);
