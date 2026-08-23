-- SHADOW ROLLBACK ONLY.
-- Safe because CNS remains isolated in its own private schema until cutover.
-- This does not touch the pre-existing public truth spine, Drive BRAIN, Git history or prototypes.

drop schema if exists cns cascade;
