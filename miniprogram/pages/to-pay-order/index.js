//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    productList: [],
    expressFee: 0,
    productAmount: 0,
    totalAmount: 0,
    discountAmount: 0,
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
    that.getUserAddress();
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

  createOrder: function (e) {
    var that = this;
    wx.showLoading();
    var loginToken = wx.getStorageSync('token') // 用户登录 token
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }

    var postData = {
      token: loginToken,
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark
    };
    if (that.data.kjId) {
      postData.kjid = that.data.kjId;
    }
    if (that.data.isNeedLogistics > 0) {
      if (!that.data.curAddressData) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      }
      postData.provinceId = that.data.curAddressData.provinceId;
      postData.cityId = that.data.curAddressData.cityId;
      if (that.data.curAddressData.districtId) {
        postData.districtId = that.data.curAddressData.districtId;
      }
      postData.address = that.data.curAddressData.address;
      postData.name = that.data.curAddressData.name;
      postData.mobile = that.data.curAddressData.mobile;
      postData.code = that.data.curAddressData.code;
    }
    if (that.data.curCoupon) {
      postData.couponId = that.data.curCoupon.id;
    }
    if (!e) {
      postData.calculate = "true";
    }

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
  getUserAddress: function () {
    var that = this;
    let db = app.globalData.db;
    db.collection('user_address').where({
      _openid: app.globalData.openid,
      isDefault:true
    }).get({
      success: res => {
        if (res.data && res.data.length > 0) {
          this.setData({
            curAddressData: res.data[0]
          })
          console.log('[数据库] [查询记录] 成功: ', res)
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
    //TODO-DLX
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
