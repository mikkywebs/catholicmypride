-- Catholic My Pride: extra social links, fixed site name, province lists per country,
-- deanery/zone lists per diocese. Safe to run more than once.
alter table public.settings add column if not exists extra_social jsonb not null default '[]'::jsonb;
update public.settings set site_name = 'Catholic My Pride', tagline = 'Apostolate';

alter table public.directory_regions add column if not exists province_list text[] not null default '{}';
alter table public.dioceses add column if not exists deaneries text[] not null default '{}';

-- Start the lists from what is already entered.
update public.dioceses d set deaneries = coalesce((
  select array_agg(distinct c.deanery order by c.deanery) from public.churches c
  where c.diocese_id = d.id and c.deanery is not null and c.deanery <> ''), '{}')
where d.deaneries = '{}';

insert into public.directory_regions (continent, country, province_list)
select continent, country, array_agg(distinct province order by province)
from public.dioceses where province is not null and province <> ''
group by continent, country
on conflict (lower(country), lower(coalesce(province, '')))
do update set province_list = case when directory_regions.province_list = '{}' then excluded.province_list else directory_regions.province_list end;
notify pgrst, 'reload schema';
