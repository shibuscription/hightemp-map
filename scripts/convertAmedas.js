// convertAmedas.js

import fs from 'fs';
import csv from 'csv-parser';

const results = [];

fs.createReadStream('amedas_code.csv')
  .pipe(csv())
  .on('data', (data) => {
    results.push({
      code: data.code,
      group: data.group,
      name: data.name,
      kana: data.kana,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
    });
  })
  .on('end', () => {
    fs.writeFileSync(
      '../public/amedas.json', // ← scripts/ から public/ への相対パス
      JSON.stringify(results, null, 2),
      'utf-8'
    );
    console.log('✅ amedas.json を public に出力しました！');
  });
