-- 4PLANET CNS TOTAL SHADOW ROLLBACK
-- PRE-CUTOVER ONLY. This rollback deletes only the isolated CNS shadow schema.
-- It does not touch Drive BRAIN, Founder Control, Prototype SAFE, Git history,
-- public/prod schemas, production deployment state, or historical branches.

begin;

drop schema if exists cns cascade;

commit;
