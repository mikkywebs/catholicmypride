# Builds supabase/migrations/0041_lagos_parishes.sql: regions, deaneries and parishes of the Archdiocese of Lagos.
# Regions and deaneries: lagosarchdiocese.org/our-parishes (deanery filter). Parishes and their deaneries: the
# admin's own list (local knowledge). Mass times for St Catherine, Alakuko: its page on lagosarchdiocese.org.
import pathlib

REGIONS = {
  'Ikeja Region': ['Agege', 'Ikeja', 'Ijede', 'Ikorodu', 'Ipaja', 'Maryland'],
  'Lekki Region': ['Ajah', 'Epe', 'Lekki'],
  'Badagry Region': ['Badagry', 'Festac', 'Iba', 'Ijanikin', 'Ilemba', 'Satellite'],
  'Lagos Region': ['Apapa', 'Isolo', 'Lagos Island', 'Surulere', 'Yaba'],
}
# deanery → [(parish name, address)]
P = {
 'Agege': [('Catholic Church of Presentation, Abule-Egba', 'Abule-Egba'), ('Our Lady Health of the Sick Catholic Church, Onipetesi', 'Onipetesi'), ('St. Catherine Catholic Church, Alakuko', 'Alakuko'), ('St. Christopher Catholic Church, Ijaiye', 'Ijaiye'), ('St. Christopher Catholic Church, Oke-Odo', 'Oke-Odo'), ('St. Cyprian Catholic Church, Oko-Oba', 'Oko-Oba, Agege'), ('St. Kizito Catholic Church, Iju', 'Iju'), ('St. Raphael Catholic Church, Ajegunle-Ilo', 'Ajegunle-Ilo'), ('St. Rita Catholic Church, Obadeyi', 'Obadeyi'), ('St. Sabina Catholic Church, Idimangoro', 'Idimangoro'), ('St. Theresa Catholic Church, Ifako', 'Ifako, Agege')],
 'Ikeja': [('St. Leo Catholic Church, Ikeja', 'Toyin Street, Ikeja'), ('Catholic Church of Presentation, Ikeja GRA', 'GRA, Ikeja'), ('Blessed Tansi Catholic Church, Agidingbi', 'Agidingbi, Ikeja'), ('Catholic Church of the Ascension, Airport Road', 'Airport Road, Ikeja'), ('St. Peter Claver Catholic Church, Ajao Estate', 'Ajao Estate'), ('St. John the Evangelist Catholic Church, Ladipo', 'Ladipo'), ('St. Jude Catholic Church, Mafoluku', 'Mafoluku'), ('Our Lady of the Holy Rosary Catholic Church, Ogba', 'Ogba'), ('St. Timothy Catholic Church, Ojodu', 'Ojodu'), ('Holy Spirit Catholic Church, Omole', 'Omole'), ('St. Francis Catholic Church, Oregun', 'Oregun'), ('St. Martin De Porres Catholic Church, NAFRC Oshodi', 'NAFRC, Oshodi')],
 'Ijede': [('Catholic Church of Corpus Christi, Egbin', 'Egbin'), ('Blessed Virgin Mary Catholic Church, Elepe', 'Elepe')],
 'Ikorodu': [('St. Augustine Catholic Church, Ikorodu', 'Ikorodu'), ('All Saints Catholic Church, Imota', 'Imota'), ('Archangels Catholic Church, Agbede', 'Agbede'), ('Army Chaplaincy Catholic Church, Odogunyan', 'Odogunyan')],
 'Ipaja': [('Catholic Church of the Archangels, Bada Ayobo', 'Bada, Ayobo'), ('Catholic Church of Annunciation, Ishefun', 'Ishefun')],
 'Maryland': [('Sacred Heart Catholic Church, Ojota', 'Ojota'), ('Catholic Church of Presentation, Agiliti (Mile 12)', 'Agiliti, Mile 12')],
 'Ajah': [('Catholic Church of Annunciation, Abraham Adesanya', 'Abraham Adesanya, Ajah'), ('Our Lady Mother and Queen Catholic Church, Badore', 'Badore, Ajah'), ('St. Peter Catholic Church, Ado Langbasa', 'Ado, Langbasa')],
 'Epe': [('St. Theresa Catholic Church, Epe', 'Awolowo Way, Oke-Oyinbo, Epe'), ('Immaculate Conception Catholic Church, Ibonwon', 'Ibonwon, Epe'), ('Regina Pacis Catholic Church, Sangotedo', 'Sangotedo'), ('Our Lady Mother of Mercy Catholic Church, Abijo', 'Abijo'), ('Catholic Church of the Assumption, Awoyaya', 'Awoyaya'), ('Regina Caeli Catholic Church, Bogije', 'Bogije'), ('Our Lady Queen of the Apostles Catholic Church, Lakowe', 'Adeba, Lakowe'), ('St. Pio Catholic Church, Ayeteju', 'Ayeteju, Ibeju-Lekki'), ('Our Lady of the Holy Rosary Catholic Church, Ibeju-Lekki', 'Ibeju-Lekki')],
 'Lekki': [('Ss. Philip and James Catholic Church, Lekki', 'Lekki'), ('Church of Divine Mercy, Lekki Phase 1', 'Lekki Phase 1'), ('Church of the Transfiguration, VGC', 'Victoria Garden City (VGC)'), ('Church of the Epiphany, Ologolo', 'Ologolo, Lekki'), ('St. Theresa Catholic Church, Ikota', 'Ikota, Lekki'), ('Our Lady Star of the Sea Catholic Church, Northern Foreshore', 'Northern Foreshore, Lekki'), ('Ave Maria Catholic Church Grotto, Lekki', 'Lekki')],
 'Badagry': [('St. Joseph Catholic Church, Aradagun', 'Aradagun, Badagry'), ('Blessed Tansi Catholic Church, Magbon', 'Magbon, Badagry')],
 'Festac': [('Catholic Church of Presentation, Festac 23 Road', '23 Road, Festac Town'), ('Catholic Church of Annunciation, Festac 7th Avenue', '7th Avenue, Festac Town'), ('Catholic Church of Nativity, Festac 6th Avenue', '6th Avenue, Festac Town')],
 'Iba': [('St. Augustine Catholic Church, Iba', 'Iba'), ('All Saints Military Chaplaincy, Ojo', 'Post-Housing, Ojo Cantonment'), ('Catholic Church of the Assumption, Igbo-Elerin', 'Igbo-Elerin')],
 'Ilemba': [('Holy Redeemer Catholic Church, Shibiri', 'Shibiri')],
 'Satellite': [('St. Thomas Aquinas Catholic Church, Okokomaiko', 'Okokomaiko')],
 'Apapa': [('Catholic Church of the Immaculate Conception, Snake Island', 'Snake Island, Apapa')],
 'Isolo': [('Catholic Church of Annunciation, Ejigbo (Orioke)', 'Orioke, Ejigbo')],
 'Lagos Island': [('Holy Cross Cathedral, Lagos Island', '19 Catholic Mission Street, Lagos Island'), ('Church of the Assumption, Falomo', 'Falomo, Ikoyi'), ('St. Charles Borromeo Catholic Church, Victoria Island', '1004 Estate, Victoria Island'), ('Our Lady of Perpetual Help Catholic Church, Victoria Island', 'Victoria Island'), ('St. Michael Catholic Church, Lafiaji', 'Lafiaji, Lagos Island'), ('St. Patrick Catholic Church, Idumagbo', 'Idumagbo, Lagos Island'), ('St. Joseph Catholic Church, Elegbata', 'Elegbata, Lagos Island'), ('St. Theresa Military Church, Bonny Cantonment', 'Bonny Cantonment, Victoria Island'), ("St. Joseph's Military Church, Dodan Barracks", 'Dodan Barracks, Ikoyi')],
 'Surulere': [('Our Lady Queen of Nigeria Catholic Church, Surulere', 'Clegg Street, Surulere')],
 'Yaba': [('St. Dominic Catholic Church, Yaba', 'Yaba'), ('St. Agnes Catholic Church, Maryland', 'Maryland'), ('St. Andre du Lac Catholic Church, Yaba', 'Yaba')],
}
MASS = {'St. Catherine Catholic Church, Alakuko': 'Sunday: 7:00am, 9:30am\nMonday to Friday (except Thursday): 12:30pm, 6:30pm\nThursday: 12:30pm\nSaturday: 7:00am\nPublic holidays: 7:00am'}

