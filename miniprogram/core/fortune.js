'use strict';
const content = require('../data/content');
const definitions = content.definitions;
const ids = definitions.map(d => d.id);
const STORAGE_KEY = 'bafu.miniprogram.v1';
const positions = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function hash(text) {
  let n = 2166136261;
  for (const c of text) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  return n >>> 0;
}
function fallbackIndex(id, date) {
  const key = id === 'sign' ? `${date}:guanyin:100:v1` : id === 'tarot' ? `${date}:tarot:22:v1` :
    id === 'cookie' ? `${date}:fortune-cookie:v1` : `${date}:${id}:lore:v1`;
  return hash(key) % content.pools[id].length;
}
function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && dayKey(parsed) === date;
}
function sanitize(input) {
  if (!input || input.version !== 1 || !input.days || typeof input.days !== 'object' || Array.isArray(input.days)) {
    throw new Error('备份格式不正确');
  }
  const days = {};
  const entries = Object.entries(input.days);
  if (entries.length > 10000) throw new Error('记录数量过多');
  for (const [date, record] of entries) {
    if (!validDate(date) || !record || !Array.isArray(record.equipped) ||
        record.equipped.some(id => !ids.includes(id) && id !== 'courage') ||
        new Set(record.equipped).size !== record.equipped.length ||
        (record.tarotReversed !== undefined && typeof record.tarotReversed !== 'boolean')) throw new Error('记录不完整');
    const draws = record.draws === undefined ? {} : record.draws;
    if (!draws || typeof draws !== 'object' || Array.isArray(draws) ||
        Object.entries(draws).some(([id, index]) => id === 'liuyao' || !ids.includes(id) ||
          !Number.isInteger(index) || index < 0 || index >= content.pools[id].length)) throw new Error('抽取结果不正确');
    if ((record.liuyao !== undefined || record.equipped.includes('liuyao')) &&
        (!Array.isArray(record.liuyao) || record.liuyao.length !== 6 ||
         record.liuyao.some(v => !Number.isInteger(v) || v < 6 || v > 9))) throw new Error('卦象不完整');
    days[date] = {equipped: record.equipped.filter(id => id !== 'courage'), draws: {...draws},
      tarotReversed: record.tarotReversed === true,
      ...(record.liuyao ? {liuyao: [...record.liuyao]} : {}),
      ...(record.retiredCourage || record.equipped.includes('courage') ? {retiredCourage: true} : {})};
  }
  return {version: 1, days};
}
function merge(local, incoming) {
  const next = sanitize(local);
  for (const [date, record] of Object.entries(sanitize(incoming).days)) {
    const old = next.days[date];
    next.days[date] = old ? {...record, ...old, equipped: [...new Set([...old.equipped, ...record.equipped])],
      draws: {...record.draws, ...old.draws},
      tarotReversed: old.draws.tarot !== undefined ? old.tarotReversed : record.tarotReversed,
      ...(old.liuyao || record.liuyao ? {liuyao: old.liuyao || record.liuyao} : {}),
      ...(old.retiredCourage || record.retiredCourage ? {retiredCourage: true} : {})} : record;
  }
  return next;
}
function hexagram(values, changed = false) {
  const bits = values.map(v => changed && (v === 6 || v === 9) ? (v === 6 ? 1 : 0) : v % 2).join('');
  const lower = content.trigrams.findIndex(t => t.bits === bits.slice(0, 3));
  const upper = content.trigrams.findIndex(t => t.bits === bits.slice(3));
  const number = content.kingWen[upper][lower];
  return {...content.pools.liuyao[number - 1], lower: content.trigrams[lower], upper: content.trigrams[upper]};
}
function draft(state, date, selected = ids, random = Math.random) {
  if (!validDate(date) || !selected.length || selected.some(id => !ids.includes(id)) ||
      new Set(selected).size !== selected.length) throw new Error('抽取类别不正确');
  const below = limit => {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('随机值不正确');
    return Math.floor(value * limit);
  };
  const previous = state.days[date] || {equipped: [], draws: {}};
  const draws = {};
  for (const id of selected) {
    if (id === 'liuyao') {
      // Independent coins preserve 6/7/8/9 probabilities of 1:3:3:1.
      draws[id] = Array.from({length: 6}, () => 6 + below(2) + below(2) + below(2));
    } else {
      const size = content.pools[id].length;
      const old = previous.draws[id] !== undefined ? previous.draws[id] :
        previous.equipped.includes(id) ? fallbackIndex(id, date) : undefined;
      const value = below(old === undefined ? size : size - 1);
      const index = old === undefined ? value : value >= old ? value + 1 : value;
      draws[id] = id === 'tarot' ? {index, reversed: below(2) === 1} : index;
    }
  }
  return {date, draws};
}
function commit(state, transaction, today = dayKey()) {
  if (transaction.date !== today) throw new Error('新的一天，请重新领取好运');
  const next = sanitize(state);
  const record = next.days[today] || {equipped: [], draws: {}, tarotReversed: false};
  for (const [id, value] of Object.entries(transaction.draws)) {
    if (id === 'liuyao') record.liuyao = [...value];
    else {
      record.draws[id] = id === 'tarot' ? value.index : value;
      if (id === 'tarot') record.tarotReversed = value.reversed;
    }
    if (!record.equipped.includes(id)) record.equipped.push(id);
  }
  next.days[today] = record;
  return sanitize(next);
}
function section(title, paragraphs) {
  return {title, paragraphs: (Array.isArray(paragraphs) ? paragraphs : [paragraphs]).filter(Boolean)};
}
function reading(id, item, reversed = false) {
  const def = definitions.find(d => d.id === id);
  if (!def || !item) throw new Error('内容不存在');
  const view = {id, name: def.name, image: item.image, tint: def.tint, tone: def.tone,
    rotation: 0, facts: [], sections: [], action: item.action || '', source: item.sourceUrl || item.source || ''};
  if (id === 'sign') Object.assign(view, {
    title: `第${item.number}签 · ${item.grade} · ${item.story}`, subtitle: item.theme,
    facts: [item.grade, item.palace], sections: [
      section('签诗', item.poem), section('传统诗意', item.classical),
      section('白话解读 · 本站整理', item.reading), section('行事提醒', item.advice),
      section('版本说明', '不同流传版本的签诗、签等与典故可能不同；白话解读和行动建议为本站整理。')]
  });
  else if (id === 'tarot') {
    const meaning = reversed ? item.reversedMeaning : item;
    Object.assign(view, {title: `${item.name} · ${reversed ? '逆位' : '正位'} · ${meaning.title}`,
      subtitle: item.en, rotation: reversed ? 180 : 0, action: meaning.action,
      facts: [`第 ${item.number} 号`, reversed ? '逆位 · 调整提醒' : '正位 · 发挥力量'],
      sections: [section('今日牌意 · 本站整理', meaning.reading),
        section('牌面说明', '原创矢量插画，采用传统大阿尔卡纳意象。正位呈现可发挥的力量，逆位呈现可调整的提醒。')]});
  } else if (id === 'cookie') Object.assign(view, {
    title: item.title, subtitle: item.quote,
    sections: [section('YOUR LITTLE FORTUNE', item.quote), section('中文签条', item.translation)],
  });
  else if (id === 'liuyao') Object.assign(view, {
    title: `第${item.number}卦 · ${item.name}`, subtitle: '周易 · 六十四卦',
    sections: [section('卦辞 · 原文', item.judgement), section('六爻爻辞 · 原文', item.lines),
      section('原文补充', item.extra || [])],
    action: '区分已知事实、尚缺信息与自己能做的下一步。'
  });
  else Object.assign(view, {title: `${item.name} · ${item.title}`, subtitle: def.source,
    facts: item.facts, sections: [section(item.detailHeading, item.background),
      section('今日解读 · 本站整理', item.reading), section('行事提醒', item.advice),
      section('资料说明', item.sourceLabel)]});
  return view;
}
function result(state, date, id) {
  const record = state.days[date];
  if (!record || !record.equipped.includes(id)) return null;
  if (id !== 'liuyao') {
    const index = record.draws[id] !== undefined ? record.draws[id] : fallbackIndex(id, date);
    return reading(id, content.pools[id][index], record.tarotReversed);
  }
  const main = hexagram(record.liuyao), changed = hexagram(record.liuyao, true);
  const moving = record.liuyao.map((v, i) => v === 6 || v === 9 ? i : -1).filter(i => i >= 0);
  const view = reading(id, main);
  view.title = `${main.name}卦${moving.length ? ` → ${changed.name}卦` : ' · 无动爻'}`;
  view.facts = [`${main.upper.name}上 · ${main.lower.name}下`, `从下向上：${record.liuyao.join(' · ')}`,
    moving.length ? `动爻：${moving.map(i => positions[i]).join('、')}` : '六爻皆静'];
  view.changedImage = moving.length ? changed.image : '';
  view.sections = [section('本卦卦辞 · 原文', main.judgement),
    section('动爻爻辞 · 原文', moving.map(i => main.lines[i])),
    section(moving.length ? '之卦卦辞 · 原文' : '无动爻，参考本卦', changed.judgement),
    section('卦象提示 · 本站整理', `上卦为${main.upper.name}，取象为${main.upper.image}；下卦为${main.lower.name}，取象为${main.lower.image}。借“${main.upper.theme}”与“${main.lower.theme}”观察正在处理的事。变化后的结构不代表事情一定按这个方向发生。`),
    section('起卦说明', '文字面计 2，图案面计 3；6 老阴、7 少阳、8 少阴、9 老阳。老阴、老阳为动爻。本页提供卦象与原文参考，尚未提供纳甲、六亲、世应、日月建和用神断卦。')];
  return view;
}
function cards(state, date = dayKey()) {
  return definitions.map(def => {
    const view = result(state, date, def.id);
    return {...def, claimed: !!view, title: view ? view.title : def.description,
      image: view ? view.image : def.image, rotation: view ? view.rotation : 0};
  });
}
function catalogue(id, query = '', grade = '') {
  const pool = content.pools[id] || [];
  const needle = query.trim().toLowerCase();
  return pool.map((item, index) => ({index, ...reading(id, item), grade: item.grade || '',
    preview: id === 'sign' ? item.poem.join('，') : item.quote || item.judgement || item.title}))
    .filter(row => (!grade || row.grade === grade) && (!needle ||
      JSON.stringify(content.pools[id][row.index]).toLowerCase().includes(needle)));
}
function shareText(state, date) {
  return `我的今日出门 Buff｜${date}\n${ids.map(id => result(state, date, id)).filter(Boolean)
    .map(view => `${view.name}：${view.id === 'cookie' ? view.subtitle : view.title}`).join('\n')}\n玄学负责气氛，你负责人生。\n霸服`;
}
module.exports = {content, definitions, ids, STORAGE_KEY, dayKey, sanitize, merge, draft, commit,
  hexagram, reading, result, cards, catalogue, shareText};
