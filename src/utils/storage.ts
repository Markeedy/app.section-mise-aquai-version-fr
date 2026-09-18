import { Movement, ClientProfile, ElectricityEntry } from '../types';
import { calculateFinancialSummary } from './calculations';

const STORAGE_KEY_MOVEMENTS = 'sgpp_movements_v1';
const STORAGE_KEY_CLIENTS = 'sgpp_clients_v1';

// Initial seed data representing real port operations
const INITIAL_MOVEMENTS: Movement[] = [
  {
    id: 'MVT-2026-001',
    clientCode: 'CL-001',
    ownerName: 'Messaoudi Karim',
    phone: '0550 12 34 56',
    address: 'Quartier du Port, Tipaza',
    boatName: 'El Manar II',
    registrationNumber: 'TIP-4521',
    boatType: 'Sardinier',
    boatCategory: 'Bois',
    port: 'Tipaza',
    length: 12.5,
    width: 3.8,
    surface: 47.5,
    arrivalDate: '2026-08-15',
    departureDate: null,
    status: 'EN COURS',
    craneAccess: true,
    electricityEntries: [
      {
        id: 'ELEC-101',
        voucherNumber: 'BE-001',
        movementId: 'MVT-2026-001',
        clientCode: 'CL-001',
        boatRegistration: 'TIP-4521',
        date: '2026-08-16',
        type: 'Journée',
        durationHours: 8,
        amount: 1200,
        createdAt: '2026-08-16T08:00:00Z',
      },
      {
        id: 'ELEC-102',
        voucherNumber: 'BE-002',
        movementId: 'MVT-2026-001',
        clientCode: 'CL-001',
        boatRegistration: 'TIP-4521',
        date: '2026-08-18',
        type: 'Horaire',
        plugTime: '08:00',
        unplugTime: '12:00',
        durationHours: 4,
        amount: 120,
        createdAt: '2026-08-18T08:00:00Z',
      },
    ],
    createdAt: '2026-08-15T09:30:00Z',
    updatedAt: '2026-08-18T12:00:00Z',
  },
  {
    id: 'MVT-2026-002',
    clientCode: 'CL-002',
    ownerName: 'Boualem Rachid',
    phone: '0661 78 90 12',
    address: 'Rue de la Marine, Cherchell',
    boatName: 'Nadjmet El Bahr',
    registrationNumber: 'CHR-1180',
    boatType: 'Chalutier',
    boatCategory: 'Acier',
    port: 'Cherchell',
    length: 16.0,
    width: 4.5,
    surface: 72.0,
    arrivalDate: '2026-08-20',
    departureDate: null,
    status: 'EN COURS',
    craneAccess: true,
    electricityEntries: [
      {
        id: 'ELEC-103',
        voucherNumber: 'BE-003',
        movementId: 'MVT-2026-002',
        clientCode: 'CL-002',
        boatRegistration: 'CHR-1180',
        date: '2026-08-21',
        type: 'Demi-journée',
        durationHours: 4,
        amount: 600,
        createdAt: '2026-08-21T08:00:00Z',
      },
    ],
    createdAt: '2026-08-20T10:15:00Z',
    updatedAt: '2026-08-21T12:00:00Z',
  },
  {
    id: 'MVT-2026-003',
    clientCode: 'CL-003',
    ownerName: 'Haddad Youcef',
    phone: '0770 45 67 89',
    address: 'Boulevard Front de Mer, Bouharoun',
    boatName: 'Alouette des Mers',
    registrationNumber: 'BOU-9823',
    boatType: 'Plaisance',
    boatCategory: 'Polyester',
    port: 'Bouharoun',
    length: 8.2,
    width: 2.7,
    surface: 22.14,
    arrivalDate: '2026-08-01',
    departureDate: '2026-08-10',
    status: 'TERMINÉE',
    craneAccess: true,
    electricityEntries: [
      {
        id: 'ELEC-104',
        voucherNumber: 'BE-004',
        movementId: 'MVT-2026-003',
        clientCode: 'CL-003',
        boatRegistration: 'BOU-9823',
        date: '2026-08-03',
        type: 'Horaire',
        plugTime: '08:00',
        unplugTime: '11:00',
        durationHours: 3,
        amount: 90,
        createdAt: '2026-08-03T08:00:00Z',
      },
    ],
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-10T14:00:00Z',
  },
];

// Pre-calculate financial summary for closed sample
INITIAL_MOVEMENTS[2].financialSummary = calculateFinancialSummary(
  INITIAL_MOVEMENTS[2].surface,
  INITIAL_MOVEMENTS[2].arrivalDate,
  INITIAL_MOVEMENTS[2].departureDate,
  INITIAL_MOVEMENTS[2].craneAccess,
  INITIAL_MOVEMENTS[2].electricityEntries
);

export function getStoredMovements(): Movement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOVEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
      return INITIAL_MOVEMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading movements from storage:', err);
    return INITIAL_MOVEMENTS;
  }
}

export function saveMovements(movements: Movement[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(movements));
    updateClientRegistryFromMovements(movements);
  } catch (err) {
    console.error('Error saving movements to storage:', err);
  }
}

export function getClientProfiles(): ClientProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLIENTS);
    if (raw) {
      return JSON.parse(raw);
    }
    // Build initial clients from seed data
    const clients = buildClientRegistry(getStoredMovements());
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
    return clients;
  } catch (err) {
    console.error('Error loading clients:', err);
    return [];
  }
}

function buildClientRegistry(movements: Movement[]): ClientProfile[] {
  const map = new Map<string, ClientProfile>();
  movements.forEach((m) => {
    const existing = map.get(m.clientCode) || {
      clientCode: m.clientCode,
      ownerName: m.ownerName,
      phone: m.phone,
      address: m.address,
      boats: [],
    };

    // Update with newest details
    existing.ownerName = m.ownerName || existing.ownerName;
    existing.phone = m.phone || existing.phone;
    existing.address = m.address || existing.address;

    const boatExists = existing.boats.some((b) => b.registrationNumber === m.registrationNumber);
    if (!boatExists && m.boatName && m.registrationNumber) {
      existing.boats.push({
        boatName: m.boatName,
        registrationNumber: m.registrationNumber,
        boatType: m.boatType,
        boatCategory: m.boatCategory,
        port: m.port,
        length: m.length,
        width: m.width,
        surface: m.surface,
      });
    }

    map.set(m.clientCode, existing);
  });
  return Array.from(map.values());
}

function updateClientRegistryFromMovements(movements: Movement[]): void {
  const clients = buildClientRegistry(movements);
  localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
}

export function generateMovementId(): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `MVT-${currentYear}-${randomSuffix}`;
}

export function generateVoucherNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `BE-${num}`;
}
