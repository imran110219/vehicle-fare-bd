"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type LatLng = { lat: number; lng: number };

type Props = {
  label: string;
  value?: LatLng;
  onChange: (value: LatLng) => void;
};

const DEFAULT_CENTER: LatLng = { lat: 23.8103, lng: 90.4125 };

export function MapPicker({ label, value, onChange }: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
      zoom: 12
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("click", (event) => {
      const next = { lat: event.lngLat.lat, lng: event.lngLat.lng };
      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({ color: "#2f8f7f" })
          .setLngLat([next.lng, next.lat])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([next.lng, next.lat]);
      }
      onChange(next);
    });

    mapRef.current = map;

    return () => {
      markerRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, [onChange]);

  useEffect(() => {
    if (!mapRef.current || !value) return;
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color: "#2f8f7f" })
        .setLngLat([value.lng, value.lat])
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([value.lng, value.lat]);
    }
    mapRef.current.flyTo({ center: [value.lng, value.lat], zoom: 13 });
  }, [value]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <div ref={containerRef} className="map-container rounded-xl border border-brand-200" />
    </div>
  );
}
