// pages/api/temps.ts

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const type = req.query.type === 'low' ? 'low' : 'high';
  const date = req.query.date;
  const fileName = date ? `${date}.json` : 'latest.json';
  const filePath = path.join(process.cwd(), 'data', type, fileName);

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    // ❌ エラーで { error: ... } を返すのはやめる
    // ✅ 空配列にする！
    res.status(404).json([]);
  }
}
