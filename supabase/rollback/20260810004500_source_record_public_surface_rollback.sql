-- Roll back only the column-level public Source Record restriction.
-- This restores the prior table-wide SELECT grant and should be used only if an audited
-- compatibility requirement proves the narrower public surface is insufficient.

grant select on public.source_records to anon, authenticated;
