import { Station } from "./types";

export const demoStations: Station[] = [
  {
    id: "st-alpha",
    name: "VoltHub Alpha",
    city: "San Francisco",
    state: "CA",
    location: { lat: 37.7749, lng: -122.4194 },
    totalPorts: 8,
    availablePorts: 3,
    avgSessionMinutes: 25,
    chargerKW: 150,
    batteryCapacityKWh: 75,
    queueLength: 1,
    status: "Free",
    operator: "ChargePoint",
    connectorType: "CCS",
    distanceKm: 2.4
  },
  {
    id: "st-beta",
    name: "Electron Plaza",
    city: "San Francisco",
    state: "CA",
    location: { lat: 37.7849, lng: -122.4094 },
    totalPorts: 4,
    availablePorts: 0,
    avgSessionMinutes: 20,
    chargerKW: 250,
    batteryCapacityKWh: 75,
    queueLength: 4,
    status: "Busy",
    operator: "Tesla",
    connectorType: "NACS",
    distanceKm: 1.2
  },
  {
    id: "st-gamma",
    name: "GridLink Central",
    city: "San Francisco",
    state: "CA",
    location: { lat: 37.7649, lng: -122.4294 },
    totalPorts: 12,
    availablePorts: 8,
    avgSessionMinutes: 30,
    chargerKW: 120,
    batteryCapacityKWh: 75,
    queueLength: 0,
    status: "Free",
    operator: "EVGo",
    connectorType: "CCS",
    distanceKm: 4.8
  },
  {
    id: "st-delta",
    name: "Pulse Station West",
    city: "San Francisco",
    state: "CA",
    location: { lat: 37.7549, lng: -122.4394 },
    totalPorts: 6,
    availablePorts: 1,
    avgSessionMinutes: 15,
    chargerKW: 350,
    batteryCapacityKWh: 75,
    queueLength: 2,
    status: "Charging",
    operator: "Electrify America",
    connectorType: "CCS",
    distanceKm: 3.1
  }
];

export const MOCK_STATIONS = demoStations;
