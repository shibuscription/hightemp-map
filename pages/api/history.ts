// pages/api/history.ts

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const type = req.query.type === 'low' ? 'low' : 'high';
  const dir = path.join(process.cwd(), 'data', type);

  try {
    const files = fs.readdirSync(dir)
      .filter(name => name.endsWith('.json') && name !== 'latest.json')
      .map(name => name.replace('.json', ''));

    // 日付ごとにまとめる
    const grouped: Record<string, string[]> = {};
    files.forEach(f => {
      const [date, time] = f.split('-');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(time);
    });

    // 時刻は昇順に
    Object.keys(grouped).forEach(date => {
      grouped[date].sort();
    });

    // 直近10件（新しい順）
    const recent = files
      .sort().reverse()
      .slice(0, 10);

    res.status(200).json({ grouped, recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '履歴取得失敗！' });
  }
}
