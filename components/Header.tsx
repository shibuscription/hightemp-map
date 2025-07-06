// components/Header.tsx

import { useRouter } from 'next/router';
import HistorySelect from './HistorySelect';

export default function Header() {
  const router = useRouter();
  const type = router.query.type === 'low' ? 'low' : 'high';
  const date = typeof router.query.date === 'string' ? router.query.date : '';

  const switchType = (next: 'high' | 'low') => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, type: next, date: undefined }, // 切替時に date をリセット
    });
  };

  const handleDateSelect = (val: string | null) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, date: val || undefined },
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b mb-4 p-2">
      <div className="flex space-x-4">
        <button
          onClick={() => switchType('high')}
          className={`px-4 py-2 ${
            type === 'high'
              ? 'border-b-2 border-blue-500 font-bold'
              : 'text-gray-500'
          }`}
        >
          ☀️ 最高気温
        </button>
        <button
          onClick={() => switchType('low')}
          className={`px-4 py-2 ${
            type === 'low'
              ? 'border-b-2 border-blue-500 font-bold'
              : 'text-gray-500'
          }`}
        >
          ❄️ 最低気温
        </button>
      </div>

      <div className="mt-2 md:mt-0">
        <HistorySelect
          selected={date || null}
          onSelect={handleDateSelect}
          type={type}
        />
      </div>
    </div>
  );
}
