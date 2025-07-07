"use client";

import { useEffect, useState } from 'react';

export default function HistorySelect({ selected, onSelect, type }: {
  selected: string | null,
  onSelect: (value: string | null) => void,
  type: 'high' | 'low'
}) {
  const [grouped, setGrouped] = useState<{ [date: string]: string[] }>({});
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch(`/hightemp-map/data/history-${type}.json`);
      const data = await res.json();
      setGrouped(data.grouped);
      setRecent(data.recent);
    };
    fetchHistory();
  }, [type]);

  return (
    <div className="flex flex-col gap-2">
      <label>直近10件</label>
      <select
        value={selected ?? ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="border px-2 py-1"
      >
        <option value="">最新</option>
        {recent.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <hr />

      <label>履歴を日付から</label>
      {Object.entries(grouped).map(([date, times]) => (
        <div key={date}>
          <div className="font-bold">{date}</div>
          <div className="flex flex-wrap gap-2">
            {times.map(t => (
              <button
                key={t}
                onClick={() => onSelect(`${date}-${t}`)}
                className="border px-2 py-1 text-sm"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
