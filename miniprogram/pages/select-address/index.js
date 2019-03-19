//index.js
//获取应用实例
var db = require('../../utils/db.js')

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
    var queryResult = db.getUserAddress(app);

    if (queryResult.code === "SUCCESS") {
      this.setData({
        addressList: queryResult.data
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      });
    }
  }
})
