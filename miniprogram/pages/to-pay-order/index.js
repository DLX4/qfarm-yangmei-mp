//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    productList: [], // 下单的产品信息 + 数量 + 重量等
    curAddressData: null,// 地址信息
    expressFee: 0,// 快递费
    productAmount: 0, // 产品本身的费用
    totalAmount: 0,// 订单总额
    discountAmount: 0,// 折扣金额，默认是零
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
  },
  onShow: function () {
    var that = this;
    var productList = [];
    //立即购买下单
    if ("buyNow" === that.data.orderType) {
      console.log('buyNow!!')
      var buyNowInfo = wx.getStorageSync('buyNowInfo');
      if (buyNowInfo) {
        productList.push(buyNowInfo);
      }
    } else {
      //购物车下单
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      if (shopCarInfoMem && shopCarInfoMem.productList) {
        productList = shopCarInfoMem.productList.filter(entity => {
          return entity.active;
        });
      }
    }
    that.setData({
      productList: productList,
    });
    that.getDefaultUserAddress();
    that.processTotalAmount();
  },

  onLoad: function (e) {
    var that = this;
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      orderType: e.orderType
    });
  },

  getDistrictId: function (obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
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

    let db = app.globalData.db;
    db.collection('order').add({
      data: {
        userAddress: that.data.curAddressData,
        productList: that.data.productList,
        expressFee: that.data.expressFee,
        productAmount: that.data.productAmount,
        totalAmount: that.data.totalAmount,
        discountAmount: that.data.discountAmount,
        createTime: new Date(),
        status: 0,
        remark: that.data.remark
      },
      success: res => {
        wx.hideLoading();
        // wx.showToast({
        //   title: '订单保存成功',
        // })
        console.log('[数据库] [新增记录] [创建订单] 成功，记录 _id: ', res._id);

        // 清空购物车数据
        if (e && "buyNow" != that.data.orderType) {
          wx.removeStorageSync('shopCarInfo');
        }

        // 配置模板消息推送
        //TODO
        // 下单成功，跳转到订单管理界面
        wx.redirectTo({
          url: "/pages/ucenter/order-list/index"
        });
      },
      fail: err => {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '下单失败',
          showCancel: false
        });
        console.error('[数据库] [新增记录] [创建订单] 失败：', err)
      }
    });

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
    let db = app.globalData.db;
    db.collection('user_address').where({
      _openid: app.globalData.openid,
      isDefault:true
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] [用户地址] 成功: ', res);
        if (res.data && res.data.length > 0 ) {
          that.data.curAddressData = {};
          that.data.curAddressData.addressId = res.data[0].id;
          that.data.curAddressData.address = res.data[0].address;
          that.data.curAddressData.cityName = res.data[0].cityName;
          that.data.curAddressData.districtName = res.data[0].districtName;
          that.data.curAddressData.mobile = res.data[0].mobile;
          that.data.curAddressData.name = res.data[0].name;
          that.data.curAddressData.postalCode = res.data[0].postalCode;
          that.data.curAddressData.provinceName = res.data[0].provinceName;
          this.setData({
            curAddressData: that.data.curAddressData
          });
        }
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    });

  },
  processTotalAmount: function () {
    this.setData({
      expressFee: 30,
      totalAmount: 200,
      productAmount: 198,
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
