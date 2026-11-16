// Ready-made figures for Admin → Countries & Provinces. Everything filled in stays editable.
// Nigeria: GCatholic.org country statistics (as of 31 Dec 2023); provinces and their dioceses
// from the Catholic Bishops' Conference list (9 provinces, 59 Latin dioceses + 1 Maronite eparchy).

export type CountryFacts = {
  asOf: string
  source: string
  totals: { total_provinces?: number; total_dioceses?: number; total_parishes?: number; total_priests?: number; catholic_population?: number }
  /** Province → its archdiocese and suffragan dioceses. */
  provinces: Record<string, string[]>
}

export const DIRECTORY_FACTS: Record<string, CountryFacts> = {
  Nigeria: {
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
}
