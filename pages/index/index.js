const app = getApp();

Page({
  onShareAppMessage: function (res) {
    return {
      title: 'ECharts！',
      path: '/pages/index/index',
      success: function () {},
      fail: function () {}
    }
  },
  data: {
    charts: [{
      id: 'rainfall',
      name: '雨量显示'
    }],
    
    // chartsWithoutImg: [{
    //   id: 'lazyLoad',
    //   name: '延迟加载图表'
    // }, {
    //   id: 'multiCharts',
    //   name: '一个页面中多个图表'
    // }, {
    //   id: 'move',
    //   name: '页面不阻塞滚动'
    // }, {
    //   id: 'saveCanvas',
    //   name: '保存 Canvas 到本地文件'
    // }]
  },

  onReady() {
  },

  open: function (e) {
    wx.navigateTo({
      url: '../' + e.target.dataset.chart.id + '/index'
    });
  }
});
