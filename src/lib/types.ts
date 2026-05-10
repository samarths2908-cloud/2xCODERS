export type StationStatus = 'Free' | 'Busy' | 'Charging' | 'Delayed';

export interface Location {
  lat: number;
  lng: number;
}

export interface Station {
  id: string;
  name: string;
  city: string;
  state: string;
  location: Location;
  totalPorts: number;
  availablePorts: number;
  avgSessionMinutes: number;
  chargerKW: number;
  batteryCapacityKWh: number;
  queueLength: number;
  status: StationStatus;
  operator: string;
  connectorType: string;
  distanceKm: number;
  usageType: string;
  latitude: number;
  longitude: number;
}

export interface RankedStation extends Station {
  travelMinutes: number;
  waitMinutes: number;
  chargeMinutes: number;
  totalEffectiveMinutes: number;
  score: number;
}

export interface User {
  uid: string;
  name: string;
  carModel: string;
  batteryCapacityKWh: number;
  currentBattery: number;
  targetBattery: number;
}

export interface Booking {
  id: string;
  stationId: string;
  date: string;
  startTime: string; // HH:mm
  duration: number; // minutes
  userEmail: string;
}
