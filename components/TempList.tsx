// components/TempList.tsx

import React from 'react';

interface Temp {
  code: string | null;
  rank: number;
  pref: string;
  city: string;
  temp: string;
  time: string;
}

interface Props {
  data: Temp[];
  selectedId: string | null;
  onSelect: (code: string | null) => void;
}

export default function TempList({ data, selectedId, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">ランキング</h2>
      <ul>
        {data.map((item) => (
          <li
            key={`${item.code}-${item.rank}`}
            className={`p-2 cursor-pointer ${
              selectedId === item.code ? 'bg-blue-100' : ''
            }`}
            onClick={() => onSelect(item.code)}
          >
            <div className="flex justify-between">
              <span>
                #{item.rank} {item.pref} {item.city}
              </span>
              <span>{item.temp}℃</span>
            </div>
            <div className="text-xs text-gray-500">{item.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
