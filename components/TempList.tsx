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

const getRankColor = (rank: number | string) => {
  const r = Number(rank);
  if (r === 1) return '#FF0000'; // 赤
  if (r === 2) return '#FF8C00'; // オレンジ
  if (r === 3) return '#FFFF00'; // 黄色
  if (r >= 4 && r <= 6) return '#ADFF2F'; // 黄緑
  if (r >= 7 && r <= 10) return '#00BFFF'; // 水色
  return '#808080'; // その他
};

export default function TempList({ data, selectedId, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">ランキング</h2>
      <ul>
        {data.map((item) => (
          <li
            key={`${item.code}-${item.rank}`}
            className={`p-2 cursor-pointer ${selectedId === item.code ? 'bg-blue-100' : ''
              }`}
            onClick={() => onSelect(item.code)}
          >
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: getRankColor(item.rank) }}
                ></span>
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
