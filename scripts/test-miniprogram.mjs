import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync, readdirSync, statSync, existsSync} from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const require = createRequire(import.meta.url);
const core = require('../miniprogram/core/fortune');
const root = new URL('../miniprogram/', import.meta.url);
let checks = 0;
function check(name, test) {test(); checks++; console.log(`PASS ${name}`);}
const empty = () => ({version: 1, days: {}});
const date = core.dayKey();
const random = sequence => {let i = 0; return () => sequence[i++ % sequence.length];};

check('Seven complete catalogues and all illustrations exist', () => {
  const expected = [100, 22, 12, 24, 16, 64, 16];
  core.definitions.forEach((def, i) => {
    assert.equal(core.content.pools[def.id].length, expected[i]);
    assert.ok(existsSync(new URL(`.${def.image}`, root)));
    core.content.pools[def.id].forEach(item => {
      assert.ok(existsSync(new URL(`.${item.image}`, root)));
      const view = core.reading(def.id, item);
      assert.ok(view.title);
      assert.ok(view.sections.every(s => s.paragraphs.every(p => typeof p === 'string')));
      if (view.source) assert.match(new URL(view.source).hostname, /(^|\.)wiki(pedia|source)\.org$/);
    });
  });
});
check('Draft is read-only; all seven results commit together', () => {
  const state = empty(), tx = core.draft(state, date, core.ids, random([0, .99999, .5]));
  assert.deepEqual(state, empty());
  assert.equal(core.cards(state, date).filter(row => row.claimed).length, 0);
  const next = core.commit(state, tx, date);
  assert.equal(next.days[date].equipped.length, 7);
  core.ids.forEach(id => assert.ok(core.result(next, date, id)));
  assert.deepEqual(state, empty());
  assert.throws(() => core.commit(state, tx, '2099-01-01'), /重新领取/);
});
check('Re-draws avoid adjacent repeats across all six content pools', () => {
  let state = empty();
  for (let i = 0; i < 80; i++) {
    const next = core.commit(state, core.draft(state, date, core.ids, random([0, .99999, .25, .5, .75])), date);
    if (i) core.ids.filter(id => id !== 'liuyao').forEach(id =>
      assert.notEqual(next.days[date].draws[id], state.days[date].draws[id]));
    state = next;
  }
});
check('Tarot orientation changes meaning, artwork rotation and backup', () => {
  const upright = core.reading('tarot', core.content.pools.tarot[0], false);
  const reversed = core.reading('tarot', core.content.pools.tarot[0], true);
  assert.equal(upright.rotation, 0); assert.equal(reversed.rotation, 180);
  assert.notEqual(upright.action, reversed.action);
  let state = core.commit(empty(), core.draft(empty(), date, ['tarot'], random([0, .99999])), date);
  state = core.sanitize(JSON.parse(JSON.stringify(state)));
  assert.equal(core.result(state, date, 'tarot').rotation, 180);
});
check('Coin casting has the eight equiprobable combinations; all 64 mappings round-trip', () => {
  const counts = [0, 0, 0, 0];
  for (let n = 0; n < 8; n++) {
    const bits = [n & 1, (n >> 1) & 1, (n >> 2) & 1].map(v => v ? .75 : .25);
    const tx = core.draft(empty(), date, ['liuyao'], random(bits));
    counts[tx.draws.liuyao[0] - 6]++;
  }
  assert.deepEqual(counts, [1, 3, 3, 1]);
  const numbers = new Set();
  for (let n = 0; n < 64; n++) {
    const values = Array.from({length: 6}, (_, i) => (n >> i) & 1 ? 7 : 8);
    numbers.add(core.hexagram(values).number);
  }
  assert.equal(numbers.size, 64);
  assert.equal(core.hexagram([7,7,7,7,7,7]).number, 1);
  assert.equal(core.hexagram([8,8,8,8,8,8]).number, 2);
  assert.equal(core.hexagram([9,9,9,9,9,9], true).number, 2);
  assert.equal(core.hexagram([6,6,6,6,6,6], true).number, 1);
});
check('Web backups migrate; local draws and orientation win conflicts; invalid backups reject', () => {
  const local = core.commit(empty(), core.draft(empty(), date, ['tarot'], random([.5, .75])), date);
  const incoming = core.commit(empty(), core.draft(empty(), date, ['sign','tarot'], () => 0), date);
  const merged = core.merge(local, incoming);
  assert.equal(merged.days[date].draws.tarot, local.days[date].draws.tarot);
  assert.equal(merged.days[date].tarotReversed, true);
  assert.ok(merged.days[date].equipped.includes('sign'));
  const legacy = core.sanitize({version:1, days:{[date]:{equipped:['tarot','courage']}}});
  assert.equal(legacy.days[date].retiredCourage, true);
  assert.equal(core.result(legacy, date, 'tarot').rotation, 0);
  for (const bad of [null, {version:1,days:[]}, {version:1,days:{'2026-02-31':{equipped:[]}}},
    {version:1,days:{[date]:{equipped:['liuyao'],liuyao:[9]}}},
    {version:1,days:{[date]:{equipped:['tarot'],draws:{tarot:22}}}}]) assert.throws(() => core.sanitize(bad));
});
check('Catalogue filters and read-only browsing preserve the saved day', () => {
  const before = JSON.stringify(empty());
  assert.equal(core.catalogue('sign', '', '上签').length, 24);
  assert.equal(core.catalogue('liuyao').length, 64);
  assert.equal(core.catalogue('cookie', 'small beginning').length, 1);
  assert.equal(core.catalogue('stars', '巨蟹').length, 1);
  assert.equal(core.catalogue('rune', 'impossible query').length, 0);
  assert.equal(JSON.stringify(empty()), before);
});

