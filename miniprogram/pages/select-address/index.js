//index.js
//获取应用实例
var db = require('../../utils/db.js')

var app = getApp()
Page({
  data: {
    addressList:[]
  },

  selectTap: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;

    for (var i = 0; i < that.data.addressList.length; i++) {
      if (that.data.addressList[i]._id === id) {
        // 更新用户的地址（默认地址）
        if (!that.data.addressList[i].isDefault) {
          that.data.addressList[i].isDefault = true ;
          db.updateUserAddress(app, that.data.addressList[i]).then(res => {
          }, err => {
            wx.showToast({
              icon: 'none',
              title: '地址更新失败'
            })
          });
        }

      } else {
        if (that.data.addressList[i].isDefault) {
          that.data.addressList[i].isDefault = false;
          db.updateUserAddress(app, that.data.addressList[i]).then(res => {
          }, err => {
            wx.showToast({
              icon: 'none',
              title: '地址更新失败'
            })
          });
        }
      }
    }
    wx.navigateBack({});

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

  },
  onShow : function () {
    this.getUserAddress();
  },
  getUserAddress: function () {
    var that = this;
    var queryResult = db.getUserAddress(app).then(data => {
      if (data && data.length > 0 ) {
        this.setData({
          addressList: data
        });
      }

    }, err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      });
    });

  }
})
