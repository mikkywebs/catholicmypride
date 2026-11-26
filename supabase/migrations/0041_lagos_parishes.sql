-- 0041: the Archdiocese of Lagos, by region and deanery, with its parishes. Run after 0040.
-- Regions and deaneries from lagosarchdiocese.org; parishes and their deaneries from the admin's list.
-- Needs the Archdiocese of Lagos in Admin › Dioceses (the "Add Nigeria's dioceses" button). Safe to run more than once:
-- parishes already saved (same name in Lagos) are left as they are.

alter table public.dioceses add column if not exists deanery_regions text;

update public.dioceses set
  deaneries = array[$cmp$Agege Deanery$cmp$, $cmp$Ikeja Deanery$cmp$, $cmp$Ijede Deanery$cmp$, $cmp$Ikorodu Deanery$cmp$, $cmp$Ipaja Deanery$cmp$, $cmp$Maryland Deanery$cmp$, $cmp$Ajah Deanery$cmp$, $cmp$Epe Deanery$cmp$, $cmp$Lekki Deanery$cmp$, $cmp$Badagry Deanery$cmp$, $cmp$Festac Deanery$cmp$, $cmp$Iba Deanery$cmp$, $cmp$Ijanikin Deanery$cmp$, $cmp$Ilemba Deanery$cmp$, $cmp$Satellite Deanery$cmp$, $cmp$Apapa Deanery$cmp$, $cmp$Isolo Deanery$cmp$, $cmp$Lagos Island Deanery$cmp$, $cmp$Surulere Deanery$cmp$, $cmp$Yaba Deanery$cmp$],
  deanery_regions = $cmp$Ikeja Region: Agege, Ikeja, Ijede, Ikorodu, Ipaja, Maryland
Lekki Region: Ajah, Epe, Lekki
Badagry Region: Badagry, Festac, Iba, Ijanikin, Ilemba, Satellite
Lagos Region: Apapa, Isolo, Lagos Island, Surulere, Yaba$cmp$,
  address = coalesce(address, '19 Catholic Mission Street, Marina, Lagos')
where country = 'Nigeria' and lower(name) = 'lagos';

