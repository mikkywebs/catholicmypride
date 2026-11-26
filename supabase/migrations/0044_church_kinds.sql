-- 0044: each church is a parish, a special jurisdiction or a chaplaincy. Only parishes are counted
-- as "parishes" on the directory; the others are listed apart. Marks Owerri's 38 special
-- jurisdictions and 18 chaplaincies (from the archdiocesan directory). Safe to run more than once.

alter table public.churches add column if not exists kind text not null default 'parish';
alter table public.churches drop constraint if exists churches_kind_check;
alter table public.churches add constraint churches_kind_check check (kind in ('parish', 'special', 'chaplaincy'));

update public.churches c set kind = v.kind
from (values
  ($cmp$All Saints', Orji$cmp$, 'special'),
  ($cmp$All Saints, Federal Polytechnic Nekede (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$Ave Maria, Egbu$cmp$, 'special'),
  ($cmp$C. K. C, Uzoagba (Umuagwa Ebikoro)$cmp$, 'special'),
  ($cmp$Christ the King, (Alvan) Aifue (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$Christ the King, Avu (Mechanic Village)$cmp$, 'special'),
  ($cmp$Christ the King, Naze (Ezeakiri)$cmp$, 'special'),
  ($cmp$Christ the King, Obibiezena (Ogbeke)$cmp$, 'special'),
  ($cmp$Church of Nativity, New Owerri (Imo-H.e. Rd 3 Extension)$cmp$, 'special'),
  ($cmp$Church of Presentation, New Owerri (Umuguma Imo H.E.)$cmp$, 'special'),
  ($cmp$Church of the Resurrection, New Owerri (Site & Services)$cmp$, 'special'),
  ($cmp$Claretian Martyrs University Chapel$cmp$, 'chaplaincy'),
  ($cmp$Government House Chaplaincy$cmp$, 'chaplaincy'),
  ($cmp$Holy Rosary Hospital Chaplaincy, Emekuku$cmp$, 'chaplaincy'),
  ($cmp$Holy Spirit, Nwaorieubi$cmp$, 'special'),
  ($cmp$Holy Trinity, Irete$cmp$, 'special'),
  ($cmp$Holy Trinity, Naze (Umuakali)$cmp$, 'special'),
  ($cmp$Holy Trinity, University of Agriculture Umuagwo (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$Holy Trinity, Uwaorie Agwa$cmp$, 'special'),
  ($cmp$Holy Trinity, Imo State Polytechnic Umuagwo (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$Sacred Heart, Atta (Umuhu)$cmp$, 'special'),
  ($cmp$Sacred Heart, Owerri (Works Layout)$cmp$, 'special'),
  ($cmp$Ss. Peter & Paul, Ihitte-Isi-Mbieri (Umuonyeali)$cmp$, 'special'),
  ($cmp$St. Albert's, Agbala (Emeke)$cmp$, 'special'),
  ($cmp$St. Anthony of Padua, Ubomiri (Umuocha-Amawuihe)$cmp$, 'special'),
  ($cmp$St. Anthony's, Irete$cmp$, 'special'),
  ($cmp$St. Anthony's, Nekede (Umudibia)$cmp$, 'special'),
  ($cmp$St. Anthony's, Uzoagba (Umueme Ebikoro)$cmp$, 'special'),
  ($cmp$St. Eugene's, Ohii (Ngerem Estate)$cmp$, 'special'),
  ($cmp$St. Francis of Assisi, Uratta (Ebikoro-Umuoba)$cmp$, 'special'),
  ($cmp$St. Francis, Obinze$cmp$, 'special'),
  ($cmp$St. Francis, Owerri Sports Council (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$St. John Leonardi's, Amakohia Uratta$cmp$, 'special'),
  ($cmp$St. John the Beloved, Graceland H.E. Owerri$cmp$, 'special'),
  ($cmp$St. John-Bosco's Government College Owerri (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$St. Joseph's Chaplaincy, IMSU$cmp$, 'chaplaincy'),
  ($cmp$St. Joseph's, Imo Palm Plantation (Adapalm) (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$St. Joseph's, Nekede (Umuoma)$cmp$, 'special'),
  ($cmp$St. Joseph's, Owerri, 93 Emmanuel Col. Layout$cmp$, 'special'),
  ($cmp$St. Jude's, Obinze Military Barrack's (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$St. Lazarus, Owerri Prisons (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$St. Mark's, Orji$cmp$, 'special'),
  ($cmp$St. Mary's, Nekede/Ihiagwa Police Training School (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$St. Mathew's, Imerienwe (Umunam)$cmp$, 'special'),
  ($cmp$St. Michael's, Shell-Camp Police Chaplaincy$cmp$, 'chaplaincy'),
  ($cmp$St. Nicholas Umuorii Uratta$cmp$, 'special'),
  ($cmp$St. Patrick's, Uratta (Umuori)$cmp$, 'special'),
  ($cmp$St. Paul's, Federal Housing Egbu Road (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$St. Peter's, Ohaji (Asaa)$cmp$, 'special'),
  ($cmp$St. Peter's, Owerri (Works Layout)$cmp$, 'special'),
  ($cmp$St. Philip's, Mbieri (Achi)$cmp$, 'special'),
  ($cmp$St. Pius X, Ezi-Orsu$cmp$, 'special'),
  ($cmp$St. Raphael's, Federal Medical Centre (Chaplaincy)$cmp$, 'chaplaincy'),
  ($cmp$St. Stephen's, Emii (Mgbaghiri)$cmp$, 'special'),
  ($cmp$St. Theresa's, Obiangwu$cmp$, 'special'),
  ($cmp$St. Thomas Aquinas' FUTO (Chaplaincy)$cmp$, 'chaplaincy')
) as v(name, kind)
join public.dioceses d on d.country = 'Nigeria' and lower(d.name) = 'owerri'
where c.diocese_id = d.id and lower(c.name) = lower(v.name);

-- Elsewhere, names that say chaplaincy are marked too.
update public.churches set kind = 'chaplaincy' where kind = 'parish' and name ~* '\mchaplaincy\M';

-- Check: Owerri should show 162 parish, 38 special, 18 chaplaincy.
select c.kind, count(*) from public.churches c join public.dioceses d on d.id = c.diocese_id
where d.country = 'Nigeria' and lower(d.name) = 'owerri' group by c.kind order by c.kind;
