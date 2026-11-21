-- 0031: rename the blog category "archive" to "Church News", and put the Saint Andrew post under Feasts.
-- Safe to run more than once.
update public.categories
   set name = 'Church News', slug = 'church-news',
       seo_title = 'Catholic Church News: the Pope and the Church Worldwide',
       seo_description = 'News of Pope Leo XIV and the Catholic Church around the world, explained for the faithful.'
 where kind = 'blog' and (lower(name) = 'archive' or slug = 'archive');

update public.posts
   set category_id = (select id from public.categories where kind = 'blog' and lower(name) = 'feasts' limit 1)
 where category_id is null
   and title ilike 'Saint Andrew the Apostle%';

-- Check: each blog category and how many posts it has.
select c.name, c.slug, count(p.id) as posts
  from public.categories c left join public.posts p on p.category_id = c.id
 where c.kind = 'blog' group by c.name, c.slug order by c.name;
