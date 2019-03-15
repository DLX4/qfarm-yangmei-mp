const app = getApp()

Page({
  data: {
    aboutUsTitle: '',
    aboutUsContent: '',
    servicePhoneNumber: '',
    balance: 0,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0,
    iconSize: 45,
    iconColor: '#999999'
  },
  onPullDownRefresh: function () {
    var that = this
    wx.showNavigationBarLoading()
    that.onShow()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  onLoad() {
    let that = this;
    that.setData({
      version: app.globalData.version,
      background_color: app.globalData.globalBGColor,
      bgRed: app.globalData.bgRed,
      bgGreen: app.globalData.bgGreen,
      bgBlue: app.globalData.bgBlue
    })

  },
  onShow() {
    var that = this;
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      app.goLoginPageTimeOut()
    } else {
      that.setData({
        userInfo: userInfo,
      })
    }
    that.getUserApiInfo();
    that.getAboutUs();
    that.getservicePhoneNumber();
    
  },
  aboutUs: function () {
    var that = this
    wx.showModal({
      title: that.data.aboutUsTitle,
      content: that.data.aboutUsContent,
      showCancel: false
    })
  },
  makePhoneCall: function () {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.servicePhoneNumber,
      success: function (res) { },
      fail: function (res) {
        wx.showModal({
          title: '呼叫失败',
          content: '请稍后再试',
          showCancel: false,
        })
      },
      complete: function (res) { },
    })
  },
  getPhoneNumber: function (e) {
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      console.log(e.detail.errMsg)
      wx.showModal({
        title: '提示',
        content: '无法获取手机号码',
        showCancel: false
      })
      return;
    }
    var that = this;
    //TODO-DLX
    // wx.request({
    //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/wxapp/bindMobile',
    //   data: {
    //     token: wx.getStorageSync('token'),
    //     encryptedData: e.detail.encryptedData,
    //     iv: e.detail.iv
    //   },
    //   success: function (res) {
    //     if (res.data.code == 0) {
    //       wx.showToast({
    //         title: '绑定成功',
    //         icon: 'success',
    //         duration: 2000
    //       })
    //       that.getUserApiInfo();
    //     } else {
    //       wx.showModal({
    //         title: '提示',
    //         content: '绑定失败',
    //         showCancel: false
    //       })
    //     }
    //   }
    // })
  },
  getUserApiInfo: function () {
    var that = this;
    //TODO-DLX
    // wx.request({
    //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/detail',
    //   data: {
    //     token: wx.getStorageSync('token')
    //   },
    //   success: function (res) {
    //     if (res.data.code == 0) {
    //       that.setData({
    //         apiUserInfoMap: res.data.data,
    //         userMobile: res.data.data.base.mobile
    //       });
    //     }
    //   }
    // })

  },
  getAboutUs: function () {
    var that = this
    //  获取关于我们Title
      //TODO-DLX
    // wx.request({
    //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
    //   data: {
    //     key: 'aboutUsTitle'
    //   },
    //   success: function (res) {
    //     if (res.data.code == 0) {
    //       that.setData({
    //         aboutUsTitle: res.data.data.value
    //       })
    //     }
    //   }
    // })
    // //  获取关于我们内容
    // wx.request({
    //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
    //   data: {
    //     key: 'aboutUsContent'
    //   },
    //   success: function (res) {
    //     if (res.data.code == 0) {
    //       that.setData({
    //         aboutUsContent: res.data.data.value
    //       })
    //     }
    //   }
    // })
  },
  getservicePhoneNumber: function () {
    var that = this
    //  获取客服电话
      //TODO-DLX
    // wx.request({
    //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
    //   data: {
    //     key: 'servicePhoneNumber'
    //   },
    //   success: function (res) {
    //     if (res.data.code == 0) {
    //       that.setData({
    //         servicePhoneNumber: res.data.data.value
    //       })
    //     }
    //   }
    // })
  },

  relogin: function () {
    wx.navigateTo({
     url: "/pages/authorize/index"
    })
    this.onLoad()
  },
  recharge: function () {
    wx.navigateTo({
      url: "/pages/recharge/index"
    })
  },
  // withdraw: function () {
  //   wx.navigateTo({
  //     url: "/pages/withdraw/index"
  //   })
  // }
})