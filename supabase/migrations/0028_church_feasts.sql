-- 0028: feasts of Our Lady, the Guardian Angels and events such as the Chair of Saint Peter are Church feasts, not saints.
-- Corrects any copies already saved by the daily auto-fill. Safe to run more than once.
alter table public.saints add column if not exists kind text not null default 'saint';
update public.saints set kind = 'celebration' where slug in (
  'mary-the-holy-mother-of-god',
  'our-lady-of-lourdes',
  'our-lady-of-fatima',
  'the-visitation-of-the-blessed-virgin-mary',
  'our-lady-of-mount-carmel',
  'the-assumption-of-the-blessed-virgin-mary',
  'the-queenship-of-the-blessed-virgin-mary',
  'the-nativity-of-the-blessed-virgin-mary',
  'the-most-holy-name-of-mary',
  'our-lady-of-sorrows',
  'our-lady-of-the-rosary',
  'the-presentation-of-the-blessed-virgin-mary',
  'the-immaculate-conception-of-the-blessed-virgin-mary',
  'our-lady-of-loreto',
  'our-lady-of-guadalupe',
  'the-holy-guardian-angels',
  'the-conversion-of-saint-paul',
  'the-chair-of-saint-peter',
  'the-nativity-of-saint-john-the-baptist',
  'the-passion-of-saint-john-the-baptist'
);
notify pgrst, 'reload schema';
