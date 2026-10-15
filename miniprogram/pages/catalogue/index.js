const core = require('../../core/fortune');
Page({
  data: {categories: core.definitions.map(d => ({id: d.id, name: d.name, count: core.content.pools[d.id].length})),
    id: 'sign', query: '', grade: '', grades: ['', '上签', '中签', '下签'], items: [], total: 0},
  onLoad(options) {this.setData({id: core.ids.includes(options.id) ? options.id : 'sign'}); this.update();},
  update() {
    this.setData({items: core.catalogue(this.data.id, this.data.query, this.data.grade),
      total: core.content.pools[this.data.id].length});
  },
  category(event) {this.setData({id: event.currentTarget.dataset.id, query: '', grade: ''}); this.update();},
  search(event) {this.setData({query: event.detail.value}); this.update();},
  grade(event) {this.setData({grade: event.currentTarget.dataset.grade}); this.update();},
  open(event) {wx.navigateTo({url: `/pages/result/index?id=${this.data.id}&index=${event.currentTarget.dataset.index}`});},
  onShareAppMessage() {return {title: '霸服｜从签诗到幸运签条，找一句喜欢的话。', path: `/pages/catalogue/index?id=${this.data.id}`};}
});
