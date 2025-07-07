const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 日付
// UTC を取得
const now = new Date();

// JST にずらす
const jst = new Date(now.getTime() + (9 * 60 * 60 * 1000));

// JST で md を作る
const md = `${String(jst.getMonth() + 1).padStart(2, '0')}${String(jst.getDate()).padStart(2, '0')}`;

// URL
const url = `http://www.data.jma.go.jp/obd/stats/data/mdrr/rank_daily/data${md}.html`;

// 地点マスタをロード
const amedasPath = path.resolve(__dirname, '../public/amedas.json');
const amedas = JSON.parse(fs.readFileSync(amedasPath, 'utf8'));

console.log(`🌐 ${url} を取得中...`);

fetch(url)
  .then(res => res.text())
  .then(html => {
    const $ = cheerio.load(html);

    const clean = (str) => str.replace(/[\]\)\（\(\s]+$/, '').trim();

    const joinAmedas = (pref, city) => {
      return amedas.find(a =>
        a.group.includes(pref) &&
        (city.includes(a.name) || a.name.includes(city))
      );
    };

    // === High ===
    const rowsHigh = $('div#main table.data2_s:nth-of-type(1) tr.mtx');
    const resultHigh = [];
    let prevRankHigh = null;

    rowsHigh.each((i, el) => {
      const tds = $(el).find('td');
      if (!$(tds[0]).text().trim()) return;

      let rank = $(tds[0]).text().trim();
      if (rank === '〃') rank = prevRankHigh;
      prevRankHigh = rank;

      const pref = $(tds[1]).text().trim();
      const city = $(tds[3]).text().trim().replace(/\（.*\）/, '').replace('*', '');

      const match = joinAmedas(pref, city);

      resultHigh.push({
        rank,
        pref,
        city,
        temp: clean($(tds[4]).text()),
        time: clean($(tds[5]).text()),
        memo: $(tds[tds.length - 1]).text().trim(),
        code: match ? match.code : null,
        group: match ? match.group : null,
        kana: match ? match.kana : null,
        lat: match ? match.lat : null,
        lon: match ? match.lon : null,
      });
    });

    // === Low ===
    const rowsLow = $('div#main table.data2_s:nth-of-type(2) tr.mtx');
    const resultLow = [];
    let prevRankLow = null;

    rowsLow.each((i, el) => {
      const tds = $(el).find('td');
      if (!$(tds[0]).text().trim()) return;

      let rank = $(tds[0]).text().trim();
      if (rank === '〃') rank = prevRankLow;
      prevRankLow = rank;

      const pref = $(tds[1]).text().trim();
      const city = $(tds[3]).text().trim().replace(/\（.*\）/, '').replace('*', '');

      const match = joinAmedas(pref, city);

      resultLow.push({
        rank,
        pref,
        city,
        temp: clean($(tds[4]).text()),
        time: clean($(tds[5]).text()),
        memo: $(tds[tds.length - 1]).text().trim(),
        code: match ? match.code : null,
        group: match ? match.group : null,
        kana: match ? match.kana : null,
        lat: match ? match.lat : null,
        lon: match ? match.lon : null,
      });
    });

    console.log(`✅ High: ${resultHigh.length}件, Low: ${resultLow.length}件`);

    // 取得した HTML から見出しを取る
    const nowText = $('div#main h1').text().trim();

    // 正規表現で月・日・時・分を取る
    const match = nowText.match(/（(\d+)月(\d+)日）(\d+)時(\d+)分/);

    let ymdhm = '';
    if (match) {
      const [, m, d, h, min] = match;
      const y = now.getFullYear();
      ymdhm = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}-${String(h).padStart(2, '0')}${String(min).padStart(2, '0')}`;
      console.log(`📅 公式基準: ${ymdhm}`);
    } else {
      console.log('⚠️ 日時抽出失敗 → fallback to local time');
      ymdhm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    }

    // 保存先
    const highDir = path.resolve(__dirname, '../www/428ch/hightemp-map/data/high');
    const lowDir = path.resolve(__dirname, '../www/428ch/hightemp-map/data/low');

    fs.mkdirSync(highDir, { recursive: true });
    fs.mkdirSync(lowDir, { recursive: true });

    fs.writeFileSync(path.join(highDir, 'latest.json'), JSON.stringify(resultHigh, null, 2));
    fs.writeFileSync(path.join(lowDir, 'latest.json'), JSON.stringify(resultLow, null, 2));
    fs.writeFileSync(path.join(highDir, `${ymdhm}.json`), JSON.stringify(resultHigh, null, 2));
    fs.writeFileSync(path.join(lowDir, `${ymdhm}.json`), JSON.stringify(resultLow, null, 2));

    console.log(`🗂️ 保存完了: latest.json & ${ymdhm}.json`);
  })
  .catch(err => {
    console.error('❌ 取得失敗:', err);
  });
