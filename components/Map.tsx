"use client";

import React, { useEffect, useRef } from 'react';

interface Temp {
  code: string | null;
  rank: number;
  pref: string;
  city: string;
  temp: string;
  time: string;
  lat: number;
  lon: number;
}

interface Props {
  data: Temp[];
  selectedId: string | null;
  onSelect: (code: string | null) => void;
}

const getRankColor = (rank: number | string) => {
  const r = Number(rank);
  if (r === 1) return '#FF0000'; // 赤
  if (r === 2) return '#FF8C00'; // オレンジ
  if (r === 3) return '#FFFF00'; // 黄色
  if (r >= 4 && r <= 6) return '#ADFF2F'; // 黄緑
  if (r >= 7 && r <= 10) return '#00BFFF'; // 水色
  return '#808080'; // その他
};

export default function Map({ data, selectedId, onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<{ [key: string]: google.maps.Marker }>({});
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // マップ初期化
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const check = setInterval(() => {
      if (window.google && window.google.maps && mapRef.current) {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 37, lng: 139 },
          zoom: 5,
        });
        infoWindowRef.current = new window.google.maps.InfoWindow();
        clearInterval(check);
      }
    }, 100);

    return () => clearInterval(check);
  }, []);

  // マーカー生成
  useEffect(() => {
    if (!mapInstance.current) return;

    // 既存マーカー削除
    Object.values(markers.current).forEach((m) => m.setMap(null));
    markers.current = {};

    data.forEach((spot) => {
      if (!spot.lat || !spot.lon) return;

      const marker = new google.maps.Marker({
        position: { lat: spot.lat, lng: spot.lon },
        map: mapInstance.current!,
        label: `${spot.rank}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getRankColor(spot.rank),
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#333',
        },
      });

      marker.addListener('click', () => {
        onSelect(spot.code);

        infoWindowRef.current?.setContent(
          `<strong>${spot.rank}位</strong><br>${spot.pref} ${spot.city}<br>${spot.temp}℃ (${spot.time})`
        );
        infoWindowRef.current?.open(mapInstance.current!, marker);
        mapInstance.current!.panTo({ lat: spot.lat, lng: spot.lon });
        mapInstance.current!.setZoom(7);
      });

      markers.current[spot.code || ''] = marker;
    });
  }, [data, onSelect]);

  // 選択されたときに InfoWindow 開く
  useEffect(() => {
    if (!mapInstance.current || !selectedId) return;

    const spot = data.find((s) => s.code === selectedId);
    const marker = markers.current[selectedId];

    if (spot && marker) {
      infoWindowRef.current?.setContent(
        `<strong>${spot.rank}位</strong><br>${spot.pref} ${spot.city}<br>${spot.temp}℃ (${spot.time})`
      );
      infoWindowRef.current?.open(mapInstance.current, marker);
      mapInstance.current!.panTo({ lat: spot.lat, lng: spot.lon });
      mapInstance.current!.setZoom(7);
    }
  }, [selectedId, data]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
    />
  );
}
