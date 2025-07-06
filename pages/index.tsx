import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Map from '@/components/Map';
import TempList from '@/components/TempList';

export default function Home() {
  const router = useRouter();
  const type = router.query.type === 'low' ? 'low' : 'high';
  const date = router.query.date;

  const [merged, setMerged] = useState([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchData = async () => {
      const url = `/api/temps?type=${type}${date ? `&date=${date}` : ''}`;

      const tempRes = await fetch(url);
      const tempData = await tempRes.json();

      const amedasRes = await fetch('/amedas.json');
      const amedasData = await amedasRes.json();

      const mergedData = tempData.map((t: any) => {
        const match = amedasData.find((a: any) => a.code === t.code);
        return {
          ...t,
          lat: match?.lat,
          lon: match?.lon,
          group: match?.group,
          kana: match?.kana,
        };
      });

      setMerged(mergedData);
    };

    fetchData();
  }, [type, date, router.isReady]);

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 h-full">
        <section className="w-full md:w-1/3 p-4 border border-blue-500">
          <TempList
            data={merged}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>
        <section className="flex-1 border border-green-500">
          <Map
            data={merged}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>
      </div>
    </main>
  );
}
