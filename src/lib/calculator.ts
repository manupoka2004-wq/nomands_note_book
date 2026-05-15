/**
 * Trip Booking Calculation Engine
 * Handles Taxi Fares, Hotel Budgets, and Full Trip Planning
 */

export type VehicleType = 'bike' | 'auto' | 'sedan' | 'suv' | 'van';

export interface TaxiFareInputs {
  pickup: string;
  destination: string;
  distanceKm: number;
  travelTimeMins: number;
  vehicleType: VehicleType;
  surgeMultiplier?: number;
  isNightCharge?: boolean;
  tollCharges?: number;
  waitingTimeMins?: number;
  promoCode?: string;
  fuelAdjustmentFactor?: number; // e.g., 1.05 for 5% increase in fuel prices
}

export interface TaxiFareResult {
  baseFare: number;
  distanceCost: number;
  waitingCost: number;
  tollCharges: number;
  subtotal: number;
  discountAmount: number;
  nightChargeAmount: number;
  surgeAmount: number;
  taxAmount: number;
  finalFare: number;
  driverEarnings: number;
  platformEarnings: number;
  breakdown: {
    label: string;
    value: number;
  }[];
}

export interface HotelBudgetInputs {
  roomPricePerNight: number;
  nights: number;
  rooms: number;
  foodBudgetPerDay: number;
  localTransportPerDay: number;
}

export interface HotelBudgetResult {
  hotelCost: number;
  foodCost: number;
  transportCost: number;
  subtotal: number;
  emergencyBuffer: number;
  totalBudget: number;
}

export interface FullTripInputs {
  taxiInputs: TaxiFareInputs;
  hotelInputs: HotelBudgetInputs;
  sightseeingBudget: number;
  insuranceCost: number;
}

export interface FullTripResult {
  taxiTotal: number;
  hotelTotal: number;
  sightseeingTotal: number;
  insuranceTotal: number;
  grandTotal: number;
  dailyAverage: number;
  savingsSuggestion: string;
  chartData: { name: string; value: number }[];
}

// --- Constants & Rules ---

const VEHICLE_RATES: Record<VehicleType, number> = {
  bike: 8,
  auto: 12,
  sedan: 15,
  suv: 20,
  van: 25
};

const PROMO_CODES: Record<string, number> = {
  'WELCOME10': 0.10,
  'TRIPMAKER': 0.15,
  'SAVE50': 50, // Flat discount example
};

const BASE_FARE = 50;
const WAITING_RATE = 2;
const GST_RATE = 0.05;
const NIGHT_CHARGE_RATE = 0.10;
const LONG_TRIP_DISCOUNT_RATE = 0.05;
const MINIMUM_FARE = 100;

// --- Engine Implementation ---

