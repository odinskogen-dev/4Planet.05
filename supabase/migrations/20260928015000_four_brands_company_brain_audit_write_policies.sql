drop policy if exists four_brands_audit_company_brain_write_insert on public.four_brands_audit_events;
create policy four_brands_audit_company_brain_write_insert
on public.four_brands_audit_events
for insert
to authenticated
with check (
  actor_user_id = auth.uid()
  and object_type = 'company_brain'
  and object_id = company_id::text
  and public.four_brands_member_role(company_id) = any (array['owner','admin','finance','editor'])
  and action = 'twin_state_saved'
);

drop policy if exists four_brands_audit_company_analysis_insert on public.four_brands_audit_events;
create policy four_brands_audit_company_analysis_insert
on public.four_brands_audit_events
for insert
to authenticated
with check (
  actor_user_id = auth.uid()
  and object_type = 'company_analysis'
  and object_id = company_id::text
  and public.four_brands_member_role(company_id) = any (array['owner','admin','finance','editor'])
  and action = 'analysis_synced'
);