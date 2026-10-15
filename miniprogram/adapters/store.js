const core = require('../core/fortune');
function load() {
  try {
    const saved = wx.getStorageSync(core.STORAGE_KEY);
    return saved ? core.sanitize(saved) : {version: 1, days: {}};
  } catch (error) {
    // Never overwrite an unreadable record with an empty state.
    wx.showToast({title: '记录读取失败，请检查存储或导出备份', icon: 'none'});
    throw error;
  }
}
function save(state) {
  const safe = core.sanitize(state);
  wx.setStorageSync(core.STORAGE_KEY, safe);
  return safe;
}
function error(message) {
  wx.showToast({title: message || '暂时无法保存，请重试', icon: 'none', duration: 3000});
}
module.exports = {load, save, error};
