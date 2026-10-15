const core = require('../../core/fortune');
const store = require('../../adapters/store');
Page({
  data: {cards: [], count: 0, total: 7, percent: 0, date: '', ritualVisible: false, kind: '', values: []},
  onShow() {this.refresh();},
  onHide() {this.cancel();},
  onUnload() {this.cancel();},
  refresh() {
    try {
      const state = store.load(), date = core.dayKey(), cards = core.cards(state, date);
      const count = cards.filter(card => card.claimed).length;
      this.setData({cards, count, percent: Math.round(count / 7 * 100), date, storageError: false});
    } catch (error) {this.setData({storageError: true});}
  },
  draw(event) {this.begin(event.currentTarget.dataset.id);},
  drawAll() {this.begin('all');},
  begin(kind) {
    if (this.data.ritualVisible) return;
    try {
      this.pending = core.draft(store.load(), core.dayKey(), kind === 'all' ? core.ids : [kind]);
      this.setData({kind, values: this.pending.draws.liuyao || [], ritualVisible: true});
    } catch (error) {store.error(error.message);}
  },
  complete() {
    const transaction = this.pending;
    if (!transaction || !this.data.ritualVisible) return;
    this.pending = null;
    this.setData({ritualVisible: false});
    try {
      // Commit once, after the entire animation; failures preserve the prior record.
      store.save(core.commit(store.load(), transaction));
      this.refresh();
      const id = this.data.kind === 'all' ? '' : this.data.kind;
      wx.navigateTo({url: `/pages/result/index?date=${transaction.date}${id ? `&id=${id}` : ''}`});
    } catch (error) {this.refresh(); store.error(error.message);}
  },
  cancel() {this.pending = null; this.setData({ritualVisible: false});},
  view(event) {wx.navigateTo({url: `/pages/result/index?date=${core.dayKey()}&id=${event.currentTarget.dataset.id}`});},
  summary() {wx.navigateTo({url: `/pages/result/index?date=${core.dayKey()}`});},
  catalogue(event) {
    const id = event.currentTarget.dataset.id || 'sign';
    wx.navigateTo({url: `/pages/catalogue/index?id=${id}`});
  },
  history() {wx.navigateTo({url: '/pages/history/index'});},
  onShareAppMessage() {return {title: '霸服｜玄学负责气氛，你负责人生。', path: '/pages/home/index'};},
  onShareTimeline() {return {title: '霸服｜每天出门，叠满好运。'};}
});
