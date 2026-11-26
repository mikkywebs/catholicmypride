// Ready-made figures for Admin → Countries & Provinces. Everything filled in stays editable.
// Nigeria: GCatholic.org country statistics (as of 31 Dec 2023); provinces and their dioceses
// from the Catholic Bishops' Conference list (9 provinces, 59 Latin dioceses + 1 Maronite eparchy).
// Ghana, Kenya, Uganda, Cameroon, South Africa, Tanzania: GCatholic.org province lists and change logs,
// checked 26 Nov 2026 (includes Donkorkrom made a diocese, May 2026; Bariadi, Jan 2026; Eldoret made an
// archdiocese, 14 Nov 2026). Statistics as of 31 Dec 2023.

export type CountryFacts = {
  continent: string
  /** Jurisdictions outside the provinces, e.g. an Eastern Catholic eparchy. */
  other?: { name: string; kind: 'Eparchy' | 'Apostolic Vicariate' | 'Prefecture' | 'Military Ordinariate' }[]
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
}
