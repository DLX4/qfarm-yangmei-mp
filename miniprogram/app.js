//app.js
var db = require('./utils/db.js')
App({
  onLaunch: function () {
    var that = this;

    // 检测新版本
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(function(res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000,
          complete: function() {
            that.goStartPage()
          }
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    });

    // 获取产品数据
    wx.cloud.init();
    that.globalData.db = wx.cloud.database();

    // 记录log
    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
    that.userLogin();
  },
  onShow (e) {
    this.globalData.launchOption = e
    // 保存邀请人
    if (e && e.query && e.query.inviter_id) {
      wx.setStorageSync('referrer', e.query.inviter_id)
    }
  },
  // 获取用户授权
  userAuthorize: function() {
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              console.log('用户授权成功', res);
              //that.bindGetUserInfo();
            }
          })
        } else {
          console.log('用户已经授权过了', res);
        }
      }
    });
  },
  // 用户登录（获取并保存用户openid）
  userLogin: function() {
    var that = this;

    let openid = wx.getStorageSync('openid');
    if (openid) {
      that.globalData.openid = openid;
      return;
    }
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        that.globalData.openid = res.result.openid;
        wx.setStorageSync('openid', that.globalData.openid);
      }
    });
  },
  // 跳转到起始页
  goStartPage: function() {
    setTimeout(function() {
      wx.redirectTo({
        url: "/pages/start/start"
      })
    }, 1000)
  },

  globalData:{
    products: [], // 全局的产品信息（包括购物车数据），同步保存到storage
    db:{}, // 全局的数据库对象
    openid: null, // 全局的openID
    productsToPay: [],// 选中准备下单的产品（购物车==> 下单收银台）, 存在内存中

    // 其它全局变量（TODO： 删除不用的全局变量）
    isConnected: true,
    launchOption: undefined,
    mallName:"杨梅小店",
    shareProfile: '为您奉上最好的杨梅', // 首页转发的时候术语
    globalBGColor: '#fff',
    bgRed: 255,
    bgGreen: 255,
    bgBlue: 255,
  }
})
