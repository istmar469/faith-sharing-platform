create policy "Allow public read access to published pages"
on public.pages
for select
to anon
using (published = true);
