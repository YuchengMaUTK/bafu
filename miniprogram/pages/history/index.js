const core = require('../../core/fortune');
const store = require('../../adapters/store');
Page({
  data: {records: [], importing: false, backupText: ''},
  onShow() {this.refresh();},
  refresh() {
    try {
      const state = store.load();
      this.setData({records: Object.keys(state.days).sort().reverse().map(date => ({
        date, count: state.days[date].equipped.length, full: state.days[date].equipped.length === 7
      }))});
    } catch (error) {store.error(error.message);}
  },
  open(event) {wx.navigateTo({url: `/pages/result/index?date=${event.currentTarget.dataset.date}`});},
  backup() {
    try {wx.setClipboardData({data: JSON.stringify(store.load()), success() {
      wx.showToast({title: '备份已复制，请粘贴到安全位置', icon: 'none'});
    }});} catch (error) {store.error(error.message);}
  },
  toggleImport() {this.setData({importing: !this.data.importing, backupText: ''});},
  input(event) {this.setData({backupText: event.detail.value});},
  importBackup() {
    try {
      if (!this.data.backupText || this.data.backupText.length > 1000000) throw new Error('请粘贴有效的记录备份');
      const incoming = core.sanitize(JSON.parse(this.data.backupText));
      store.save(core.merge(store.load(), incoming));
      this.setData({importing: false, backupText: ''}); this.refresh();
      wx.showToast({title: '记录已导入', icon: 'success'});
    } catch (error) {store.error('备份格式不正确或存储不可用，原记录未改变');}
  }
});
