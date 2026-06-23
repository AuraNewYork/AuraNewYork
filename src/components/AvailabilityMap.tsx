import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabase';
import type { UnitData } from '../pages/Availability';
import styles from './AvailabilityMap.module.css';

import 'leaflet/dist/leaflet.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface BuildingGeo {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  neighborhood: string;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function AvailabilityMap({ units }: { units: UnitData[] }) {
  const [buildings, setBuildings] = useState<BuildingGeo[]>([]);

  useEffect(() => {
    supabase
      .from('site_buildings')
      .select('id, name, latitude, longitude, neighborhood')
      .not('latitude', 'is', null)
      .then(({ data }) => {
        if (data) setBuildings(data as BuildingGeo[]);
      });
  }, []);

  const buildingUnits = useMemo(() => {
    const map = new Map<string, UnitData[]>();
    units.forEach((u) => {
      const bName = u.building.split(' - ')[0].trim().toLowerCase();
      if (!map.has(bName)) map.set(bName, []);
      map.get(bName)!.push(u);
    });
    return map;
  }, [units]);

  return (
    <div className={styles.mapWrap}>
      <MapContainer
        center={[40.735, -74.0]}
        zoom={13}
        className={styles.map}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {buildings.map((b) => {
          const bUnits = buildingUnits.get(b.name.toLowerCase()) || [];
          return (
            <Marker key={b.id} position={[b.latitude, b.longitude]} icon={markerIcon}>
              <Popup>
                <div className={styles.popup}>
                  <strong>{b.name}</strong>
                  <span className={styles.popHood}>{b.neighborhood}</span>
                  {bUnits.length > 0 ? (
                    <div className={styles.popUnits}>
                      <span>{bUnits.length} unit{bUnits.length !== 1 ? 's' : ''} available</span>
                      <span className={styles.popPrice}>
                        From {formatPrice(Math.min(...bUnits.map((u) => u.net)))}
                      </span>
                    </div>
                  ) : (
                    <span className={styles.popNone}>No current availability</span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
