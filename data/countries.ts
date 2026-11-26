export interface Country {
  code: string;      // ISO 3166-1 alpha-2
  name: string;
  dialCode: string;
  flag: string;
  postalLabel: string;    // e.g. "ZIP Code", "Postal Code", "PIN Code"
  stateLabel: string;     // e.g. "State", "Province", "Division"
  cityLabel: string;      // e.g. "City", "Town", "District"
  statesRequired: boolean;
}

export interface CountryState {
  code: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: "BD", name: "Bangladesh",        dialCode: "+880", flag: "🇧🇩", postalLabel: "Postal Code",  stateLabel: "Division",  cityLabel: "District/City", statesRequired: true },
  { code: "US", name: "United States",     dialCode: "+1",   flag: "🇺🇸", postalLabel: "ZIP Code",     stateLabel: "State",     cityLabel: "City",          statesRequired: true },
  { code: "GB", name: "United Kingdom",    dialCode: "+44",  flag: "🇬🇧", postalLabel: "Postcode",     stateLabel: "County",    cityLabel: "City",          statesRequired: false },
  { code: "CA", name: "Canada",            dialCode: "+1",   flag: "🇨🇦", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: true },
  { code: "AU", name: "Australia",         dialCode: "+61",  flag: "🇦🇺", postalLabel: "Postcode",     stateLabel: "State",     cityLabel: "City",          statesRequired: true },
  { code: "IN", name: "India",             dialCode: "+91",  flag: "🇮🇳", postalLabel: "PIN Code",     stateLabel: "State",     cityLabel: "City",          statesRequired: true },
  { code: "PK", name: "Pakistan",          dialCode: "+92",  flag: "🇵🇰", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: true },
  { code: "AE", name: "UAE",               dialCode: "+971", flag: "🇦🇪", postalLabel: "Postal Code",  stateLabel: "Emirate",   cityLabel: "City",          statesRequired: true },
  { code: "SA", name: "Saudi Arabia",      dialCode: "+966", flag: "🇸🇦", postalLabel: "Postal Code",  stateLabel: "Region",    cityLabel: "City",          statesRequired: false },
  { code: "MY", name: "Malaysia",          dialCode: "+60",  flag: "🇲🇾", postalLabel: "Postcode",     stateLabel: "State",     cityLabel: "City",          statesRequired: true },
  { code: "SG", name: "Singapore",         dialCode: "+65",  flag: "🇸🇬", postalLabel: "Postal Code",  stateLabel: "Region",    cityLabel: "City",          statesRequired: false },
  { code: "JP", name: "Japan",             dialCode: "+81",  flag: "🇯🇵", postalLabel: "Postal Code",  stateLabel: "Prefecture","cityLabel": "City",        statesRequired: true },
  { code: "KR", name: "South Korea",       dialCode: "+82",  flag: "🇰🇷", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: false },
  { code: "CN", name: "China",             dialCode: "+86",  flag: "🇨🇳", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: true },
  { code: "ID", name: "Indonesia",         dialCode: "+62",  flag: "🇮🇩", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: true },
  { code: "PH", name: "Philippines",       dialCode: "+63",  flag: "🇵🇭", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: true },
  { code: "TH", name: "Thailand",          dialCode: "+66",  flag: "🇹🇭", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: false },
  { code: "VN", name: "Vietnam",           dialCode: "+84",  flag: "🇻🇳", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: false },
  { code: "TR", name: "Turkey",            dialCode: "+90",  flag: "🇹🇷", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: false },
  { code: "EG", name: "Egypt",             dialCode: "+20",  flag: "🇪🇬", postalLabel: "Postal Code",  stateLabel: "Governorate","cityLabel": "City",       statesRequired: false },
  { code: "NG", name: "Nigeria",           dialCode: "+234", flag: "🇳🇬", postalLabel: "Postal Code",  stateLabel: "State",     cityLabel: "City",          statesRequired: false },
  { code: "KE", name: "Kenya",             dialCode: "+254", flag: "🇰🇪", postalLabel: "Postal Code",  stateLabel: "County",    cityLabel: "City",          statesRequired: false },
  { code: "ZA", name: "South Africa",      dialCode: "+27",  flag: "🇿🇦", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: false },
  { code: "DE", name: "Germany",           dialCode: "+49",  flag: "🇩🇪", postalLabel: "Postal Code",  stateLabel: "State",     cityLabel: "City",          statesRequired: false },
  { code: "FR", name: "France",            dialCode: "+33",  flag: "🇫🇷", postalLabel: "Postal Code",  stateLabel: "Region",    cityLabel: "City",          statesRequired: false },
  { code: "IT", name: "Italy",             dialCode: "+39",  flag: "🇮🇹", postalLabel: "Postal Code",  stateLabel: "Region",    cityLabel: "City",          statesRequired: false },
  { code: "ES", name: "Spain",             dialCode: "+34",  flag: "🇪🇸", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: false },
  { code: "NL", name: "Netherlands",       dialCode: "+31",  flag: "🇳🇱", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: false },
  { code: "RU", name: "Russia",            dialCode: "+7",   flag: "🇷🇺", postalLabel: "Postal Code",  stateLabel: "Region",    cityLabel: "City",          statesRequired: false },
  { code: "BR", name: "Brazil",            dialCode: "+55",  flag: "🇧🇷", postalLabel: "CEP",          stateLabel: "State",     cityLabel: "City",          statesRequired: true },
  { code: "MX", name: "Mexico",            dialCode: "+52",  flag: "🇲🇽", postalLabel: "Postal Code",  stateLabel: "State",     cityLabel: "City",          statesRequired: false },
  { code: "NZ", name: "New Zealand",       dialCode: "+64",  flag: "🇳🇿", postalLabel: "Postcode",     stateLabel: "Region",    cityLabel: "City",          statesRequired: false },
  { code: "QA", name: "Qatar",             dialCode: "+974", flag: "🇶🇦", postalLabel: "Postal Code",  stateLabel: "Municipality","cityLabel": "City",      statesRequired: false },
  { code: "KW", name: "Kuwait",            dialCode: "+965", flag: "🇰🇼", postalLabel: "Postal Code",  stateLabel: "Governorate","cityLabel": "City",       statesRequired: false },
  { code: "BH", name: "Bahrain",           dialCode: "+973", flag: "🇧🇭", postalLabel: "Postal Code",  stateLabel: "Governorate","cityLabel": "City",       statesRequired: false },
  { code: "OM", name: "Oman",              dialCode: "+968", flag: "🇴🇲", postalLabel: "Postal Code",  stateLabel: "Governorate","cityLabel": "City",       statesRequired: false },
  { code: "LK", name: "Sri Lanka",         dialCode: "+94",  flag: "🇱🇰", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: false },
  { code: "NP", name: "Nepal",             dialCode: "+977", flag: "🇳🇵", postalLabel: "Postal Code",  stateLabel: "Province",  cityLabel: "City",          statesRequired: false },
  { code: "MM", name: "Myanmar",           dialCode: "+95",  flag: "🇲🇲", postalLabel: "Postal Code",  stateLabel: "Region",    cityLabel: "City",          statesRequired: false },
];

