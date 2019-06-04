//index.js
//获取应用实例
var db = require('../../utils/db.js')
var trolley = require('../../utils/trolley.js')
var app = getApp()

Page({
  data: {
    productsToPay: [], // 准备下单的产品信息 + 数量 + 重量等
    curAddressData: null,// 地址信息
    expressFee: 0,// 快递费
    productAmount: 0, // 产品本身的费用
    totalAmount: 0,// 订单总额
    discountAmount: 0,// 折扣金额，默认是零
  },
  onShow: function () {
    var that = this;

    that.setData({
      productsToPay: trolley.getSelectTrolleyToPay(app),
    });
    that.getDefaultUserAddress();
    that.processTotalAmount();
  },

  onLoad: function (e) {
    var that = this;

  },

  // [重要] 下单接口
  createOrder: function (e) {
    var that = this;
    wx.showLoading();
    if (!that.data.curAddressData) {
      wx.hideLoading();
      wx.showModal({
        title: '错误',
        content: '请先设置您的收货地址！',
        showCancel: false
      });
      return;
    }
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }

    // 订单信息
    let order = {
      userAddress: that.data.curAddressData,
      productList: that.data.productsToPay,
      expressFee: that.data.expressFee,
      productAmount: that.data.productAmount,
      totalAmount: that.data.totalAmount,
      discountAmount: that.data.discountAmount,
      createTime: new Date(),
      isPaid: false,
      status: 0,
      remark: remark
    };

    db.saveOrder(app, order).then(id => {
      wx.hideLoading();
      console.log('[数据库] [新增记录] [创建订单] 成功，记录 _id: ', id);

      // 清除购物车数据
      trolley.deleteTrolleyForOrder(app);

      // 下单成功，跳转到订单管理界面
      wx.redirectTo({
        url: "/pages/ucenter/order-list/index"
      });
    }, err => {
      wx.hideLoading();
      wx.showModal({
        title: '错误',
        content: '下单失败',
        showCancel: false
      });
      console.error('[数据库] [新增记录] [创建订单] 失败：', err)
    })

  },
  //
  getDefaultUserAddress: function () {
    var that = this;
    db.getDefaultUserAddress(app).then(result => {
      if (result.length > 0 ) {
        this.setData({
          curAddressData: {
            addressId: result[0].id,
            address: result[0].address,
            cityName: result[0].cityName,
            districtName: result[0].districtName,
            mobile: result[0].mobile,
            name: result[0].name,
            postalCode: result[0].postalCode,
            provinceName: result[0].provinceName
          }
        });
      }
    }, err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      console.error('[数据库] [查询记录] 失败：', err)
    });

  },
  processTotalAmount: function () {
    let sum = 0.00;
    for (let i = 0; i < this.data.productsToPay.length; i++) {
      if (this.data.productsToPay[i].active) {
        sum += parseFloat(this.data.productsToPay[i].salePrice) * this.data.productsToPay[i].numb;
      }
    }

    this.setData({
      expressFee: 0,
      totalAmount: parseFloat(sum).toFixed(2),
      productAmount: parseFloat(sum).toFixed(2),
      discountAmount: 0,
    })
  },
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  }
})
