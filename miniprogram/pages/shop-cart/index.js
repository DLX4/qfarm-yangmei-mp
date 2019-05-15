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

  // 全选/取消全选
  allSelect: function () {
    var that = this;

    that.setData({
      shopCarProducts: trolley.selectAllTrolleyItem(app),
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
    return total;
  },

  // 结算按钮点击处理
  toPayOrder: function () {
    if (this.data.goodsList.totalPrice < this.data.shopDeliveryPrice){
      wx.showModal({
        title: '未达到起送价',
        content: '请您再选一些吧！',
        showCancel: false,
      })
    }else{
      wx.showLoading();
      var that = this;
      if (this.data.goodsList.noSelect) {
        wx.hideLoading();
        return;
      }
      // 重新计算价格，判断库存
      var shopList = [];
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        // shopList = shopCarInfoMem.shopList
        shopList = shopCarInfoMem.shopList.filter(entity => {
          return entity.active;
        });
      }
      if (shopList.length == 0) {
        wx.hideLoading();
        return;
      }
      var isFail = false;
      var doneNumber = 0;
      var needDoneNUmber = shopList.length;
      for (let i = 0; i < shopList.length; i++) {
        if (isFail) {
          wx.hideLoading();
          return;
        }
        let carShopBean = shopList[i];
        // 获取价格和库存
        if (!carShopBean.propertyChildIds || carShopBean.propertyChildIds == "") {
          //TODO-DLX
          // wx.request({
          //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/detail',
          //   data: {
          //     id: carShopBean.goodsId
          //   },
          //   success: function (res) {
          //     doneNumber++;
          //     if (res.data.data.properties) {
          //       wx.showModal({
          //         title: '提示',
          //         content: res.data.data.basicInfo.name + ' 商品已失效，请重新购买',
          //         showCancel: false
          //       })
          //       isFail = true;
          //       wx.hideLoading();
          //       return;
          //     }
          //     if (res.data.data.basicInfo.stores < carShopBean.number) {
          //       wx.showModal({
          //         title: '提示',
          //         content: res.data.data.basicInfo.name + ' 库存不足，请重新购买',
          //         showCancel: false
          //       })
          //       isFail = true;
          //       wx.hideLoading();
          //       return;
          //     }
          //     if (res.data.data.basicInfo.minPrice != carShopBean.price) {
          //       wx.showModal({
          //         title: '提示',
          //         content: res.data.data.basicInfo.name + ' 价格有调整，请重新购买',
          //         showCancel: false
          //       })
          //       isFail = true;
          //       wx.hideLoading();
          //       return;
          //     }
          //     if (needDoneNUmber == doneNumber) {
          //       that.navigateToPayOrder();
          //     }
          //   }
          // })
        } else {
          //TODO-DLX
          // wx.request({
          //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/price',
          //   data: {
          //     goodsId: carShopBean.goodsId,
          //     propertyChildIds: carShopBean.propertyChildIds
          //   },
          //   success: function (res) {
          //     doneNumber++;
          //     if (res.data.data.stores < carShopBean.number) {
          //       wx.showModal({
          //         title: '提示',
          //         content: carShopBean.name + ' 库存不足，请重新购买',
          //         showCancel: false
          //       })
          //       isFail = true;
          //       wx.hideLoading();
          //       return;
          //     }
          //     if (res.data.data.price != carShopBean.price) {
          //       wx.showModal({
          //         title: '提示',
          //         content: carShopBean.name + ' 价格有调整，请重新购买',
          //         showCancel: false
          //       })
          //       isFail = true;
          //       wx.hideLoading();
          //       return;
          //     }
          //     if (needDoneNUmber == doneNumber) {
          //       that.navigateToPayOrder();
          //     }
          //   }
          // })
        }

      }
    }
  },
  // 跳转到结算页
  navigateToPayOrder: function () {
    wx.hideLoading();
    wx.navigateTo({
      url: "/pages/to-pay-order/index"
    })
  },
})
