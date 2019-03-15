//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    addressList:[]
  },

  selectTap: function (e) {
    var id = e.currentTarget.dataset.id;
      //TODO-DLX
    // wx.request({
    //   url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/user/shipping-address/update',
    //   data: {
    //     token: wx.getStorageSync('token'),
    //     id:id,
    //     isDefault:'true'
    //   },
    //   success: (res) =>{
    //     wx.navigateBack({})
    //   }
    // })
  },

  addAddess : function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  
  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },
  
  onLoad: function () {
    console.log('onLoad')

   
  },
  onShow : function () {
    this.getUserAddress();
  },
  getUserAddress: function () {
    var that = this;
    let db = app.globalData.db;
    db.collection('user_address').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        this.setData({
          addressList: res.data
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    });
      //TODO-DLX
    // wx.request({
    //   url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/user/shipping-address/list',
    //   data: {
    //     token: wx.getStorageSync('token')
    //   },
    //   success: (res) =>{
    //     if (res.data.code == 0) {
    //       that.setData({
    //         addressList:res.data.data
    //       });
    //     } else if (res.data.code == 700){
    //       that.setData({
    //         addressList: null
    //       });
    //     }
    //   }
    // })
  }

})
