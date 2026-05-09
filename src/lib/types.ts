export type PortStatus = 'Free' | 'Busy' | 'Charging' | 'Delayed';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Port {
  id: string;
  stationId: string;
  status: PortStatus;
  type: 'Level 2' | 'DC Fast';
  powerKW: number;
}

export interface Station {
  id: string;
  name: string;
  location: Location;
  totalPorts: number;
  availablePorts: number;
  averageWaitMinutes: number;
  status: 'Online' | 'Offline' | 'Busy';
  updatedAt: string;
  congestionLevel: number; // 0 to 1
  pricePerKWh: number;
}

export interface Booking {
  id: string;
  userId: string;
  stationId: string;
  portId: string;
  currentBattery: number;
  targetBattery: number;
  travelMinutes: number;
  waitMinutes: number;
  chargeMinutes: number;
  totalEstimatedMinutes: number;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
  bookedAt: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'driver' | 'admin';
  carModel: string;
  batteryCapacityKWh: number;
}
