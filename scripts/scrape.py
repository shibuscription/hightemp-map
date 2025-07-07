# -*- coding: utf-8 -*-
import urllib2
import sys
import json
import os
import datetime
import re
import codecs
from BeautifulSoup import BeautifulSoup

# JST 現在日時
now = datetime.datetime.utcnow() + datetime.timedelta(hours=9)
md = '%02d%02d' % (now.month, now.day)

# URL
url = 'http://www.data.jma.go.jp/obd/stats/data/mdrr/rank_daily/data%s.html' % md

print('%s を取得中...' % url)

# 地点マスタ
amedas_path = os.path.join(os.path.dirname(__file__), 'amedas.json')
with open(amedas_path, 'r') as f:
    amedas = json.load(f)

response = urllib2.urlopen(url)
html = response.read()
soup = BeautifulSoup(html)

def clean(text):
    return re.sub(u'[\\]\\)\\（\\(\\s]+$', '', text.strip())

def join_amedas(pref, city):
    for a in amedas:
        if pref in a['group'] and (a['name'] in city or city in a['name']):
            return a
    return None

# === High ===
tables = soup.findAll('table', {'class': 'data2_s'})
rows_high = tables[0].findAll('tr', {'class': 'mtx'})
result_high = []
prev_rank_high = None

for row in rows_high:
    tds = row.findAll('td')
    if not tds or not tds[0].text.strip():
        continue
    rank = tds[0].text.strip()
    if rank == u'〃':
        rank = prev_rank_high
    prev_rank_high = rank
    pref = tds[1].text.strip()
    city = re.sub(u'（.*）', '', tds[3].text.strip()).replace('*', '')
    match = join_amedas(pref, city)
    result_high.append({
        'rank': rank,
        'pref': pref,
        'city': city,
        'temp': clean(tds[4].text.strip()),
        'time': clean(tds[5].text.strip()),
        'memo': tds[-1].text.strip(),
        'code': match['code'] if match else None,
        'group': match['group'] if match else None,
        'kana': match['kana'] if match else None,
        'lat': match['lat'] if match else None,
        'lon': match['lon'] if match else None
    })

print('✅ High: %d件' % len(result_high))

# === Low ===
rows_low = tables[1].findAll('tr', {'class': 'mtx'})
result_low = []
prev_rank_low = None

for row in rows_low:
    tds = row.findAll('td')
    if not tds or not tds[0].text.strip():
        continue
    rank = tds[0].text.strip()
    if rank == u'〃':
        rank = prev_rank_low
    prev_rank_low = rank
    pref = tds[1].text.strip()
    city = re.sub(u'（.*）', '', tds[3].text.strip()).replace('*', '')
    match = join_amedas(pref, city)
    result_low.append({
        'rank': rank,
        'pref': pref,
        'city': city,
        'temp': clean(tds[4].text.strip()),
        'time': clean(tds[5].text.strip()),
        'memo': tds[-1].text.strip(),
        'code': match['code'] if match else None,
        'group': match['group'] if match else None,
        'kana': match['kana'] if match else None,
        'lat': match['lat'] if match else None,
        'lon': match['lon'] if match else None
    })

print('✅ Low: %d件' % len(result_low))

# 公式基準日時
now_text = soup.find('h1').text.strip()
m = re.search(u'（(\d+)月(\d+)日）(\d+)時(\d+)分', now_text)
if m:
    ymdhm = '%04d%02d%02d-%02d%02d' % (now.year, int(m.group(1)), int(m.group(2)), int(m.group(3)), int(m.group(4)))
    ymd = '%02d%02d' % (int(m.group(1)), int(m.group(2)))
    hm = '%02d%02d' % (int(m.group(3)), int(m.group(4)))
    print('📅 公式基準: %s' % ymdhm)
else:
    ymdhm = now.strftime('%Y%m%d-%H%M')
    ymd = now.strftime('%m%d')
    hm = now.strftime('%H%M')
    print('⚠️ 日時抽出失敗 → fallback: %s' % ymdhm)

# 保存先
base_dir = '/home/shibuya/www/428ch/hightemp-map/data'
high_dir = os.path.join(base_dir, 'high')
low_dir = os.path.join(base_dir, 'low')

if not os.path.exists(high_dir):
    os.makedirs(high_dir)
if not os.path.exists(low_dir):
    os.makedirs(low_dir)

with codecs.open(os.path.join(high_dir, 'latest.json'), 'w', 'utf-8') as f:
    json.dump(result_high, f, ensure_ascii=False, indent=2)
with codecs.open(os.path.join(low_dir, 'latest.json'), 'w', 'utf-8') as f:
    json.dump(result_low, f, ensure_ascii=False, indent=2)

with codecs.open(os.path.join(high_dir, '%s.json' % ymdhm), 'w', 'utf-8') as f:
    json.dump(result_high, f, ensure_ascii=False, indent=2)
with codecs.open(os.path.join(low_dir, '%s.json' % ymdhm), 'w', 'utf-8') as f:
    json.dump(result_low, f, ensure_ascii=False, indent=2)

print('🗂️ 保存完了: latest.json & %s.json' % ymdhm)

# === 履歴ファイル更新 ===
def update_history(type_name, ymd, hm):
    path = os.path.join(base_dir, 'history-%s.json' % type_name)
    if os.path.exists(path):
        with codecs.open(path, 'r', 'utf-8') as f:
            history = json.load(f)
    else:
        history = {'grouped': {}, 'recent': []}

    if ymd not in history['grouped']:
        history['grouped'][ymd] = []
    if hm not in history['grouped'][ymd]:
        history['grouped'][ymd].append(hm)

    key = '%s-%s' % (ymd, hm)
    if key not in history['recent']:
        history['recent'].insert(0, key)
        history['recent'] = history['recent'][:10]

    with codecs.open(path, 'w', 'utf-8') as f:
        json.dump(history, f, ensure_ascii=False, indent=2)
    print('✅ Updated history-%s.json' % type_name)

update_history('high', ymd, hm)
update_history('low', ymd, hm)

print('🎉 すべて完了')
