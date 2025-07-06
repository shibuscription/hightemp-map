const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 日付
const now = new Date();
const md = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
const ymdhm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

// URL
const url = `http://www.data.jma.go.jp/obd/stats/data/mdrr/rank_daily/data${md}.html`;

// 地点マスタをロード
const amedas = JSON.parse(fs.readFileSync('public/amedas.json', 'utf8'));

console.log(`🌐 ${url} を取得中...`);

fetch(url)
  .then(res => res.text())
  .then(html => {
    const $ = cheerio.load(html);

    const clean = (str) => str.replace(/[\]\s]+$/, '').trim();

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

    // 保存先
    fs.mkdirSync(`data/high`, { recursive: true });
    fs.mkdirSync(`data/low`, { recursive: true });

    fs.writeFileSync(`data/high/latest.json`, JSON.stringify(resultHigh, null, 2));
    fs.writeFileSync(`data/low/latest.json`, JSON.stringify(resultLow, null, 2));
    fs.writeFileSync(`data/high/${ymdhm}.json`, JSON.stringify(resultHigh, null, 2));
    fs.writeFileSync(`data/low/${ymdhm}.json`, JSON.stringify(resultLow, null, 2));

    console.log(`🗂️ 保存完了: latest.json & ${ymdhm}.json`);
  })
  .catch(err => {
    console.error('❌ 取得失敗:', err);
  });
