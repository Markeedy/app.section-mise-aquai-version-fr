export type BoatType = 'Sardinier' | 'Petit métier' | 'Plaisance' | 'Pêche' | 'Chalutier';

export type BoatCategory = 'Acier' | 'Bois' | 'Polyester';

export type Port = 'Gouraya' | 'Cherchell' | 'Tipaza' | 'Bouharoun' | 'Khemisti';

export type ElectricityType = 'Horaire' | 'Demi-journée' | 'Journée';

export type MovementStatus = 'EN COURS' | 'TERMINÉE';

export interface ElectricityEntry {
  id: string;
  voucherNumber: string; // N° Bon
  movementId: string;
  clientCode: string;
  boatRegistration: string;
  date: string; // YYYY-MM-DD
  type: ElectricityType;
  plugTime?: string; // HH:mm
  unplugTime?: string; // HH:mm
  durationHours?: number;
  amount: number; // Montant en DA (HT, sans TVA ni Timbre)
  createdAt: string;
}

export interface FinancialSummary {
  // Stay calculations
  stayDays: number;
  surface: number;
  stayRatePerM2PerDay: number; // 25 DA
  stayAmountHT: number;
  stayTvaRate: number; // 0.19
  stayTvaAmount: number;
  stayTtc: number;
  stayStampRate: number; // 0.01, 0.015, or 0.02
  stayStampAmount: number;
  stayTotal: number;

  // Crane calculations
  craneAccess: boolean;
  craneAmountHT: number; // 4 201,68 DA
  craneTvaRate: number; // 0.19
  craneTvaAmount: number; // 798,32 DA
  craneTtc: number; // 5 000,00 DA
  craneStampRate: number; // 0.01
  craneStampAmount: number; // 50,00 DA
  craneTotal: number; // 5 050,00 DA

  // Electricity calculations
  electricityTotal: number; // Somme HT

  // Global total
  grandTotal: number; // stayTotal + craneTotal + electricityTotal
  grandTotalInWords: string; // Montant en toutes lettres (Dinars Algériens)
}

export interface Movement {
  id: string;
  clientCode: string;
  ownerName: string;
  phone: string;
  address: string;

  boatName: string;
  registrationNumber: string;
  boatType: BoatType;
  boatCategory: BoatCategory;
  port: Port;
  length: number; // mètres
  width: number; // mètres
  surface: number; // m² = length * width

  arrivalDate: string; // Date de mise à quai (YYYY-MM-DD)
  departureDate: string | null; // Date de mise à l'eau (YYYY-MM-DD) ou null
  status: MovementStatus;

  craneAccess: boolean;
  electricityEntries: ElectricityEntry[];
  financialSummary?: FinancialSummary;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  clientCode: string;
  ownerName: string;
  phone: string;
  address: string;
  boats: {
    boatName: string;
    registrationNumber: string;
    boatType: BoatType;
    boatCategory: BoatCategory;
    port: Port;
    length: number;
    width: number;
    surface: number;
  }[];
}

export type ActiveTab = 'movement' | 'active_operations' | 'electricity' | 'history';
