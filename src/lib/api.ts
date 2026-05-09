import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Station } from './types';
import { MOCK_STATIONS } from './mock-data';

/**
 * Fetches nearby EV charging stations. 
 * Defaults to mock data in demo mode.
 */
export const fetchNearbyStations = async (isDemo: boolean = true): Promise<Station[]> => {
  if (isDemo) {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_STATIONS), 800));
  }

  try {
    const stationsRef = collection(db, 'stations');
    const q = query(stationsRef, where('status', '==', 'Online'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Station[];
  } catch (error) {
    console.error("Error fetching stations:", error);
    return MOCK_STATIONS;
  }
};

/**
 * Fetches current availability for a specific station.
 */
export const fetchStationAvailability = async (stationId: string, isDemo: boolean = true): Promise<Partial<Station>> => {
  if (isDemo) {
    const station = MOCK_STATIONS.find(s => s.id === stationId);
    return { 
      availablePorts: station?.availablePorts || 0,
      status: station?.status || 'Online'
    };
  }

  try {
    const docRef = doc(db, 'stations', stationId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        availablePorts: data.availablePorts,
        status: data.status
      };
    }
    return {};
  } catch (error) {
    console.error("Error fetching station availability:", error);
    return {};
  }
};

/**
 * Mock function for route ETA calculation. 
 * In production, this would call Google Maps Distance Matrix API.
 */
export const fetchRouteETA = async (origin: {lat: number, lng: number}, destination: {lat: number, lng: number}) => {
  return { travelMinutes: 15 };
};

/**
 * Mock function for map-specific data layers.
 */
export const fetchMapData = async () => {
  return { layers: [] };
};
