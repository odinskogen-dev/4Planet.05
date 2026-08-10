-- 4PLANET PUBLIC PRODUCTION CORE v1 rollback
-- Destructive by design. Run only against an explicitly selected non-production target
-- after confirming that retained records have been exported or intentionally discarded.

drop table if exists public.product_events;
drop table if exists public.public_privacy_requests;
drop table if exists public.public_registrations;
