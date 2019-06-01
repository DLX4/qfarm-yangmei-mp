//index.js
var app = getApp();
var trolley = require('../../utils/trolley.js')
Page({
  data: {
    shopCarProducts: [],
    isShopCarEmpty: true,
    isShopCarAllSelect: false,// 购物车是否全选
    shopCarSelectAccount: 0.00 //购物车总金额
  },
  onLoad: function () {
    this.setData({
      shopCarProducts: trolley.getTrolley(app),
      isShopCarEmpty: trolley.isTrolleyEmpty(app),
      shopCarSelectAccount: trolley.sumSelectTrolley(app)
    });

  },
  onShow: function () {
    this.setData({
      shopCarProducts: trolley.getTrolley(app),
      isShopCarEmpty: trolley.isTrolleyEmpty(app),
      shopCarSelectAccount: trolley.sumSelectTrolley(app)
    });
  },
  // 购物车++
  addToTrolley: function (e) {
    var that = this;
    // 更新全局的产品数据
    let productId = e.currentTarget.dataset.productid;

    that.setData({
      shopCarProducts: trolley.addToTrolley(app, productId),
    });

  },
  // 购物车--
  removeFromTrolley: function (e) {
    var that = this;
    // 更新全局的产品数据
    let productId = e.currentTarget.dataset.productid;

    that.setData({
      shopCarProducts: trolley.removeFromTrolley(app, productId),
      shopCarSelectAccount: trolley.sumSelectTrolley(app)
    });

  },
  // 购物车为空时返回到首页
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/home/index"
    });
  },

  // 勾选/去勾选购物车左侧小圆点
  selectTap: function (e) {
    var that = this;
    // 更新全局的产品数据
    let productId = e.currentTarget.dataset.productid;

    that.setData({
      shopCarProducts: trolley.selectTrolleyItem(app, productId),
      shopCarSelectAccount: trolley.sumSelectTrolley(app)
    });

  },
  // 购物车导航到产品详情页
  tapNavProduct: function (e) {
    let productId = e.currentTarget.dataset.productid;
    wx.navigateTo({
      url: "/pages/product-detail/index?id=" + productId
    })
  },

  // 全选/取消全选
  allSelect: function () {
    var that = this;

    that.setData({
      shopCarProducts: trolley.selectAllTrolleyItem(app, !this.data.isShopCarAllSelect),
      isShopCarAllSelect: !this.data.isShopCarAllSelect,
      shopCarSelectAccount: trolley.sumSelectTrolley(app)
    });
  },

  // 购物车底部显示的总价
  totalPrice: function () {
    var list = this.data.goodsList.list;
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        total += parseFloat(curItem.price) * curItem.number;
      }
    }
    total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度
    return total.toFixed(2);
  },

  // 结算按钮点击处理
  toPayOrder: function () {

    wx.showLoading();
    var that = this;
    if (this.data.shopCarSelectAccount <= 0.88) {
      wx.hideLoading();
      return;
    }
    // TODO 每日限购数量判断
    wx.hideLoading();
    this.navigateToPayOrder();

  },
  // 跳转到结算页
  navigateToPayOrder: function () {
    wx.hideLoading();
    trolley.saveSelectTrolleyToPay(app);
    wx.navigateTo({
      url: "/pages/to-pay-order/index"
    })
  },
})
