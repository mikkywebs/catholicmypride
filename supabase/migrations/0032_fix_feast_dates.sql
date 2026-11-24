-- 0032: saints or feasts opened with "Edit this page" before 24 Nov 2026 were saved with 1 January as their date.
-- This puts each one back on its own feast day this year (from its "Feast day" text, e.g. "18 November").
-- Safe to run more than once. Real 1 January feasts are left alone.
update public.saints
   set show_on = to_date(feast_label || ' ' || extract(year from current_date)::int, 'FMDD FMMonth YYYY')
 where show_on = make_date(extract(year from current_date)::int, 1, 1)
   and feast_label ~* '^\d{1,2} (january|february|march|april|may|june|july|august|september|october|november|december)$'
   and feast_label !~* '^1 january$';

-- Check: should list The Dedication of the Basilicas of Saints Peter and Paul on 2026-11-18.
select name, feast_label, show_on from public.saints where slug like 'the-dedication-of-the-basilicas%';
