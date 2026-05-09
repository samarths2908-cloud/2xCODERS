import { Station, Port, User } from './types';

export const MOCK_STATIONS: Station[] = [
  {
    id: 'st-1',
    name: 'VoltHub Downtown',
    location: { latitude: 34.0522, longitude: -118.2437 },
    totalPorts: 12,
    availablePorts: 4,
    averageWaitMinutes: 5,
    status: 'Online',
    updatedAt: new Date().toISOString(),
    congestionLevel: 0.4,
    pricePerKWh: 0.35,
  },
  {
    id: 'st-2',
    name: 'EcoCharge Plaza',
    location: { latitude: 34.0622, longitude: -118.2537 },
    totalPorts: 8,
    availablePorts: 0,
    averageWaitMinutes: 25,
    status: 'Busy',
    updatedAt: new Date().toISOString(),
    congestionLevel: 0.9,
    pricePerKWh: 0.28,
  },
  {
    id: 'st-3',
    name: 'SuperVolt Express',
    location: { latitude: 34.0422, longitude: -118.2337 },
    totalPorts: 6,
    availablePorts: 2,
    averageWaitMinutes: 0,
    status: 'Online',
    updatedAt: new Date().toISOString(),
    congestionLevel: 0.1,
    pricePerKWh: 0.45,
  },
];

export const MOCK_PORTS: Port[] = [
  { id: 'p1', stationId: 'st-1', status: 'Free', type: 'DC Fast', powerKW: 150 },
  { id: 'p2', stationId: 'st-1', status: 'Charging', type: 'DC Fast', powerKW: 150 },
  { id: 'p3', stationId: 'st-1', status: 'Busy', type: 'Level 2', powerKW: 22 },
  { id: 'p4', stationId: 'st-2', status: 'Busy', type: 'DC Fast', powerKW: 100 },
];

export const CURRENT_USER: User = {
  uid: 'u-1',
  name: 'Alex Driver',
  email: 'alex@example.com',
  role: 'driver',
  carModel: 'Tesla Model 3',
  batteryCapacityKWh: 75,
};
