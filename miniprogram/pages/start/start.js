//const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')
//获取应用实例
var app = getApp();
Page({
  data: {
    banners:[],
    swiperMaxNumber: 3,
    swiperCurrent: 0,
    height: wx.getSystemInfoSync().windowHeight
  },
  onLoad:function(){
    const _this = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    const app_show_pic_version = wx.getStorageSync('app_show_pic_version');
    console.log('[当前版本]', app_show_pic_version);
    if (app_show_pic_version && app_show_pic_version == CONFIG.version) {
      wx.switchTab({
        url: '/pages/home/index',
      });
    } else {
      // 展示启动页
      _this.setData({
        banners: [
          {id:1, picUrl: "http://iph.href.lu/1080x1920"},
          {id:2, picUrl: "http://iph.href.lu/1080x1920"},
          {id:3, picUrl: "http://iph.href.lu/1080x1920"}
          ]
      });
      wx.setStorageSync('app_show_pic_version', CONFIG.version);
      console.log('[当前版本]', app_show_pic_version);
    }
  },
  onShow:function(){
    
  },
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  goToIndex: function (e) {
    // WXAPI.addTempleMsgFormid({
    //   token: wx.getStorageSync('token'),
    //   type: 'form',
    //   formId: e.detail.formId
    // })
    if (app.globalData.isConnected) {
      wx.setStorage({
        key: 'app_show_pic_version',
      })
      wx.switchTab({
        url: '/pages/home/index',
      });
    } else {
      wx.showToast({
        title: '当前无网络',
        icon: 'none',
      })
    }
  }
});