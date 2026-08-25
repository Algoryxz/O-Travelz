/**
 * Verified Odisha Essentials Dataset: Medical Help 24/7 & ATMs
 * Authoritative coordinates, contact details, and emergency services.
 */

export interface EssentialPlace {
  id: string;
  name: string;
  category: "hospital" | "pharmacy" | "atm" | "bank";
  subType: "hospital_24x7" | "pharmacy_24x7" | "trauma_center" | "atm_24x7";
  city: string;
  district: string;
  locality: string;
  lat: number;
  lon: number;
  phone?: string;
  emergencyPhone?: string;
  is24x7: boolean;
  bankName?: string;
  services?: string[];
  address: string;
}

export const ODISHA_ESSENTIALS: EssentialPlace[] = [
  // --- MEDICAL (Hospitals & Pharmacies) ---
  // Bhubaneswar
  {
    id: "med_aiims_bbsr",
    name: "AIIMS Bhubaneswar (All India Institute of Medical Sciences)",
    category: "hospital",
    subType: "trauma_center",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Sijua, Patrapada",
    lat: 20.2312,
    lon: 85.7891,
    phone: "0674-2476789",
    emergencyPhone: "0674-2476800",
    is24x7: true,
    services: ["24x7 Trauma Care", "Emergency ICU", "Blood Bank", "Pharmacy"],
    address: "NH-16, Sijua, Patrapada, Bhubaneswar, Odisha 751019",
  },
  {
    id: "med_capital_hospital_bbsr",
    name: "Capital Hospital & Post Graduate Institute (Government of Odisha)",
    category: "hospital",
    subType: "hospital_24x7",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Unit 6, Ganga Nagar",
    lat: 20.2642,
    lon: 85.8239,
    phone: "0674-2391983",
    emergencyPhone: "108",
    is24x7: true,
    services: ["24x7 Emergency Ward", "Government Trauma Care", "Free Ambulance 108"],
    address: "Unit-6, Ganga Nagar, Bhubaneswar, Odisha 751001",
  },
  {
    id: "med_apollo_bbsr",
    name: "Apollo Hospitals Bhubaneswar",
    category: "hospital",
    subType: "hospital_24x7",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Sainik School Road, Unit 15",
    lat: 20.3068,
    lon: 85.8341,
    phone: "0674-6661066",
    emergencyPhone: "1066",
    is24x7: true,
    services: ["24x7 Emergency", "Critical Care", "24x7 Apollo Pharmacy"],
    address: "Plot No. 251, Sainik School Rd, Unit 15, Bhubaneswar, Odisha 751005",
  },
  {
    id: "med_apollo_pharmacy_master_canteen",
    name: "Apollo 24x7 Pharmacy (Master Canteen)",
    category: "pharmacy",
    subType: "pharmacy_24x7",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Master Canteen Square, Kharvel Nagar",
    lat: 20.2675,
    lon: 85.8428,
    phone: "0674-2534500",
    is24x7: true,
    services: ["24x7 Prescription Meds", "First Aid", "Surgical Supplies"],
    address: "Near Master Canteen Square, Kharvel Nagar, Bhubaneswar",
  },
  {
    id: "med_jan_aushadhi_airport",
    name: "Pradhan Mantri Jan Aushadhi & 24x7 Meds (Airport Road)",
    category: "pharmacy",
    subType: "pharmacy_24x7",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Airport Road, Forest Park",
    lat: 20.2545,
    lon: 85.8210,
    phone: "0674-2591122",
    is24x7: true,
    services: ["Generic Medicines", "Travel Medical Kits", "Emergency First Aid"],
    address: "Airport Road, Near Capital Hospital Gate 2, Bhubaneswar",
  },

  // Cuttack
  {
    id: "med_scb_cuttack",
    name: "SCB Medical College & Hospital (Apex Referral Center)",
    category: "hospital",
    subType: "trauma_center",
    city: "Cuttack",
    district: "Cuttack",
    locality: "Mangalabag",
    lat: 20.4625,
    lon: 85.8828,
    phone: "0671-2414080",
    emergencyPhone: "0671-2414343",
    is24x7: true,
    services: ["Super-specialty Trauma", "Level 1 Emergency", "Blood Bank 24x7"],
    address: "Mangalabag, Cuttack, Odisha 753007",
  },

  // Puri
  {
    id: "med_puri_dhh",
    name: "Puri District Headquarters Hospital (DHH) & Trauma Care",
    category: "hospital",
    subType: "hospital_24x7",
    city: "Puri",
    district: "Puri",
    locality: "Grand Road",
    lat: 19.8142,
    lon: 85.8289,
    phone: "06752-222044",
    emergencyPhone: "108",
    is24x7: true,
    services: ["Seaside Emergency Ward", "Trauma Care", "24x7 Pharmacy"],
    address: "Grand Road, Balagandi, Puri, Odisha 752001",
  },

  // Sambalpur
  {
    id: "med_vimsar_burla",
    name: "VIMSAR (Veer Surendra Sai Institute of Medical Sciences)",
    category: "hospital",
    subType: "trauma_center",
    city: "Sambalpur",
    district: "Sambalpur",
    locality: "Burla",
    lat: 21.4988,
    lon: 83.8712,
    phone: "0663-2430351",
    emergencyPhone: "0663-2430768",
    is24x7: true,
    services: ["Western Odisha Apex Trauma Center", "24x7 Emergency", "ICU"],
    address: "Burla, Sambalpur, Odisha 768017",
  },

  // Rourkela
  {
    id: "med_isp_rourkela",
    name: "Ispat General Hospital (IGH) & Super Specialty Rourkela",
    category: "hospital",
    subType: "hospital_24x7",
    city: "Rourkela",
    district: "Sundargarh",
    locality: "Sector 19",
    lat: 22.2541,
    lon: 84.8624,
    phone: "0661-2448888",
    is24x7: true,
    services: ["24x7 Emergency & Trauma", "Burn Center", "Diagnostic Labs"],
    address: "Sector 19, Rourkela, Odisha 769005",
  },

  // --- ATMs & CASH POINTS ---
  // Bhubaneswar
  {
    id: "atm_sbi_airport_bbsr",
    name: "State Bank of India (SBI) 24x7 Cash & Forex Lounge",
    category: "atm",
    subType: "atm_24x7",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Airport Terminal 1 Arrivals",
    lat: 20.2530,
    lon: 85.8185,
    bankName: "State Bank of India",
    is24x7: true,
    services: ["Cash Withdrawal", "International Cards Accepted", "Cash Deposit"],
    address: "Biju Patnaik Airport Terminal 1, Bhubaneswar",
  },
  {
    id: "atm_hdfc_master_canteen",
    name: "HDFC Bank 24x7 ATM & Cash Point",
    category: "atm",
    subType: "atm_24x7",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Master Canteen Square",
    lat: 20.2662,
    lon: 85.8440,
    bankName: "HDFC Bank",
    is24x7: true,
    services: ["Cash Withdrawal", "Fast Cash", "Mini Statement"],
    address: "Station Square, Master Canteen, Bhubaneswar",
  },
  {
    id: "atm_icici_jayadev_vihar",
    name: "ICICI Bank 24x7 Touch Banking & ATM",
    category: "atm",
    subType: "atm_24x7",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Jayadev Vihar",
    lat: 20.2990,
    lon: 85.8195,
    bankName: "ICICI Bank",
    is24x7: true,
    services: ["Cash Withdrawal", "Cash Deposit", "All Debit/Credit Cards"],
    address: "Near Pal Heights, Jayadev Vihar, Bhubaneswar",
  },
  {
    id: "atm_sbi_old_town_lingaraj",
    name: "SBI 24x7 ATM (Lingaraj Temple Heritage Zone)",
    category: "atm",
    subType: "atm_24x7",
    city: "Bhubaneswar",
    district: "Khordha",
    locality: "Old Town, Bindusagar Road",
    lat: 20.2392,
    lon: 85.8328,
    bankName: "State Bank of India",
    is24x7: true,
    services: ["Cash Withdrawal", "UPI Cash"],
    address: "Near Lingaraj Temple Police Outpost, Old Town, Bhubaneswar",
  },

  // Puri
  {
    id: "atm_sbi_grand_road_puri",
    name: "SBI 24x7 ATM (Grand Road & Temple Zone)",
    category: "atm",
    subType: "atm_24x7",
    city: "Puri",
    district: "Puri",
    locality: "Grand Road (Bada Danda)",
    lat: 19.8085,
    lon: 85.8260,
    bankName: "State Bank of India",
    is24x7: true,
    services: ["Cash Withdrawal", "International Cards", "24x7 CCTV Monitored"],
    address: "Grand Road, Near Jagannath Temple Singhadwara, Puri",
  },
  {
    id: "atm_axis_marine_drive_puri",
    name: "Axis Bank 24x7 ATM (Puri Beach Sea Beach Road)",
    category: "atm",
    subType: "atm_24x7",
    city: "Puri",
    district: "Puri",
    locality: "Sea Beach Road",
    lat: 19.7990,
    lon: 85.8340,
    bankName: "Axis Bank",
    is24x7: true,
    services: ["Cash Withdrawal", "Fast Cash"],
    address: "Sea Beach Road, Near Swargadwar, Puri",
  },

  // Konark
  {
    id: "atm_sbi_konark",
    name: "SBI 24x7 ATM (Konark Sun Temple Complex)",
    category: "atm",
    subType: "atm_24x7",
    city: "Konark",
    district: "Puri",
    locality: "Sun Temple Entrance",
    lat: 19.8865,
    lon: 86.0935,
    bankName: "State Bank of India",
    is24x7: true,
    services: ["Cash Withdrawal", "Tourist Cash Assistance"],
    address: "Main Gate Road, Konark, Puri District",
  },
];

/**
 * Great-circle distance calculation
 */
function haversineDistKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getNearbyEssentials(
  lat: number,
  lon: number,
  category?: "hospital" | "pharmacy" | "atm" | "medical",
  limit = 8
) {
  let pool = ODISHA_ESSENTIALS;
  if (category === "medical") {
    pool = pool.filter((e) => e.category === "hospital" || e.category === "pharmacy");
  } else if (category) {
    pool = pool.filter((e) => e.category === category);
  }

  const withDistance = pool.map((item) => {
    const distKm = haversineDistKm(lat, lon, item.lat, item.lon);
    return {
      ...item,
      distanceKm: distKm,
      distanceFormatted: distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`,
    };
  });

  withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  return withDistance.slice(0, limit);
}