// Exercise the actual native controllers with a mocked wx host, not a browser rewrite.
let saved, writes = 0, navigations = [], previews = [], clipboard = [], storageFails = false;
const wxHost = {
  getStorageSync: () => saved,
  setStorageSync(key, value) {if (storageFails) throw new Error('存储不可用'); saved = JSON.parse(JSON.stringify(value)); writes++;},
  navigateTo(value) {navigations.push(value.url);},
  reLaunch(value) {navigations.push(value.url);},
  showToast() {},
  setClipboardData(value) {clipboard.push(value.data); if (value.success) value.success();},
  previewImage(value) {previews.push(value);},
};
globalThis.wx = wxHost;
function controller(relative, kind = 'Page', extra = {}) {
  const filename = fileURLToPath(new URL(relative, root));
  const localRequire = createRequire(filename);
  let config;
  vm.runInNewContext(readFileSync(filename, 'utf8'), {
    [kind]: value => {config = value;}, require: localRequire, wx: wxHost,
    setInterval, clearInterval, Date, ...extra
  }, {filename});
  const page = {data: JSON.parse(JSON.stringify(config.data || {})), setData(value) {Object.assign(this.data, value);}};
  for (const [name, value] of Object.entries(kind === 'Page' ? config : config.methods)) {
    if (typeof value === 'function') page[name] = value.bind(page);
  }
  return {page, config};
}
check('Native home cancellation, atomic completion, hide and failed save', () => {
  const {page} = controller('pages/home/index.js');
  page.onShow(); assert.equal(page.data.count, 0);
  page.drawAll(); assert.equal(writes, 0); assert.equal(page.data.ritualVisible, true);
  page.cancel(); page.complete(); assert.equal(writes, 0);
  page.drawAll(); page.complete(); assert.equal(writes, 1); assert.equal(page.data.count, 7);
  assert.match(navigations.at(-1), /pages\/result\/index\?date=/);
  const before = JSON.stringify(saved);
  page.draw({currentTarget:{dataset:{id:'sign'}}}); page.onHide(); page.complete();
  assert.equal(JSON.stringify(saved), before);
  page.drawAll(); storageFails = true; page.complete(); storageFails = false;
  assert.equal(JSON.stringify(saved), before); assert.equal(writes, 1);
  page.complete(); assert.equal(writes, 1);
  page.drawAll(); page.pending.date = '2000-01-01'; page.complete();
  assert.equal(JSON.stringify(saved), before); assert.equal(writes, 1);
  saved = 'unreadable record'; page.refresh(); page.drawAll(); page.complete();
  assert.equal(saved, 'unreadable record'); assert.equal(writes, 1);
  saved = JSON.parse(before);
});
check('Native animation waits, reports six lines, completes once, and cancels timers', () => {
  let now = 0, callback, cleared = 0, events = [];
  const {page, config} = controller('components/ritual/index.js', 'Component', {
    Date: {now: () => now},
    setInterval(fn) {callback = fn; return 99;},
    clearInterval(value) {if (value) cleared++;}
  });
  page.triggerEvent = name => events.push(name);
  page.data.kind = 'liuyao'; page.data.values = [6,7,8,9,7,8]; page.start();
  now = 1800; callback(); assert.equal(page.data.round, 3); assert.equal(events.length, 0);
  now = 4200; callback(); assert.equal(page.data.round, 6); assert.deepEqual(events, ['complete']);
  page.start(); page.cancel(); assert.equal(page.timer, null); assert.equal(events.at(-1), 'cancel');
  config.lifetimes.detached.call(page); assert.ok(cleared >= 2);
});
check('Native result, catalogue and history controllers; browsing never writes', () => {
  const before = writes;
  const {page: result} = controller('pages/result/index.js');
  result.onLoad({date}); assert.equal(result.data.views.length, 7); assert.equal(result.data.full, true);
  result.copy(); assert.match(clipboard.at(-1), /七|东方签运/);
  result.onLoad({id:'tarot',index:'0'}); assert.equal(result.data.catalogueMode, true);
  result.orientation({currentTarget:{dataset:{reversed:'true'}}}); assert.equal(result.data.views[0].rotation, 180);
  assert.equal(writes, before);
  const {page: catalogue} = controller('pages/catalogue/index.js');
  catalogue.onLoad({id:'liuyao'}); assert.equal(catalogue.data.items.length, 64);
  catalogue.open({currentTarget:{dataset:{index:63}}}); assert.match(navigations.at(-1), /index=63/);
  const {page: history} = controller('pages/history/index.js');
  history.onShow(); assert.equal(history.data.records[0].full, true);
  history.backup(); assert.equal(core.sanitize(JSON.parse(clipboard.at(-1))).version, 1);
  history.input({detail:{value:'malformed backup'}}); history.importBackup(); assert.equal(writes, before);
  history.input({detail:{value:JSON.stringify(empty())}}); history.importBackup(); assert.equal(writes, before + 1);
  assert.equal(saved.days[date].equipped.length, 7);
});
await (async () => {
  const drawing = [];
  const context = {measureText: text => ({width:text.length * 23}), fillRect(){},
    fillText(text,x,y) {drawing.push({text,x,y});}};
  let node;
  wxHost.createSelectorQuery = () => ({in(){return this;},select(){return this;},fields(){return this;},
    exec(fn) {node = {getContext:()=>context}; fn([{node}]);}});
  wxHost.canvasToTempFilePath = config => config.success({tempFilePath:'wxfile://departure.png'});
  const {page} = controller('pages/result/index.js');
  page.onLoad({date}); await page.exportCard();
  assert.equal(previews.at(-1).urls[0], 'wxfile://departure.png');
  assert.equal(node.width, 750); assert.ok(node.height > 1400);
  assert.ok(drawing.some(row => row.text.includes('玄学负责气氛')));
  assert.equal(page.data.exporting, false);
  checks++; console.log('PASS Native Canvas export produces a local PNG and opens preview');
})();

