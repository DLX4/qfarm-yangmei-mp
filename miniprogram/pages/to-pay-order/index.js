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
      productList: that.data.productList,
      expressFee: that.data.expressFee,
      productAmount: that.data.productAmount,
      totalAmount: that.data.totalAmount,
      discountAmount: that.data.discountAmount,
      createTime: new Date(),
      status: 0,
      remark: remark
    };

    db.saveOrder(app, order).then(id => {
      wx.hideLoading();
      console.log('[数据库] [新增记录] [创建订单] 成功，记录 _id: ', id);

      // 清空购物车数据
      if (e && "buyNow" !== that.data.orderType) {
        wx.removeStorageSync('shopCarInfo');
      }

      // 配置模板消息推送
      //TODO
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

    //TODO-DLX
    // wx.request({
    //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/create',
    //   method: 'POST',
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   data: postData, // 设置请求的 参数
    //   success: (res) => {
    //     wx.hideLoading();
    //     if (res.data.code != 0) {
    //       wx.showModal({
    //         title: '错误',
    //         content: res.data.msg,
    //         showCancel: false
    //       })
    //       return;
    //     }
    //
    //     if (e && "buyNow" != that.data.orderType) {
    //       // 清空购物车数据
    //       wx.removeStorageSync('shopCarInfo');
    //     }
    //     if (!e) {
    //       that.setData({
    //         isNeedLogistics: res.data.data.isNeedLogistics,
    //         allGoodsPrice: res.data.data.amountTotle,
    //         allGoodsAndYunPrice: res.data.data.amountLogistics + res.data.data.amountTotle,
    //         yunPrice: res.data.data.amountLogistics
    //       });
    //       that.getMyCoupons();
    //       return;
    //     }
    //     // 配置模板消息推送
    //     var postJsonString = {};
    //     //订单关闭
    //     postJsonString.keyword1 = { value: res.data.data.orderNumber, color: '#173177' }
    //     postJsonString.keyword2 = { value: res.data.data.dateAdd, color: '#173177' }
    //     postJsonString.keyword3 = { value: res.data.data.amountReal + '元', color: '#173177' }
    //     postJsonString.keyword4 = { value: '已关闭', color: '#173177' }
    //     postJsonString.keyword5 = { value: '您可以重新下单，请在30分钟内完成支付', color: '#173177' }
    //     app.sendTempleMsg(res.data.data.id, -1,
    //       'gVeVx5mthDBpIuTsSKaaotlFtl5sC4I7TZmx2PtEYn8', e.detail.formId,
    //       'pages/classification/index', JSON.stringify(postJsonString), 'keyword4.DATA');
    //     //订单已发货待确认通知
    //     postJsonString = {};
    //     postJsonString.keyword1 = { value: res.data.data.orderNumber, color: '#173177' }
    //     postJsonString.keyword2 = { value: res.data.data.dateAdd, color: '#173177' }
    //     postJsonString.keyword3 = { value: '已发货' }
    //     postJsonString.keyword4 = { value: '您的订单已发货，请保持手机通常，如有任何问题请联系客服13722396885', color: '#173177' }
    //     app.sendTempleMsg(res.data.data.id, 2,
    //       'ul45AoQgIIZwGviaWzIngBqohqK2qrCqS3JPcHKzljU', e.detail.formId,
    //       'pages/ucenter/order-details/index?id=' + res.data.data.id, JSON.stringify(postJsonString), 'keyword3.DATA');
    //
    //     // 下单成功，跳转到订单管理界面
    //     wx.redirectTo({
    //       url: "/pages/ucenter/order-list/index"
    //     });
    //   }
    // })

  },
  //
  getDefaultUserAddress: function () {
    var that = this;
    db.getDefaultUserAddress(app).then(result => {
      if (result && result.length > 0 ) {
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
      totalAmount: parseFloat(sum),
      productAmount: parseFloat(sum),
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