export const STATES_BY_COUNTRY: Record<string, CountryState[]> = {
  BD: [
    { code: "BAR", name: "Barisal" },
    { code: "CHI", name: "Chittagong" },
    { code: "DHA", name: "Dhaka" },
    { code: "KHU", name: "Khulna" },
    { code: "MYM", name: "Mymensingh" },
    { code: "RAJ", name: "Rajshahi" },
    { code: "RAN", name: "Rangpur" },
    { code: "SYL", name: "Sylhet" },
  ],
  US: [
    { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }, { code: "DC", name: "Washington D.C." },
  ],
  CA: [
    { code: "AB", name: "Alberta" }, { code: "BC", name: "British Columbia" }, { code: "MB", name: "Manitoba" },
    { code: "NB", name: "New Brunswick" }, { code: "NL", name: "Newfoundland and Labrador" },
    { code: "NS", name: "Nova Scotia" }, { code: "NT", name: "Northwest Territories" },
    { code: "NU", name: "Nunavut" }, { code: "ON", name: "Ontario" }, { code: "PE", name: "Prince Edward Island" },
    { code: "QC", name: "Quebec" }, { code: "SK", name: "Saskatchewan" }, { code: "YT", name: "Yukon" },
  ],
  AU: [
    { code: "ACT", name: "Australian Capital Territory" }, { code: "NSW", name: "New South Wales" },
    { code: "NT", name: "Northern Territory" }, { code: "QLD", name: "Queensland" },
    { code: "SA", name: "South Australia" }, { code: "TAS", name: "Tasmania" },
    { code: "VIC", name: "Victoria" }, { code: "WA", name: "Western Australia" },
  ],
  IN: [
    { code: "AN", name: "Andaman and Nicobar Islands" }, { code: "AP", name: "Andhra Pradesh" },
    { code: "AR", name: "Arunachal Pradesh" }, { code: "AS", name: "Assam" }, { code: "BR", name: "Bihar" },
    { code: "CH", name: "Chandigarh" }, { code: "CG", name: "Chhattisgarh" }, { code: "GA", name: "Goa" },
    { code: "GJ", name: "Gujarat" }, { code: "HR", name: "Haryana" }, { code: "HP", name: "Himachal Pradesh" },
    { code: "JK", name: "Jammu and Kashmir" }, { code: "JH", name: "Jharkhand" }, { code: "KA", name: "Karnataka" },
    { code: "KL", name: "Kerala" }, { code: "MP", name: "Madhya Pradesh" }, { code: "MH", name: "Maharashtra" },
    { code: "MN", name: "Manipur" }, { code: "ML", name: "Meghalaya" }, { code: "MZ", name: "Mizoram" },
    { code: "NL", name: "Nagaland" }, { code: "DL", name: "New Delhi" }, { code: "OR", name: "Odisha" },
    { code: "PY", name: "Puducherry" }, { code: "PB", name: "Punjab" }, { code: "RJ", name: "Rajasthan" },
    { code: "SK", name: "Sikkim" }, { code: "TN", name: "Tamil Nadu" }, { code: "TS", name: "Telangana" },
    { code: "TR", name: "Tripura" }, { code: "UP", name: "Uttar Pradesh" }, { code: "UK", name: "Uttarakhand" },
    { code: "WB", name: "West Bengal" },
  ],
  PK: [
    { code: "BAL", name: "Balochistan" }, { code: "GB", name: "Gilgit-Baltistan" },
    { code: "ICT", name: "Islamabad Capital Territory" }, { code: "AJK", name: "Azad Kashmir" },
    { code: "KPK", name: "Khyber Pakhtunkhwa" }, { code: "PUN", name: "Punjab" }, { code: "SND", name: "Sindh" },
  ],
  AE: [
    { code: "AZ", name: "Abu Dhabi" }, { code: "AJ", name: "Ajman" }, { code: "DU", name: "Dubai" },
    { code: "FU", name: "Fujairah" }, { code: "RK", name: "Ras Al Khaimah" }, { code: "SH", name: "Sharjah" },
    { code: "UQ", name: "Umm Al Quwain" },
  ],
  MY: [
    { code: "JHR", name: "Johor" }, { code: "KDH", name: "Kedah" }, { code: "KTN", name: "Kelantan" },
    { code: "MLK", name: "Melaka" }, { code: "NSN", name: "Negeri Sembilan" }, { code: "PHG", name: "Pahang" },
    { code: "PNG", name: "Penang" }, { code: "PRK", name: "Perak" }, { code: "PLS", name: "Perlis" },
    { code: "SBH", name: "Sabah" }, { code: "SWK", name: "Sarawak" }, { code: "SGR", name: "Selangor" },
    { code: "TRG", name: "Terengganu" }, { code: "KUL", name: "Kuala Lumpur" }, { code: "LBN", name: "Labuan" },
    { code: "PJY", name: "Putrajaya" },
  ],
  BR: [
    { code: "AC", name: "Acre" }, { code: "AL", name: "Alagoas" }, { code: "AP", name: "Amapá" },
    { code: "AM", name: "Amazonas" }, { code: "BA", name: "Bahia" }, { code: "CE", name: "Ceará" },
    { code: "DF", name: "Distrito Federal" }, { code: "ES", name: "Espírito Santo" }, { code: "GO", name: "Goiás" },
    { code: "MA", name: "Maranhão" }, { code: "MT", name: "Mato Grosso" }, { code: "MS", name: "Mato Grosso do Sul" },
    { code: "MG", name: "Minas Gerais" }, { code: "PA", name: "Pará" }, { code: "PB", name: "Paraíba" },
    { code: "PR", name: "Paraná" }, { code: "PE", name: "Pernambuco" }, { code: "PI", name: "Piauí" },
    { code: "RJ", name: "Rio de Janeiro" }, { code: "RN", name: "Rio Grande do Norte" },
    { code: "RS", name: "Rio Grande do Sul" }, { code: "RO", name: "Rondônia" }, { code: "RR", name: "Roraima" },
    { code: "SC", name: "Santa Catarina" }, { code: "SP", name: "São Paulo" }, { code: "SE", name: "Sergipe" },
    { code: "TO", name: "Tocantins" },
  ],
  CN: [
    { code: "BJ", name: "Beijing" }, { code: "TJ", name: "Tianjin" }, { code: "SH", name: "Shanghai" },
    { code: "CQ", name: "Chongqing" }, { code: "HE", name: "Hebei" }, { code: "SX", name: "Shanxi" },
    { code: "LN", name: "Liaoning" }, { code: "JL", name: "Jilin" }, { code: "HL", name: "Heilongjiang" },
    { code: "JS", name: "Jiangsu" }, { code: "ZJ", name: "Zhejiang" }, { code: "AH", name: "Anhui" },
    { code: "FJ", name: "Fujian" }, { code: "JX", name: "Jiangxi" }, { code: "SD", name: "Shandong" },
    { code: "HA", name: "Henan" }, { code: "HB", name: "Hubei" }, { code: "HN", name: "Hunan" },
    { code: "GD", name: "Guangdong" }, { code: "HI", name: "Hainan" }, { code: "SC", name: "Sichuan" },
    { code: "GZ", name: "Guizhou" }, { code: "YN", name: "Yunnan" }, { code: "SN", name: "Shaanxi" },
    { code: "GS", name: "Gansu" }, { code: "QH", name: "Qinghai" },
  ],
  ID: [
    { code: "AC", name: "Aceh" }, { code: "BA", name: "Bali" }, { code: "BB", name: "Bangka Belitung" },
    { code: "BT", name: "Banten" }, { code: "BE", name: "Bengkulu" }, { code: "GO", name: "Gorontalo" },
    { code: "JK", name: "Jakarta" }, { code: "JA", name: "Jambi" }, { code: "JB", name: "Jawa Barat" },
    { code: "JT", name: "Jawa Tengah" }, { code: "JI", name: "Jawa Timur" }, { code: "KB", name: "Kalimantan Barat" },
    { code: "KS", name: "Kalimantan Selatan" }, { code: "KT", name: "Kalimantan Tengah" },
    { code: "KI", name: "Kalimantan Timur" }, { code: "LA", name: "Lampung" }, { code: "MU", name: "Maluku" },
    { code: "MA", name: "Maluku Utara" }, { code: "NB", name: "Nusa Tenggara Barat" },
    { code: "NT", name: "Nusa Tenggara Timur" }, { code: "PB", name: "Papua" }, { code: "RI", name: "Riau" },
    { code: "SR", name: "Sulawesi Barat" }, { code: "SN", name: "Sulawesi Selatan" },
    { code: "ST", name: "Sulawesi Tengah" }, { code: "SG", name: "Sulawesi Tenggara" },
    { code: "SA", name: "Sulawesi Utara" }, { code: "SB", name: "Sumatera Barat" },
    { code: "SS", name: "Sumatera Selatan" }, { code: "SU", name: "Sumatera Utara" },
    { code: "YO", name: "Yogyakarta" },
  ],
  PH: [
    { code: "ABR", name: "Abra" }, { code: "AGN", name: "Agusan del Norte" }, { code: "AGS", name: "Agusan del Sur" },
    { code: "AKL", name: "Aklan" }, { code: "ALB", name: "Albay" }, { code: "ANT", name: "Antique" },
    { code: "APA", name: "Apayao" }, { code: "AUR", name: "Aurora" }, { code: "BAS", name: "Basilan" },
    { code: "BAN", name: "Bataan" }, { code: "BTN", name: "Batanes" }, { code: "BTG", name: "Batangas" },
    { code: "BEN", name: "Benguet" }, { code: "BIL", name: "Biliran" }, { code: "BOH", name: "Bohol" },
    { code: "BUK", name: "Bukidnon" }, { code: "BUL", name: "Bulacan" }, { code: "CAG", name: "Cagayan" },
    { code: "CAN", name: "Camarines Norte" }, { code: "CAS", name: "Camarines Sur" },
    { code: "CAM", name: "Camiguin" }, { code: "CAP", name: "Capiz" }, { code: "CAT", name: "Catanduanes" },
    { code: "CAV", name: "Cavite" }, { code: "CEB", name: "Cebu" }, { code: "NCR", name: "Metro Manila" },
  ],
};

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getStatesByCountry(countryCode: string): CountryState[] {
  return STATES_BY_COUNTRY[countryCode] ?? [];
}

/** True when Bangladesh → Dhaka division is selected (for delivery pricing). */
export function isBangladeshDhaka(countryCode: string, stateName: string): boolean {
  return countryCode === "BD" && stateName.toLowerCase().includes("dhaka");
}
