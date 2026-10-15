const core = require('../../core/fortune');
const headings = {sign: '静心摇签，读懂今天的提醒。', tarot: '洗一叠牌，翻开今天的灵感。',
  stars: '点亮星图，找到今天的方向。', rune: '唤醒符文，收下一枚护符。',
  myth: '翻开传说，遇见今天的守护。', liuyao: '三枚铜钱，六次成卦。',
  cookie: '展开纸签，收下好运。', all: '七份好运，一起汇合。'};
Component({
  options: {styleIsolation: 'apply-shared'},
  properties: {visible: Boolean, kind: String, values: Array},
  data: {items: core.definitions, title: '', image: '', percent: 0, lines: [], round: 0},
  observers: {'visible, kind': function(value) {if (value) this.start(); else this.stop();}},
  lifetimes: {detached() {this.stop();}},
  methods: {
    stop() {clearInterval(this.timer); this.timer = null;},
    start() {
      this.stop();
      const kind = this.data.kind, item = core.definitions.find(d => d.id === kind);
      const duration = kind === 'all' ? 4400 : kind === 'liuyao' ? 4200 : 2600;
      this.setData({title: headings[kind], image: item ? item.image : '', percent: 0, lines: [], round: 0});
      const started = Date.now();
      this.timer = setInterval(() => {
        const elapsed = Date.now() - started;
        const round = kind === 'liuyao' ? Math.min(6, Math.floor(elapsed / 600)) : 0;
        this.setData({percent: Math.min(100, Math.round(elapsed / duration * 100)), round,
          lines: (this.data.values || []).slice(0, round).map((v, i) => ({
            name: ['初', '二', '三', '四', '五', '上'][i], value: v,
            yang: v % 2 === 1, moving: v === 6 || v === 9
          })).reverse()});
        if (elapsed >= duration) {this.stop(); this.triggerEvent('complete');}
      }, 80);
    },
    cancel() {this.stop(); this.triggerEvent('cancel');},
    noop() {}
  }
});