export const CalculatorEngine = {
  /**
   * Calculate Taxi Fare based on complex pricing rules
   */
  calculateTaxiFare(inputs: TaxiFareInputs): TaxiFareResult {
    const {
      distanceKm,
      vehicleType,
      surgeMultiplier = 1,
      isNightCharge = false,
      tollCharges = 0,
      waitingTimeMins = 0,
      promoCode,
      fuelAdjustmentFactor = 1
    } = inputs;

    const vehicleRate = VEHICLE_RATES[vehicleType] * fuelAdjustmentFactor;
    const distanceCost = distanceKm * vehicleRate;
    const waitingCost = waitingTimeMins * WAITING_RATE;

    let subtotal = BASE_FARE + distanceCost + waitingCost + tollCharges;

    // 1. Long Trip Discount (Above 20 KM)
    let discountAmount = 0;
    if (distanceKm > 20) {
      discountAmount = subtotal * LONG_TRIP_DISCOUNT_RATE;
      subtotal -= discountAmount;
    }

    // 2. Night Charge
    let nightChargeAmount = 0;
    if (isNightCharge) {
      nightChargeAmount = subtotal * NIGHT_CHARGE_RATE;
      subtotal += nightChargeAmount;
    }

    // 3. Surge Multiplier
    const surgeAmount = (subtotal * surgeMultiplier) - subtotal;
    subtotal += surgeAmount;

    // 4. Promo Code
    if (promoCode && PROMO_CODES[promoCode]) {
      const promoValue = PROMO_CODES[promoCode];
      const promoDiscount = promoValue < 1 ? subtotal * promoValue : promoValue;
      discountAmount += promoDiscount;
      subtotal -= promoDiscount;
    }

    // 5. GST
    const taxAmount = subtotal * GST_RATE;
    let finalFare = subtotal + taxAmount;

    // 6. Minimum Fare Check
    if (finalFare < MINIMUM_FARE) {
      finalFare = MINIMUM_FARE;
    }

    const driverEarnings = finalFare * 0.80;
    const platformEarnings = finalFare * 0.20;

    return {
      baseFare: BASE_FARE,
      distanceCost,
      waitingCost,
      tollCharges,
      subtotal,
      discountAmount,
      nightChargeAmount,
      surgeAmount,
      taxAmount,
      finalFare,
      driverEarnings,
      platformEarnings,
      breakdown: [
        { label: 'Base Fare', value: BASE_FARE },
        { label: 'Distance Cost', value: distanceCost },
        { label: 'Waiting Time', value: waitingCost },
        { label: 'Tolls', value: tollCharges },
        { label: 'Night Surcharge', value: nightChargeAmount },
        { label: 'Surge Pricing', value: surgeAmount },
        { label: 'Discounts', value: -discountAmount },
        { label: 'GST (5%)', value: taxAmount }
      ]
    };
  },

  /**
   * Calculate Hotel and Daily Expenses Budget
   */
  calculateHotelBudget(inputs: HotelBudgetInputs): HotelBudgetResult {
    const { roomPricePerNight, nights, rooms, foodBudgetPerDay, localTransportPerDay } = inputs;

    const hotelCost = roomPricePerNight * nights * rooms;
    const foodCost = foodBudgetPerDay * nights;
    const transportCost = localTransportPerDay * nights;

    const subtotal = hotelCost + foodCost + transportCost;
    const emergencyBuffer = subtotal * 0.10;
    const totalBudget = subtotal + emergencyBuffer;

    return {
      hotelCost,
      foodCost,
      transportCost,
      subtotal,
      emergencyBuffer,
      totalBudget
    };
  },

  /**
   * Full Trip Planner Mode
   */
  calculateFullTrip(inputs: FullTripInputs): FullTripResult {
    const taxiResult = this.calculateTaxiFare(inputs.taxiInputs);
    const hotelResult = this.calculateHotelBudget(inputs.hotelInputs);

    const grandTotal = 
      taxiResult.finalFare + 
      hotelResult.totalBudget + 
      inputs.sightseeingBudget + 
      inputs.insuranceCost;

    const nights = inputs.hotelInputs.nights || 1;
    const dailyAverage = grandTotal / (nights + 1); // +1 for travel day

    let savingsSuggestion = "Your budget looks well-optimized!";
    if (hotelResult.hotelCost > grandTotal * 0.5) {
      savingsSuggestion = "Consider a more budget-friendly hotel to save up to 20%.";
    } else if (taxiResult.finalFare > grandTotal * 0.2) {
      savingsSuggestion = "Using public transport or 'Economy' rides could reduce costs.";
    }

    return {
      taxiTotal: taxiResult.finalFare,
      hotelTotal: hotelResult.totalBudget,
      sightseeingTotal: inputs.sightseeingBudget,
      insuranceTotal: inputs.insuranceCost,
      grandTotal,
      dailyAverage,
      savingsSuggestion,
      chartData: [
        { name: 'Transport', value: taxiResult.finalFare },
        { name: 'Stay & Food', value: hotelResult.totalBudget },
        { name: 'Sightseeing', value: inputs.sightseeingBudget },
        { name: 'Insurance', value: inputs.insuranceCost }
      ]
    };
  },

  /**
   * Get Dynamic Surge Multiplier based on current hour
   */
  getDynamicSurge(): number {
    const hour = new Date().getHours();
    // Peak hours: 8-10 AM and 6-9 PM
    if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21)) {
      return 1.5;
    }
    // Late night: 11 PM - 4 AM
    if (hour >= 23 || hour <= 4) {
      return 1.2;
    }
    return 1.0;
  }
};
