//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../templates/wxParse/wxParse.js');
var local = require('../../utils/local.js')
Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail: {},
    swiperCurrent: 0,

    product:null,
  },
  
  onLoad: function (e) {
    var that = this;
    // 设置详情页产品信息
    console.log('[详情页]', e.id);
    let products = app.globalData.products;
    for (let i = 0; i < products.length; i++) {
      if (products[i]._id === e.id) {
        this.setData({
          product: products[i],
        });
      }
    }
    console.log('[详情页]', that.data.product);
  },
  // 跳转到购物车
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  // 购物车++
  addToTrolley: function (e) {
    var that = this;
    // 更新全局的产品数据
    let productId = e.currentTarget.dataset.productid;
    let numb = 0;
    for (let i = 0; i < app.globalData.products.length; i++) {
      if (app.globalData.products[i]._id === productId) {
        app.globalData.products[i].numb++;
        that.setData({
          product: app.globalData.products[i],
        });
      }
      numb += app.globalData.products[i].numb;
    }

    // 更新购物车红点提示
    wx.setTabBarBadge( {
        index: 1,
        text: numb + '',
      }
    );
    // 保存到本地
    local.saveProductsLocal({products: app.globalData.products});
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },

})
