import { FinancialSummary, ElectricityEntry } from '../types';

export function calculateSurface(length: number, width: number): number {
  if (isNaN(length) || isNaN(width) || length <= 0 || width <= 0) {
    return 0;
  }
  return Number((length * width).toFixed(2));
}

export function calculateDaysBetween(arrivalDateStr: string, departureDateStr?: string | null): number {
  if (!arrivalDateStr) return 0;
  const start = new Date(arrivalDateStr);
  const end = departureDateStr ? new Date(departureDateStr) : new Date();

  // Reset hours to compare purely calendar dates
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays); // Minimum 1 day of billing
}

export function getStampRate(ttcAmount: number): { rate: number; label: string } {
  if (ttcAmount <= 30000) {
    return { rate: 0.01, label: '1 %' };
  } else if (ttcAmount <= 100000) {
    return { rate: 0.015, label: '1,5 %' };
  } else {
    return { rate: 0.02, label: '2 %' };
  }
}

export function calculateElectricityDurationAndAmount(
  type: 'Horaire' | 'Demi-journée' | 'Journée',
  plugTime?: string,
  unplugTime?: string
): { durationHours: number; amount: number } {
  if (type === 'Demi-journée') {
    return { durationHours: 4, amount: 600 };
  }
  if (type === 'Journée') {
    return { durationHours: 8, amount: 1200 };
  }

  // Horaire
  if (!plugTime || !unplugTime) {
    return { durationHours: 1, amount: 30 };
  }

  const [startH, startM] = plugTime.split(':').map(Number);
  const [endH, endM] = unplugTime.split(':').map(Number);

  let startMinutes = startH * 60 + (startM || 0);
  let endMinutes = endH * 60 + (endM || 0);

  if (endMinutes <= startMinutes) {
    // Handle overnight or minimum 1 hr
    endMinutes += 24 * 60;
  }

  const diffHours = (endMinutes - startMinutes) / 60;
  const roundedHours = Math.max(1, Math.ceil(diffHours));
  const amount = roundedHours * 30;

  return { durationHours: roundedHours, amount };
}

export function calculateFinancialSummary(
  surface: number,
  arrivalDate: string,
  departureDate: string | null,
  craneAccess: boolean,
  electricityEntries: ElectricityEntry[]
): FinancialSummary {
  const stayDays = calculateDaysBetween(arrivalDate, departureDate);
  const stayRatePerM2PerDay = 25; // 25 DA / m² / jour

  const stayAmountHT = Number((stayDays * surface * stayRatePerM2PerDay).toFixed(2));
  const stayTvaRate = 0.19; // 19%
  const stayTvaAmount = Number((stayAmountHT * stayTvaRate).toFixed(2));
  const stayTtc = Number((stayAmountHT + stayTvaAmount).toFixed(2));

  const { rate: stayStampRate } = getStampRate(stayTtc);
  const stayStampAmount = Number((stayTtc * stayStampRate).toFixed(2));
  const stayTotal = Number((stayTtc + stayStampAmount).toFixed(2));

  // Crane calculations
  let craneAmountHT = 0;
  let craneTvaRate = 0.19;
  let craneTvaAmount = 0;
  let craneTtc = 0;
  let craneStampRate = 0.01;
  let craneStampAmount = 0;
  let craneTotal = 0;

  if (craneAccess) {
    craneAmountHT = 4201.68;
    craneTvaRate = 0.19;
    craneTvaAmount = 798.32;
    craneTtc = 5000.00;
    craneStampRate = 0.01; // 1% for 5 000 DA
    craneStampAmount = 50.00;
    craneTotal = 5050.00;
  }

  // Electricity calculations
  const electricityTotal = electricityEntries.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Grand total
  const grandTotal = Number((stayTotal + craneTotal + electricityTotal).toFixed(2));
  const grandTotalInWords = numberToFrenchWords(grandTotal);

  return {
    stayDays,
    surface,
    stayRatePerM2PerDay,
    stayAmountHT,
    stayTvaRate,
    stayTvaAmount,
    stayTtc,
    stayStampRate,
    stayStampAmount,
    stayTotal,

    craneAccess,
    craneAmountHT,
    craneTvaRate,
    craneTvaAmount,
    craneTtc,
    craneStampRate,
    craneStampAmount,
    craneTotal,

    electricityTotal,

    grandTotal,
    grandTotalInWords,
  };
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted}\u00A0DA`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

// Convert numbers into French words for official Algerian receipts
export function numberToFrenchWords(n: number): string {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  function convertGroup(num: number): string {
    let result = '';
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;

    if (hundreds > 0) {
      if (hundreds === 1) {
        result += 'cent ';
      } else {
        result += units[hundreds] + ' cent ';
      }
    }

    if (remainder > 0) {
      if (remainder < 10) {
        result += units[remainder] + ' ';
      } else if (remainder < 20) {
        result += teens[remainder - 10] + ' ';
      } else {
        const ten = Math.floor(remainder / 10);
        const unit = remainder % 10;

        if (ten === 7) {
          result += 'soixante-' + teens[unit] + ' ';
        } else if (ten === 9) {
          result += 'quatre-vingt-' + teens[unit] + ' ';
        } else if (ten === 8 && unit === 0) {
          result += 'quatre-vingts ';
        } else {
          if (unit === 1 && ten !== 8) {
            result += tens[ten] + ' et un ';
          } else if (unit > 0) {
            result += tens[ten] + '-' + units[unit] + ' ';
          } else {
            result += tens[ten] + ' ';
          }
        }
      }
    }

    return result.trim();
  }

  const integerPart = Math.floor(n);
  const decimalPart = Math.round((n - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return 'Zéro dinar algérien';
  }

  let words = '';

  const billions = Math.floor(integerPart / 1000000000);
  const millions = Math.floor((integerPart % 1000000000) / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const ones = integerPart % 1000;

  if (billions > 0) {
    words += convertGroup(billions) + (billions > 1 ? ' milliards ' : ' milliard ');
  }
  if (millions > 0) {
    words += convertGroup(millions) + (millions > 1 ? ' millions ' : ' million ');
  }
  if (thousands > 0) {
    if (thousands === 1) {
      words += 'mille ';
    } else {
      words += convertGroup(thousands) + ' mille ';
    }
  }
  if (ones > 0) {
    words += convertGroup(ones) + ' ';
  }

  words = words.trim();
  if (!words) {
    words = 'zéro';
  }

  let finalStr = words.charAt(0).toUpperCase() + words.slice(1) + ' dinars algériens';
  if (decimalPart > 0) {
    finalStr += ` et ${convertGroup(decimalPart)} centimes`;
  }

  return finalStr;
}
