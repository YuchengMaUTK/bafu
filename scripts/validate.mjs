import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({});
for (const file of ['guanyin.js', 'tarot.js', 'lore.js', 'yijing-data.js', 'liuyao.js', 'cookie.js']) {
  vm.runInContext(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), context, {filename: file});
}
vm.runInContext(`
  if (GUANYIN_SIGNS.length !== 100 || TAROT_CARDS.length !== 22 ||
      BUFF_LORE.stars.length !== 12 || BUFF_LORE.rune.length !== 24 ||
      BUFF_LORE.myth.length !== 16 || YIJING_HEXAGRAMS.length !== 64 ||
      COOKIE_FORTUNES.length !== 16) throw new Error('Incomplete catalogue');
  for (const [i, sign] of GUANYIN_SIGNS.entries()) {
    if (sign.number !== i + 1 || sign.poem.length !== 4 ||
        !['上签', '中签', '下签'].includes(sign.grade)) throw new Error('Invalid oracle lot');
  }
  for (const [i, card] of TAROT_CARDS.entries()) {
    if (card.number !== i || !card.svg || !card.reading || !card.action ||
        !card.reversedMeaning?.title || !card.reversedMeaning.reading ||
        !card.reversedMeaning.action) throw new Error('Incomplete tarot meaning');
  }
  const patterns = new Set();
  for (let number = 1; number <= 64; number++) {
    const hex = hexagramByNumber(number);
    if (hex.data.number !== number || hex.data.lines.length !== 6 ||
        hexagramFrom([...hex.bits].map(bit => bit === '1' ? 7 : 8)).data.number !== number)
      throw new Error('Incorrect hexagram mapping');
    patterns.add(hex.bits);
    if ((hexagramArtwork(number).svg.match(/data-yao=/g) || []).length !== 6)
      throw new Error('Incomplete hexagram artwork');
  }
  if (patterns.size !== 64) throw new Error('Duplicate hexagram patterns');
  for (const [number, bits] of [[1,'111111'],[2,'000000'],[3,'100010'],
      [29,'010010'],[30,'101101'],[63,'101010'],[64,'010101']]) {
    if (hexagramByNumber(number).bits !== bits) throw new Error('Wrong known hexagram');
  }
  for (const item of [...Object.values(BUFF_LORE).flat(), ...YIJING_HEXAGRAMS]) {
    const source = item.sourceUrl || item.source;
    if (source && !/^https:\\/\\/(en\\.wikipedia\\.org|zh\\.wikisource\\.org)\\//.test(source))
      throw new Error('Non-Wiki reference');
  }
`, context);

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert(html.includes('霸服'));
assert(html.includes('玄学负责气氛，'));
for (const match of html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)) {
  assert(readFileSync(new URL(`../${match[1]}`, import.meta.url)).length > 0);
}
console.log('Validated all seven catalogues, tarot reversals, 64 hexagram diagrams and site assets.');