check('Project entry points, local resources and package budget', () => {
  const app = JSON.parse(readFileSync(new URL('app.json', root)));
  app.pages.forEach(path => {
    for (const ext of ['js','json','wxml','wxss']) assert.ok(existsSync(new URL(`${path}.${ext}`, root)));
    const json = JSON.parse(readFileSync(new URL(`${path}.json`, root)));
    for (const component of Object.values(json.usingComponents || {})) {
      for (const ext of ['js','json','wxml','wxss']) assert.ok(existsSync(new URL(`.${component}.${ext}`, root)));
    }
  });
  let bytes = 0;
  const walk = folder => {
    for (const name of readdirSync(folder)) {
      const path = new URL(name, folder);
      if (statSync(path).isDirectory()) walk(new URL(`${name}/`, folder));
      else {
        bytes += statSync(path).size;
        if (name.endsWith('.js')) new vm.Script(readFileSync(path, 'utf8'), {filename: fileURLToPath(path)});
        if (name.endsWith('.json')) JSON.parse(readFileSync(path, 'utf8'));
        if (name.endsWith('.wxml')) assert.doesNotMatch(readFileSync(path, 'utf8'), /<(br|div|span|img|svg)\b/);
      }
    }
  };
  walk(root);
  assert.ok(bytes < 2 * 1024 * 1024, `Package exceeds 2 MB: ${bytes}`);
  console.log(`Package source size: ${bytes} bytes`);
});
delete globalThis.wx;
console.log(`${checks} Mini Program checks passed. Native compiler and device verification remain separate.`);
