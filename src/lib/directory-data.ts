// Ready-made figures for Admin → Countries & Provinces. Everything filled in stays editable.
// Nigeria: GCatholic.org country statistics (as of 31 Dec 2023); provinces and their dioceses
// from the Catholic Bishops' Conference list (9 provinces, 59 Latin dioceses + 1 Maronite eparchy).
// Ghana, Kenya, Uganda, Cameroon, South Africa, Tanzania: GCatholic.org province lists and change logs,
// checked 26 Nov 2026 (includes Donkorkrom made a diocese, May 2026; Bariadi, Jan 2026; Eldoret made an
// archdiocese, 14 Nov 2026). Statistics as of 31 Dec 2023.

export type CountryFacts = {
  continent: string
  /** Jurisdictions outside the provinces, e.g. an Eastern Catholic eparchy. */
  other?: { name: string; kind: 'Eparchy' | 'Apostolic Vicariate' | 'Prefecture' | 'Military Ordinariate' | 'Personal Ordinariate' }[]
  /** A line shown on the country page, e.g. how the Church there is organised. */
  note?: string
  /** Diocese name → its cathedral (filled in when the dioceses are added). */
  cathedrals?: Record<string, string>
  asOf: string
  source: string
  totals: { total_provinces?: number; total_dioceses?: number; total_parishes?: number; total_priests?: number; catholic_population?: number }
  /** Province → its archdiocese and suffragan dioceses. */
  provinces: Record<string, string[]>
}