insert into public.churches (diocese_id, country, diocese, name, address, deanery, mass_times, slug, status)
select d.id, 'Nigeria', d.name, v.name, v.address, v.deanery, v.mass_times, coalesce(nullif(trim(both '-' from regexp_replace(regexp_replace(lower(v.name), '[''’]', '', 'g'), '[^a-z0-9]+', '-', 'g')), ''), 'parish'), 'published'
from (values
  ($cmp$Catholic Church of Presentation, Abule-Egba$cmp$, $cmp$Abule-Egba, Lagos$cmp$, $cmp$Agege Deanery$cmp$, null),
  ($cmp$Our Lady Health of the Sick Catholic Church, Onipetesi$cmp$, $cmp$Onipetesi, Lagos$cmp$, $cmp$Agege Deanery$cmp$, null),
  ($cmp$St. Catherine Catholic Church, Alakuko$cmp$, $cmp$Alakuko, Lagos$cmp$, $cmp$Agege Deanery$cmp$, $cmp$Sunday: 7:00am, 9:30am
Monday to Friday (except Thursday): 12:30pm, 6:30pm
Thursday: 12:30pm
Saturday: 7:00am
Public holidays: 7:00am$cmp$),
  ($cmp$St. Christopher Catholic Church, Ijaiye$cmp$, $cmp$Ijaiye, Lagos$cmp$, $cmp$Agege Deanery$cmp$, null),
  ($cmp$St. Christopher Catholic Church, Oke-Odo$cmp$, $cmp$Oke-Odo, Lagos$cmp$, $cmp$Agege Deanery$cmp$, null),
  ($cmp$St. Cyprian Catholic Church, Oko-Oba$cmp$, $cmp$Oko-Oba, Agege, Lagos$cmp$, $cmp$Agege Deanery$cmp$, null),
  ($cmp$St. Kizito Catholic Church, Iju$cmp$, $cmp$Iju, Lagos$cmp$, $cmp$Agege Deanery$cmp$, null),
  ($cmp$St. Raphael Catholic Church, Ajegunle-Ilo$cmp$, $cmp$Ajegunle-Ilo, Lagos$cmp$, $cmp$Agege Deanery$cmp$, null),
  ($cmp$St. Rita Catholic Church, Obadeyi$cmp$, $cmp$Obadeyi, Lagos$cmp$, $cmp$Agege Deanery$cmp$, null),
  ($cmp$St. Sabina Catholic Church, Idimangoro$cmp$, $cmp$Idimangoro, Lagos$cmp$, $cmp$Agege Deanery$cmp$, null),
  ($cmp$St. Theresa Catholic Church, Ifako$cmp$, $cmp$Ifako, Agege, Lagos$cmp$, $cmp$Agege Deanery$cmp$, null),
  ($cmp$St. Leo Catholic Church, Ikeja$cmp$, $cmp$Toyin Street, Ikeja, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$Catholic Church of Presentation, Ikeja GRA$cmp$, $cmp$GRA, Ikeja, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$Blessed Tansi Catholic Church, Agidingbi$cmp$, $cmp$Agidingbi, Ikeja, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$Catholic Church of the Ascension, Airport Road$cmp$, $cmp$Airport Road, Ikeja, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$St. Peter Claver Catholic Church, Ajao Estate$cmp$, $cmp$Ajao Estate, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$St. John the Evangelist Catholic Church, Ladipo$cmp$, $cmp$Ladipo, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$St. Jude Catholic Church, Mafoluku$cmp$, $cmp$Mafoluku, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$Our Lady of the Holy Rosary Catholic Church, Ogba$cmp$, $cmp$Ogba, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$St. Timothy Catholic Church, Ojodu$cmp$, $cmp$Ojodu, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$Holy Spirit Catholic Church, Omole$cmp$, $cmp$Omole, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$St. Francis Catholic Church, Oregun$cmp$, $cmp$Oregun, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$St. Martin De Porres Catholic Church, NAFRC Oshodi$cmp$, $cmp$NAFRC, Oshodi, Lagos$cmp$, $cmp$Ikeja Deanery$cmp$, null),
  ($cmp$Catholic Church of Corpus Christi, Egbin$cmp$, $cmp$Egbin, Lagos$cmp$, $cmp$Ijede Deanery$cmp$, null),
  ($cmp$Blessed Virgin Mary Catholic Church, Elepe$cmp$, $cmp$Elepe, Lagos$cmp$, $cmp$Ijede Deanery$cmp$, null),
  ($cmp$St. Augustine Catholic Church, Ikorodu$cmp$, $cmp$Ikorodu, Lagos$cmp$, $cmp$Ikorodu Deanery$cmp$, null),
  ($cmp$All Saints Catholic Church, Imota$cmp$, $cmp$Imota, Lagos$cmp$, $cmp$Ikorodu Deanery$cmp$, null),
  ($cmp$Archangels Catholic Church, Agbede$cmp$, $cmp$Agbede, Lagos$cmp$, $cmp$Ikorodu Deanery$cmp$, null),
  ($cmp$Army Chaplaincy Catholic Church, Odogunyan$cmp$, $cmp$Odogunyan, Lagos$cmp$, $cmp$Ikorodu Deanery$cmp$, null),
  ($cmp$Catholic Church of the Archangels, Bada Ayobo$cmp$, $cmp$Bada, Ayobo, Lagos$cmp$, $cmp$Ipaja Deanery$cmp$, null),
  ($cmp$Catholic Church of Annunciation, Ishefun$cmp$, $cmp$Ishefun, Lagos$cmp$, $cmp$Ipaja Deanery$cmp$, null),
  ($cmp$Sacred Heart Catholic Church, Ojota$cmp$, $cmp$Ojota, Lagos$cmp$, $cmp$Maryland Deanery$cmp$, null),
  ($cmp$Catholic Church of Presentation, Agiliti (Mile 12)$cmp$, $cmp$Agiliti, Mile 12, Lagos$cmp$, $cmp$Maryland Deanery$cmp$, null),
  ($cmp$Catholic Church of Annunciation, Abraham Adesanya$cmp$, $cmp$Abraham Adesanya, Ajah, Lagos$cmp$, $cmp$Ajah Deanery$cmp$, null),
  ($cmp$Our Lady Mother and Queen Catholic Church, Badore$cmp$, $cmp$Badore, Ajah, Lagos$cmp$, $cmp$Ajah Deanery$cmp$, null),
  ($cmp$St. Peter Catholic Church, Ado Langbasa$cmp$, $cmp$Ado, Langbasa, Lagos$cmp$, $cmp$Ajah Deanery$cmp$, null),
  ($cmp$St. Theresa Catholic Church, Epe$cmp$, $cmp$Awolowo Way, Oke-Oyinbo, Epe, Lagos$cmp$, $cmp$Epe Deanery$cmp$, null),
  ($cmp$Immaculate Conception Catholic Church, Ibonwon$cmp$, $cmp$Ibonwon, Epe, Lagos$cmp$, $cmp$Epe Deanery$cmp$, null),
  ($cmp$Regina Pacis Catholic Church, Sangotedo$cmp$, $cmp$Sangotedo, Lagos$cmp$, $cmp$Epe Deanery$cmp$, null),
  ($cmp$Our Lady Mother of Mercy Catholic Church, Abijo$cmp$, $cmp$Abijo, Lagos$cmp$, $cmp$Epe Deanery$cmp$, null),
  ($cmp$Catholic Church of the Assumption, Awoyaya$cmp$, $cmp$Awoyaya, Lagos$cmp$, $cmp$Epe Deanery$cmp$, null),
  ($cmp$Regina Caeli Catholic Church, Bogije$cmp$, $cmp$Bogije, Lagos$cmp$, $cmp$Epe Deanery$cmp$, null),
  ($cmp$Our Lady Queen of the Apostles Catholic Church, Lakowe$cmp$, $cmp$Adeba, Lakowe, Lagos$cmp$, $cmp$Epe Deanery$cmp$, null),
  ($cmp$St. Pio Catholic Church, Ayeteju$cmp$, $cmp$Ayeteju, Ibeju-Lekki, Lagos$cmp$, $cmp$Epe Deanery$cmp$, null),
  ($cmp$Our Lady of the Holy Rosary Catholic Church, Ibeju-Lekki$cmp$, $cmp$Ibeju-Lekki, Lagos$cmp$, $cmp$Epe Deanery$cmp$, null),
  ($cmp$Ss. Philip and James Catholic Church, Lekki$cmp$, $cmp$Lekki, Lagos$cmp$, $cmp$Lekki Deanery$cmp$, null),
  ($cmp$Church of Divine Mercy, Lekki Phase 1$cmp$, $cmp$Lekki Phase 1, Lagos$cmp$, $cmp$Lekki Deanery$cmp$, null),
  ($cmp$Church of the Transfiguration, VGC$cmp$, $cmp$Victoria Garden City (VGC), Lagos$cmp$, $cmp$Lekki Deanery$cmp$, null),
  ($cmp$Church of the Epiphany, Ologolo$cmp$, $cmp$Ologolo, Lekki, Lagos$cmp$, $cmp$Lekki Deanery$cmp$, null),
  ($cmp$St. Theresa Catholic Church, Ikota$cmp$, $cmp$Ikota, Lekki, Lagos$cmp$, $cmp$Lekki Deanery$cmp$, null),
  ($cmp$Our Lady Star of the Sea Catholic Church, Northern Foreshore$cmp$, $cmp$Northern Foreshore, Lekki, Lagos$cmp$, $cmp$Lekki Deanery$cmp$, null),
  ($cmp$Ave Maria Catholic Church Grotto, Lekki$cmp$, $cmp$Lekki, Lagos$cmp$, $cmp$Lekki Deanery$cmp$, null),
  ($cmp$St. Joseph Catholic Church, Aradagun$cmp$, $cmp$Aradagun, Badagry, Lagos$cmp$, $cmp$Badagry Deanery$cmp$, null),
  ($cmp$Blessed Tansi Catholic Church, Magbon$cmp$, $cmp$Magbon, Badagry, Lagos$cmp$, $cmp$Badagry Deanery$cmp$, null),
  ($cmp$Catholic Church of Presentation, Festac 23 Road$cmp$, $cmp$23 Road, Festac Town, Lagos$cmp$, $cmp$Festac Deanery$cmp$, null),
  ($cmp$Catholic Church of Annunciation, Festac 7th Avenue$cmp$, $cmp$7th Avenue, Festac Town, Lagos$cmp$, $cmp$Festac Deanery$cmp$, null),
  ($cmp$Catholic Church of Nativity, Festac 6th Avenue$cmp$, $cmp$6th Avenue, Festac Town, Lagos$cmp$, $cmp$Festac Deanery$cmp$, null),
  ($cmp$St. Augustine Catholic Church, Iba$cmp$, $cmp$Iba, Lagos$cmp$, $cmp$Iba Deanery$cmp$, null),
  ($cmp$All Saints Military Chaplaincy, Ojo$cmp$, $cmp$Post-Housing, Ojo Cantonment, Lagos$cmp$, $cmp$Iba Deanery$cmp$, null),
  ($cmp$Catholic Church of the Assumption, Igbo-Elerin$cmp$, $cmp$Igbo-Elerin, Lagos$cmp$, $cmp$Iba Deanery$cmp$, null),
  ($cmp$Holy Redeemer Catholic Church, Shibiri$cmp$, $cmp$Shibiri, Lagos$cmp$, $cmp$Ilemba Deanery$cmp$, null),
  ($cmp$St. Thomas Aquinas Catholic Church, Okokomaiko$cmp$, $cmp$Okokomaiko, Lagos$cmp$, $cmp$Satellite Deanery$cmp$, null),
  ($cmp$Catholic Church of the Immaculate Conception, Snake Island$cmp$, $cmp$Snake Island, Apapa, Lagos$cmp$, $cmp$Apapa Deanery$cmp$, null),
  ($cmp$Catholic Church of Annunciation, Ejigbo (Orioke)$cmp$, $cmp$Orioke, Ejigbo, Lagos$cmp$, $cmp$Isolo Deanery$cmp$, null),
  ($cmp$Holy Cross Cathedral, Lagos Island$cmp$, $cmp$19 Catholic Mission Street, Lagos Island, Lagos$cmp$, $cmp$Lagos Island Deanery$cmp$, null),
  ($cmp$Church of the Assumption, Falomo$cmp$, $cmp$Falomo, Ikoyi, Lagos$cmp$, $cmp$Lagos Island Deanery$cmp$, null),
  ($cmp$St. Charles Borromeo Catholic Church, Victoria Island$cmp$, $cmp$1004 Estate, Victoria Island, Lagos$cmp$, $cmp$Lagos Island Deanery$cmp$, null),
  ($cmp$Our Lady of Perpetual Help Catholic Church, Victoria Island$cmp$, $cmp$Victoria Island, Lagos$cmp$, $cmp$Lagos Island Deanery$cmp$, null),
  ($cmp$St. Michael Catholic Church, Lafiaji$cmp$, $cmp$Lafiaji, Lagos Island, Lagos$cmp$, $cmp$Lagos Island Deanery$cmp$, null),
  ($cmp$St. Patrick Catholic Church, Idumagbo$cmp$, $cmp$Idumagbo, Lagos Island, Lagos$cmp$, $cmp$Lagos Island Deanery$cmp$, null),
  ($cmp$St. Joseph Catholic Church, Elegbata$cmp$, $cmp$Elegbata, Lagos Island, Lagos$cmp$, $cmp$Lagos Island Deanery$cmp$, null),
  ($cmp$St. Theresa Military Church, Bonny Cantonment$cmp$, $cmp$Bonny Cantonment, Victoria Island, Lagos$cmp$, $cmp$Lagos Island Deanery$cmp$, null),
  ($cmp$St. Joseph's Military Church, Dodan Barracks$cmp$, $cmp$Dodan Barracks, Ikoyi, Lagos$cmp$, $cmp$Lagos Island Deanery$cmp$, null),
  ($cmp$Our Lady Queen of Nigeria Catholic Church, Surulere$cmp$, $cmp$Clegg Street, Surulere, Lagos$cmp$, $cmp$Surulere Deanery$cmp$, null),
  ($cmp$St. Dominic Catholic Church, Yaba$cmp$, $cmp$Yaba, Lagos$cmp$, $cmp$Yaba Deanery$cmp$, null),
  ($cmp$St. Agnes Catholic Church, Maryland$cmp$, $cmp$Maryland, Lagos$cmp$, $cmp$Yaba Deanery$cmp$, null),
  ($cmp$St. Andre du Lac Catholic Church, Yaba$cmp$, $cmp$Yaba, Lagos$cmp$, $cmp$Yaba Deanery$cmp$, null)
) as v(name, address, deanery, mass_times)
join public.dioceses d on d.country = 'Nigeria' and lower(d.name) = 'lagos'
where not exists (select 1 from public.churches c where c.diocese_id = d.id and lower(c.name) = lower(v.name));

-- Check: parishes per deanery in Lagos.
select c.deanery, count(*) from public.churches c join public.dioceses d on d.id = c.diocese_id
where d.country = 'Nigeria' and lower(d.name) = 'lagos' group by c.deanery order by c.deanery;
