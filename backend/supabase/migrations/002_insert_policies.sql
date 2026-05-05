-- Allow authenticated users to insert their own evidence records and mapping activity
create policy "evidence_records: insert own rows"
  on public.evidence_records for insert
  with check (auth.uid() = workspace_id);

create policy "mapping_activity: insert own rows"
  on public.mapping_activity for insert
  with check (auth.uid() = workspace_id);
