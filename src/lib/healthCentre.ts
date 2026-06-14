export type UserRole = 'Admin' | 'Doctor' | 'Receptionist' | 'Patient';
export type Nationality = 'Indian' | 'Non-Indian';
export type Gender = 'Male' | 'Female';
export type BookingType = 'OPD' | 'Day Stay' | 'IPD';
export type RoomCategory = 'Double' | 'Family' | 'Ladies Dormitory' | "Men's Dormitory";

export const OPD_PRICE = 50;
export const DAY_STAY_PRICE = 400;
export const DAY_STAY_TIME_LABEL = 'Day Stay (10:00 AM - 5:00 PM)';
export const OPD_TIME_SLOTS = [
  '10:00 - 10:30',
  '10:30 - 11:00',
  '11:00 - 11:30',
  '11:30 - 12:00',
  '12:00 - 12:30',
] as const;

export const ROOM_CAPACITY_OPTIONS: Record<RoomCategory, number[]> = {
  Double: [1, 2],
  Family: [1, 2, 3, 4],
  'Ladies Dormitory': [36],
  "Men's Dormitory": [25],
};

export function isOperationalDay(date: Date) {
  const day = date.getUTCDay();
  return day >= 1 && day <= 6;
}

export function calculateStayDays(checkInDate?: string, checkOutDate?: string) {
  if (!checkInDate || !checkOutDate) {
    return 1;
  }

  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diffInMs = end.getTime() - start.getTime();
  const stayDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return stayDays > 0 ? stayDays : 1;
}

export function validateRoomConfig(category: RoomCategory, totalBeds: number) {
  return ROOM_CAPACITY_OPTIONS[category].includes(totalBeds);
}

export function resolveMaxOccupancy(category: RoomCategory, totalBeds: number) {
  if (!validateRoomConfig(category, totalBeds)) {
    throw new Error(`Invalid bed capacity for ${category}.`);
  }

  if (category === 'Double') {
    return totalBeds;
  }

  if (category === 'Family') {
    return totalBeds;
  }

  return totalBeds;
}

export function calculateStayPricing({
  nationality,
  roomCategory,
  sharingOccupants,
  stayDays = 1,
}: {
  nationality: Nationality;
  roomCategory: RoomCategory;
  sharingOccupants: number;
  stayDays?: number;
}) {
  const safeStayDays = stayDays > 0 ? stayDays : 1;

  if (roomCategory === 'Double') {
    if (![1, 2].includes(sharingOccupants)) {
      throw new Error('Double rooms support 1 or 2 adults only.');
    }

    const pricePerDay = sharingOccupants === 1 ? 3000 : nationality === 'Indian' ? 1800 : 2000;
    const billingUnits = sharingOccupants === 1 ? 1 : sharingOccupants;

    return {
      pricePerDay,
      billingUnits,
      rateLabel: sharingOccupants === 1 ? 'per room' : 'per adult',
      totalAmount: pricePerDay * billingUnits * safeStayDays,
    };
  }

  if (roomCategory === 'Family') {
    if (sharingOccupants < 1 || sharingOccupants > 4) {
      throw new Error('Family rooms support up to 4 adults.');
    }

    const pricePerDay = nationality === 'Indian' ? 2500 : 3000;

    return {
      pricePerDay,
      billingUnits: 1,
      rateLabel: 'per room',
      totalAmount: pricePerDay * safeStayDays,
    };
  }

  if (sharingOccupants !== 1) {
    throw new Error('Dormitory stays are billed per bed for one occupant.');
  }

  const pricePerDay = nationality === 'Indian' ? 1000 : 1500;

  return {
    pricePerDay,
    billingUnits: 1,
    rateLabel: 'per bed',
    totalAmount: pricePerDay * safeStayDays,
  };
}
