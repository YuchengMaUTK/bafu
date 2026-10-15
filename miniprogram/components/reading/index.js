Component({
  options: {styleIsolation: 'apply-shared'},
  properties: {view: Object, expanded: {type: Boolean, value: false}},
  data: {open: false},
  observers: {'expanded': function(value) {this.setData({open: value});}},
  methods: {
    toggle() {this.setData({open: !this.data.open});},
    copySource() {
      if (this.data.view.source) wx.setClipboardData({data: this.data.view.source});
    }
  }
});
