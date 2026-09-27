-- Archive Alessia, the same way Emily was archived in 004_archive.sql: her
-- potter row and pieces are left untouched, RLS just hides them (and her
-- work) from the public site. Restore by setting archived_at back to null.
update public.potters set archived_at = now() where slug = 'alessia';

-- Add Beverly as a new potter so she shows up in the studio's potter picker.
-- There is no per-potter login (see 003_shared_auth.sql) — she uses the same
-- shared studio password as everyone else once signed in.
insert into public.potters (name, slug)
values ('Beverly', 'beverly');