assert set(P) <= {d for ds in REGIONS.values() for d in ds}
q = lambda s: "null" if s is None else "$cmp$" + s + "$cmp$"
deaneries = [f"{d} Deanery" for ds in REGIONS.values() for d in ds]
regions_text = "\n".join(f"{r}: {', '.join(ds)}" for r, ds in REGIONS.items())
rows = []
for dean, ps in P.items():
    for name, addr in ps:
        rows.append(f"  ({q(name)}, {q(addr + ', Lagos')}, {q(dean + ' Deanery')}, {q(MASS.get(name))})")
SLUG = "coalesce(nullif(trim(both '-' from regexp_replace(regexp_replace(lower(v.name), '[''’]', '', 'g'), '[^a-z0-9]+', '-', 'g')), ''), 'parish')"
sql = f"""-- 0041: the Archdiocese of Lagos, by region and deanery, with its parishes. Run after 0040.
-- Regions and deaneries from lagosarchdiocese.org; parishes and their deaneries from the admin's list.
-- Needs the Archdiocese of Lagos in Admin › Dioceses (the "Add Nigeria's dioceses" button). Safe to run more than once:
-- parishes already saved (same name in Lagos) are left as they are.

alter table public.dioceses add column if not exists deanery_regions text;

update public.dioceses set
  deaneries = array[{', '.join(q(d) for d in deaneries)}],
  deanery_regions = {q(regions_text)},
  address = coalesce(address, '19 Catholic Mission Street, Marina, Lagos')
where country = 'Nigeria' and lower(name) = 'lagos';

insert into public.churches (diocese_id, country, diocese, name, address, deanery, mass_times, slug, status)
select d.id, 'Nigeria', d.name, v.name, v.address, v.deanery, v.mass_times, {SLUG}, 'published'
from (values
{",\n".join(rows)}
) as v(name, address, deanery, mass_times)
join public.dioceses d on d.country = 'Nigeria' and lower(d.name) = 'lagos'
where not exists (select 1 from public.churches c where c.diocese_id = d.id and lower(c.name) = lower(v.name));

-- Check: parishes per deanery in Lagos.
select c.deanery, count(*) from public.churches c join public.dioceses d on d.id = c.diocese_id
where d.country = 'Nigeria' and lower(d.name) = 'lagos' group by c.deanery order by c.deanery;
"""
out = pathlib.Path(__file__).resolve().parents[1] / "supabase/migrations/0041_lagos_parishes.sql"
out.write_text(sql)
print(out.name, len(rows), "parishes in", len(P), "of", len(deaneries), "deaneries")
