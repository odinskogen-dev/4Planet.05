-- Correct multi-hop blocking dependency cycle detection.
begin;

create or replace view cns.v_dependency_cycles with (security_invoker=true) as
with recursive walk(origin,node,path,cycle,depth) as (
  select d.project_id,
         d.depends_on_project_id,
         array[d.project_id,d.depends_on_project_id]::text[],
         (d.depends_on_project_id=d.project_id),
         1
  from cns.dependencies d
  where d.state='OPEN' and d.dependency_type='BLOCKING' and d.depends_on_project_id is not null
  union all
  select w.origin,
         d.depends_on_project_id,
         w.path||d.depends_on_project_id,
         (d.depends_on_project_id=any(w.path)),
         w.depth+1
  from walk w
  join cns.dependencies d on d.project_id=w.node
  where not w.cycle
    and w.depth<100
    and d.state='OPEN'
    and d.dependency_type='BLOCKING'
    and d.depends_on_project_id is not null
)
select distinct origin as project_id,node,path
from walk
where cycle=true;

commit;
