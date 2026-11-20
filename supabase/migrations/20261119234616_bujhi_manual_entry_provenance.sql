-- Bujhi manual haemoglobin entry (OCR failed or found nothing) sends raw_value = ''.
-- The observation note must not claim OCR read it. Only the note literal changes;
-- CREATE OR REPLACE keeps owner, SECURITY DEFINER, search_path and grants.
-- Rollback: same block with the two literals swapped.
begin;
do $$
declare
  fn regprocedure := 'public.bujhi_commit_reviewed_hemoglobin(uuid,uuid,text,text,text,text,text,text,date)'::regprocedure;
  def text := pg_get_functiondef(fn);
  old_note text := '''Bujhi local OCR; reviewed by mother''';
  new_note text := 'case when p_raw_value = '''' then ''Bujhi manual entry from report image; reviewed by mother'' else ''Bujhi local OCR; reviewed by mother'' end';
begin
  if position(old_note in def) = 0 then
    raise exception 'expected OCR note literal in %', fn;
  end if;
  execute replace(def, old_note, new_note);
  if position('manual entry from report image' in pg_get_functiondef(fn)) = 0 then
    raise exception 'manual note not applied in %', fn;
  end if;
end;
$$;
commit;
