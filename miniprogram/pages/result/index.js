const core = require('../../core/fortune');
const store = require('../../adapters/store');
const card = require('../../adapters/card');
Page({
  data: {views: [], date: '', catalogueMode: false, single: false, full: false, reversed: false, exporting: false},
  onLoad(options) {
    this.options = options;
    this.refresh();
  },
  onShow() {if (this.options) this.refresh();},
  refresh() {
    const options = this.options;
    const date = options.date || core.dayKey(), id = options.id;
    try {
      let views, catalogueMode = options.index !== undefined;
      if (catalogueMode) {
        const index = Number(options.index), pool = core.content.pools[id];
        if (!Number.isInteger(index) || !pool || !pool[index]) throw new Error('图鉴内容不存在');
        views = [core.reading(id, pool[index], this.data.reversed)];
      } else {
        const state = store.load();
        views = (id ? [id] : core.ids).map(key => core.result(state, date, key)).filter(Boolean);
      }
      this.setData({date, views, catalogueMode, single: !!id, full: !catalogueMode && views.length === 7,
        tarot: catalogueMode && id === 'tarot'});
    } catch (error) {this.setData({views: []}); store.error(error.message);}
  },
  orientation(event) {this.setData({reversed: event.currentTarget.dataset.reversed === 'true'}); this.refresh();},
  copy() {
    try {wx.setClipboardData({data: core.shareText(store.load(), this.data.date)});}
    catch (error) {store.error(error.message);}
  },
  async exportCard() {
    if (this.data.exporting) return;
    this.setData({exporting: true});
    try {
      const path = await card.createCard(this, this.data.date, this.data.views);
      // Native preview lets the user long-press to save, without asking for album permission.
      wx.previewImage({current: path, urls: [path], showmenu: true});
    } catch (error) {store.error('出门卡生成失败，请试试复制文案');}
    finally {this.setData({exporting: false});}
  },
  home() {wx.reLaunch({url: '/pages/home/index'});},
  onShareAppMessage() {
    return {title: this.data.full ? '霸服｜好运叠满，今天轮到你闪耀！' : '霸服｜收下今天的小小加持。',
      path: '/pages/home/index'};
  }
});