export const DIRECTORY_FACTS: Record<string, CountryFacts> = {
  Nigeria: {
    continent: 'Africa',
    other: [{ name: 'Our Lady of the Annunciation at Ibadan (Maronite)', kind: 'Eparchy' }],
    asOf: '31 December 2023',
    source: 'GCatholic.org',
    totals: { total_provinces: 9, total_dioceses: 60, total_parishes: 4944, total_priests: 10309, catholic_population: 35097000 },
    provinces: {
      Abuja: ['Abuja', 'Gboko', 'Idah', 'Katsina-Ala', 'Lafia', 'Lokoja', 'Makurdi', 'Otukpo'],
      'Benin City': ['Benin City', 'Auchi', 'Bomadi', 'Issele-Uku', 'Uromi', 'Warri'],
      Calabar: ['Calabar', 'Ikot Ekpene', 'Ogoja', 'Port Harcourt', 'Uyo'],
      Ibadan: ['Ibadan', 'Ekiti', 'Ilorin', 'Ondo', 'Osogbo', 'Oyo'],
      Jos: ['Jos', 'Bauchi', 'Jalingo', 'Maiduguri', 'Pankshin', 'Shendam', 'Wukari', 'Yola'],
      Kaduna: ['Kaduna', 'Kafanchan', 'Kano', 'Katsina', 'Kontagora', 'Minna', 'Sokoto', 'Zaria'],
      Lagos: ['Lagos', 'Abeokuta', 'Ijebu-Ode'],
      Onitsha: ['Onitsha', 'Abakaliki', 'Aguleri', 'Awgu', 'Awka', 'Ekwulobia', 'Enugu', 'Nnewi', 'Nsukka'],
      Owerri: ['Owerri', 'Aba', 'Ahiara', 'Okigwe', 'Orlu', 'Umuahia'],
    },
  },
  Ghana: {
    continent: 'Africa',
    asOf: '31 December 2023',
    source: 'GCatholic.org',
    totals: { total_provinces: 4, total_dioceses: 20, total_parishes: 798, total_priests: 2053, catholic_population: 4377000 },
    provinces: {
      Accra: ['Accra', 'Donkorkrom', 'Ho', 'Jasikan', 'Keta-Akatsi', 'Koforidua'],
      'Cape Coast': ['Cape Coast', 'Sekondi-Takoradi', 'Wiawso'],
      Kumasi: ['Kumasi', 'Goaso', 'Konongo-Mampong', 'Obuasi', 'Sunyani', 'Techiman'],
      Tamale: ['Tamale', 'Damongo', 'Navrongo-Bolgatanga', 'Wa', 'Yendi'],
    },
  },
  Kenya: {
    continent: 'Africa',
    other: [{ name: 'Military Ordinariate of Kenya', kind: 'Military Ordinariate' }],
    asOf: '31 December 2023',
    source: 'GCatholic.org',
    totals: { total_provinces: 5, total_dioceses: 27, total_parishes: 1252, total_priests: 3999, catholic_population: 18042000 },
    provinces: {
      Eldoret: ['Eldoret', 'Kapsabet', 'Kericho', 'Kitale', 'Lodwar'],
      Kisumu: ['Kisumu', 'Bungoma', 'Homa Bay', 'Kakamega', 'Kisii'],
      Mombasa: ['Mombasa', 'Garissa', 'Malindi'],
      Nairobi: ['Nairobi', 'Kitui', 'Machakos', 'Nakuru', 'Ngong', 'Wote'],
      Nyeri: ['Nyeri', 'Embu', 'Isiolo', 'Maralal', 'Marsabit', 'Meru', "Murang'a", 'Nyahururu'],
    },
  },
  Uganda: {
    continent: 'Africa',
    other: [{ name: 'Military Ordinariate of Uganda', kind: 'Military Ordinariate' }],
    asOf: '31 December 2023',
    source: 'GCatholic.org',
    totals: { total_provinces: 4, total_dioceses: 19, total_parishes: 742, total_priests: 2823, catholic_population: 22018000 },
    provinces: {
      Gulu: ['Gulu', 'Arua', 'Lira', 'Nebbi'],
      Kampala: ['Kampala', 'Kasana-Luweero', 'Kiyinda-Mityana', 'Lugazi', 'Masaka'],
      Mbarara: ['Mbarara', 'Fort Portal', 'Hoima', 'Kabale', 'Kasese'],
      Tororo: ['Tororo', 'Jinja', 'Kotido', 'Moroto', 'Soroti'],
    },
  },
  Cameroon: {
    continent: 'Africa',
    asOf: '31 December 2023',
    source: 'GCatholic.org',
    totals: { total_provinces: 5, total_dioceses: 26, total_parishes: 1368, total_priests: 3179, catholic_population: 8110000 },
    provinces: {
      Bamenda: ['Bamenda', 'Buéa', 'Kumba', 'Kumbo', 'Mamfe'],
      Bertoua: ['Bertoua', 'Batouri', "Doumé-Abong' Mbang", 'Yokadouma'],
      Douala: ['Douala', 'Bafang', 'Bafoussam', 'Edéa', 'Eséka', 'Nkongsamba'],
      Garoua: ['Garoua', 'Maroua-Mokolo', 'Ngaoundéré', 'Yagoua'],
      Yaoundé: ['Yaoundé', 'Bafia', 'Ebolowa', 'Kribi', 'Mbalmayo', 'Obala', 'Sangmélima'],
    },
  },
  'South Africa': {
    continent: 'Africa',
    // Manzini (Eswatini), Gaborone and Francistown (Botswana) belong to these provinces but lie outside South Africa.
    other: [
      { name: 'Ingwavuma', kind: 'Apostolic Vicariate' },
      { name: 'Military Ordinariate of South Africa', kind: 'Military Ordinariate' },
    ],
    asOf: '31 December 2023',
    source: 'GCatholic.org',
    totals: { total_provinces: 5, total_dioceses: 25, total_parishes: 887, total_priests: 1194, catholic_population: 3982000 },
    provinces: {
      Bloemfontein: ['Bloemfontein', 'Bethlehem', 'Keimoes-Upington', 'Kimberley', 'Kroonstad'],
      'Cape Town': ['Cape Town', 'Aliwal', 'De Aar', 'Oudtshoorn', 'Port Elizabeth', 'Queenstown'],
      Durban: ['Durban', 'Dundee', 'Eshowe', 'Kokstad', 'Mariannhill', 'Mthatha', 'Umzimkulu'],
      Johannesburg: ['Johannesburg', 'Klerksdorp', 'Witbank'],
      Pretoria: ['Pretoria', 'Polokwane', 'Rustenburg', 'Tzaneen'],
    },
  },
  Tanzania: {
    continent: 'Africa',
    asOf: '31 December 2023',
    source: 'GCatholic.org',
    totals: { total_provinces: 7, total_dioceses: 38, total_parishes: 1416, total_priests: 3372, catholic_population: 19212000 },
    provinces: {
      Arusha: ['Arusha', 'Mbulu', 'Moshi', 'Same'],
      'Dar-es-Salaam': ['Dar-es-Salaam', 'Bagamoyo', 'Ifakara', 'Mahenge', 'Morogoro', 'Tanga', 'Zanzibar'],
      Dodoma: ['Dodoma', 'Kondoa', 'Singida'],
      Mbeya: ['Mbeya', 'Iringa', 'Mafinga', 'Sumbawanga'],
      Mwanza: ['Mwanza', 'Bariadi', 'Bukoba', 'Bunda', 'Geita', 'Kayanga', 'Musoma', 'Rulenge-Ngara', 'Shinyanga'],
      Songea: ['Songea', 'Lindi', 'Mbinga', 'Mtwara', 'Njombe', 'Tunduru-Masasi'],
      Tabora: ['Tabora', 'Kahama', 'Kigoma', 'Mpanda', 'Nzega'],
    },
  },

  // ---------- Europe ----------
  // GCatholic.org province lists, checked 27 Nov 2026. The Church in Ireland is organised for the whole island;
  // Great Britain has two bishops' conferences (England and Wales; Scotland), so each is listed on its own.
  Ireland: {
    continent: 'Europe',
    note: 'The Catholic Church in Ireland is organised for the whole island, so the dioceses of Northern Ireland are listed here too.',
    asOf: '31 December 2023',
    source: 'GCatholic.org (figures include Northern Ireland)',
    totals: { total_provinces: 4, total_dioceses: 26, total_parishes: 1357, total_priests: 3592, catholic_population: 5739000 },
    provinces: {
      Armagh: ['Armagh', 'Ardagh', 'Clogher', 'Derry', 'Down and Connor', 'Dromore', 'Kilmore', 'Meath', 'Raphoe'],
      'Cashel and Emly': ['Cashel and Emly', 'Cloyne', 'Cork and Ross', 'Kerry', 'Killaloe', 'Limerick', 'Waterford and Lismore'],
      Dublin: ['Dublin', 'Ferns', 'Kildare and Leighlin', 'Ossory'],
      Tuam: ['Tuam', 'Achonry', 'Clonfert', 'Elphin', 'Galway and Kilmacduagh', 'Killala'],
    },
    cathedrals: {
      Armagh: 'Cathedral Church of St Patrick, Armagh', Ardagh: 'St Mel’s Cathedral, Longford', Clogher: 'St Macartan’s Cathedral, Monaghan', Derry: 'St Eugene’s Cathedral, Derry',
      'Down and Connor': 'St Peter’s Cathedral, Belfast', Dromore: 'Cathedral of St Patrick and St Colman, Newry', Kilmore: 'Cathedral of St Patrick and St Felim, Cavan', Meath: 'Cathedral of Christ the King, Mullingar', Raphoe: 'Cathedral of Saints Eunan and Columba, Letterkenny',
      'Cashel and Emly': 'Cathedral of the Assumption, Thurles', Cloyne: 'Cathedral of St Colman, Cobh', 'Cork and Ross': 'Cathedral of St Mary and St Anne, Cork', Kerry: 'Cathedral of St Mary of the Assumption, Killarney', Killaloe: 'Cathedral of Ss Peter and Paul, Ennis', Limerick: 'Cathedral of St John the Baptist, Limerick', 'Waterford and Lismore': 'Cathedral of the Most Holy Trinity, Waterford',
      Dublin: 'St Mary’s Pro-Cathedral, Dublin', Ferns: 'St Aidan’s Cathedral, Enniscorthy', 'Kildare and Leighlin': 'Cathedral of the Assumption, Carlow', Ossory: 'Cathedral of St Mary of the Assumption, Kilkenny',
      Tuam: 'Cathedral of the Assumption of the Blessed Virgin Mary, Tuam', Achonry: 'Cathedral of the Annunciation and St Nathy, Ballaghaderreen', Clonfert: 'Cathedral of St Brendan, Loughrea', Elphin: 'Cathedral of the Immaculate Conception, Sligo', 'Galway and Kilmacduagh': 'Cathedral of Our Lady Assumed into Heaven and St Nicholas, Galway', Killala: 'St Muredach’s Cathedral, Ballina',
    },
  },
  'England and Wales': {
    continent: 'Europe',
    note: 'England and Wales have their own bishops’ conference; Scotland is listed separately. The eparchies, the Ordinariate and the Bishopric of the Forces also serve Scotland.',
    other: [
      { name: 'Eparchy of Great Britain (Syro-Malabar)', kind: 'Eparchy' },
      { name: 'Eparchy of the Holy Family of London (Ukrainian)', kind: 'Eparchy' },
      { name: 'Bishopric of the Forces in Great Britain', kind: 'Military Ordinariate' },
      { name: 'Personal Ordinariate of Our Lady of Walsingham', kind: 'Personal Ordinariate' },
    ],
    asOf: '27 November 2026',
    source: 'GCatholic.org',
    totals: { total_provinces: 5, total_dioceses: 21 },
    provinces: {
      Birmingham: ['Birmingham', 'Clifton', 'Shrewsbury'],
      'Cardiff–Menevia': ['Cardiff–Menevia', 'Wrexham'],
      Liverpool: ['Liverpool', 'Hallam', 'Hexham and Newcastle', 'Lancaster', 'Leeds', 'Middlesbrough', 'Salford'],
      Southwark: ['Southwark', 'Arundel and Brighton', 'Plymouth', 'Portsmouth'],
      Westminster: ['Westminster', 'Brentwood', 'East Anglia', 'Northampton', 'Nottingham'],
    },
    cathedrals: {
      Birmingham: 'Metropolitan Cathedral Basilica of St Chad, Birmingham', Clifton: 'Cathedral Church of Ss Peter and Paul, Bristol', Shrewsbury: 'Cathedral Church of Our Lady Help of Christians and St Peter of Alcantara, Shrewsbury',
      'Cardiff–Menevia': 'Metropolitan Cathedral Church of St David, Cardiff', Wrexham: 'Cathedral Church of Our Lady of Sorrows, Wrexham',
      Liverpool: 'Metropolitan Cathedral of Christ the King, Liverpool', Hallam: 'Cathedral Church of St Marie, Sheffield', 'Hexham and Newcastle': 'Cathedral Church of St Mary, Newcastle upon Tyne', Lancaster: 'Cathedral Church of St Peter, Lancaster', Leeds: 'Cathedral Church of St Anne, Leeds', Middlesbrough: 'Cathedral Church of St Mary, Middlesbrough', Salford: 'Cathedral Church of St John the Evangelist, Salford',
      Southwark: 'Metropolitan Cathedral of St George, Southwark', 'Arundel and Brighton': 'Cathedral Church of Our Lady and St Philip Howard, Arundel', Plymouth: 'Cathedral Church of St Mary and St Boniface, Plymouth', Portsmouth: 'Cathedral Church of St John the Evangelist, Portsmouth',
      Westminster: 'Metropolitan Cathedral of the Most Precious Blood, Westminster', Brentwood: 'Cathedral Church of St Mary and St Helen, Brentwood', 'East Anglia': 'Cathedral of St John the Baptist, Norwich', Northampton: 'Cathedral of Our Lady Immaculate and St Thomas of Canterbury, Northampton', Nottingham: 'Cathedral Church of St Barnabas, Nottingham',
      'Eparchy of Great Britain (Syro-Malabar)': 'Syro-Malabar Cathedral of St Alphonsa, Preston', 'Eparchy of the Holy Family of London (Ukrainian)': 'Ukrainian Catholic Cathedral of the Holy Family in Exile, London', 'Bishopric of the Forces in Great Britain': 'Cathedral Church of St Michael and St George, Aldershot', 'Personal Ordinariate of Our Lady of Walsingham': 'Church of Our Lady of the Assumption and St Gregory, London (principal church)',
    },
  },
  Scotland: {
    continent: 'Europe',
    note: 'Scotland has its own bishops’ conference. The eparchies, the Ordinariate and the Bishopric of the Forces that also serve Scotland are listed under England and Wales.',
    asOf: '27 November 2026',
    source: 'GCatholic.org',
    totals: { total_provinces: 2, total_dioceses: 8 },
    provinces: {
      Glasgow: ['Glasgow', 'Motherwell', 'Paisley'],
      'Saint Andrews and Edinburgh': ['Saint Andrews and Edinburgh', 'Aberdeen', 'Argyll and The Isles', 'Dunkeld', 'Galloway'],
    },
    cathedrals: {
      Glasgow: 'St Andrew’s Metropolitan Cathedral, Glasgow', Motherwell: 'Cathedral of Our Lady of Good Aid, Motherwell', Paisley: 'St Mirin’s Cathedral, Paisley',
      'Saint Andrews and Edinburgh': 'Metropolitan Cathedral of Our Lady of the Assumption, Edinburgh', Aberdeen: 'Cathedral of St Mary of the Assumption, Aberdeen', 'Argyll and The Isles': 'St Columba’s Cathedral, Oban', Dunkeld: 'Cathedral of St Andrew, Dundee', Galloway: 'Cathedral of St Margaret of Scotland, Ayr',
    },
  },
}
