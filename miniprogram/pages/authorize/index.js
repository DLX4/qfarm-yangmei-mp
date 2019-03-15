// pages/authorize/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 查看是否授权
    wx.getSetting({
      success: function(res){
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              console.log(res.userInfo)
            }
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  rejectLogin: function (e){
    wx.navigateBack({
      
    })
  },
  bindGetUserInfo: function (e) {
    var userInfo = e.detail.userInfo;
    if (!userInfo){
      return;
    }
    wx.setStorageSync('userInfo', userInfo)
    this.login(userInfo);
  },
  login: function (userInfo) {
    let that = this;
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('>>>>>cloud login', res);
        app.globalData.openid = res.result.openid
        this.setData({
          step: 2,
          openid: res.result.openid
        })
      },
      fail: err => {
        // 登录错误
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '无法登录，请重试',
          showCancel: false
        });
        console.log('[云函数] [login] 获取 openid 失败，请检查是否有部署云函数，错误信息：', err)
      }
    });

    let token = wx.getStorageSync('token');
    if (token) {
      //TODO-DLX
      // wx.request({
      //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/check-token',
      //   data: {
      //     token: token
      //   },
      //   success: function (res) {
      //     if (res.data.code != 0) {
      //       wx.removeStorageSync('token')
      //       that.login();
      //     } else {
      //       // 回到原来的地方放
      //       wx.navigateBack();
      //     }
      //   }
      // })
      return;
    }
    return;
    wx.login({
      success: function (res) {
        console.log('>>>>>login', res)
        console.log(res.code)
        if (res.code == 10000) {
          // 去注册
          that.registerUser();
          return;
        }
        else if (res.data.code != 0) {
          // 登录错误
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '无法登录，请重试',
            showCancel: false
          });
          return;
        }
        wx.setStorageSync('token', res.data.data.token)
        wx.setStorageSync('uid', res.data.data.uid)
        // 回到原来的页面
        wx.navigateBack();
        // wx.request({
        //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/wxapp/login',
        //   data: {
        //     code: res.code
        //   },
        //   success: function (res) {
        //     console.log(res.data.code)
        //     if (res.data.code == 10000) {
        //       // 去注册
        //       that.registerUser();
        //       return;
        //     }
        //     else if (res.data.code != 0) {
        //       // 登录错误
        //       wx.hideLoading();
        //       wx.showModal({
        //         title: '提示',
        //         content: '无法登录，请重试',
        //         showCancel: false
        //       })
        //       return;
        //     }
        //     wx.setStorageSync('token', res.data.data.token)
        //     wx.setStorageSync('uid', res.data.data.uid)
        //     // 回到原来的页面
        //     wx.navigateBack();
        //   }
        // })
      }
    })
  },
  registerUser: function () {
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        var iv = res.iv;
        var encryptedData = res.encryptedData;
        console.log(res);
        console.log(res.userInfo)
        //TODO-DLX
        // 下面开始调用注册接口
        // wx.request({
        //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/wxapp/register/complex',
        //   data: { code: code, encryptedData: encryptedData, iv: iv }, // 设置请求的 参数
        //   success: (res) => {
        //     wx.hideLoading();
        //     that.login();
        //   }
        // })
      }
    })
  }
})