//index.js
//获取应用实例
var db = require('../../utils/db.js')
var local = require('../../utils/local.js')
var trolley = require('../../utils/trolley.js')
var app = getApp();
Page({
  data: {
    // 配置数据
    isEnd: false, //到底啦
    autoplay: true,
    indicatorDots: true,
    interval: 3500,
    duration: 1500,
    loadingMore: false, // loading中
    swiperCurrent: 0,
    recommendTitlePicStr: '',
    loadingMoreHidden: true,

    // 业务数据
    noticeList:[],
    banners: [],
    shopCarProducts: []
  },

  /*------------------------------------业务数据---------------------------------------*/
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '仙居杨梅自产自销',
    });

    var that = this;
    that.setData({
      shopCarProducts: app.globalData.products,
      loadingMore: true,
      isEnd: true,
      banners: [
        {bannerId:'XIpZm3kPDdDCJ7Hx', picUrl:"https://7166-qfarm-mp-test-8ef757-1258810866.tcb.qcloud.la/product01/ym-01.PNG"},
        {bannerId:'XIpZm3kPDdDCJ7Hx', picUrl:"https://7166-qfarm-mp-test-8ef757-1258810866.tcb.qcloud.la/product01/ym-02.PNG"},
        {bannerId:'XIpZm3kPDdDCJ7Hx', picUrl:"https://7166-qfarm-mp-test-8ef757-1258810866.tcb.qcloud.la/product01/ym-03.PNG"}
      ],
      noticeList: [
        {id:1, title:"自产自销，做回头客生意，无中间商赚差价"},
        {id:2, title:"仙居勤富农场杨梅品质保证",},
      ]
    });

    // 获取产品数据
    this.getProductsFromDB();

  },
  onShow: function () {
    let that = this;
    that.setData({
      shopCarProducts: app.globalData.products
    });
  },

  // 从数据库获取产品数据，并和本地的数据merge
  getProductsFromDB: function () {
    let that = this;
    db.getProducts(app).then(data => {
      if (data.length === 0) {
        return;
      }

      // merge本地的产品数据
      let productsLocal = local.getProductsLocal().products;

      for (let i = 0; i < data.length; i++) {
        let temp = data[i];
        temp.salePrice = temp.salePrice.toFixed(2);
        temp.originPrice = temp.originPrice.toFixed(2);
        temp.numb = 0;
        // 累计已经添加的件数
        if (productsLocal !== undefined
          && productsLocal.length !== undefined
          && productsLocal.length > 0) {

          for (let j = 0; j < productsLocal.length; j++) {
            if (data[i]._id === productsLocal[j]._id) {
              data[i].numb += productsLocal[j].numb;
            }
          }
        }
      }
      // 保存
      local.saveProductsLocal({products:data});

      app.globalData.products = data;
      console.log('[load页]获取所有产品信息merge', app.globalData.products);

      that.setData({
        shopCarProducts: app.globalData.products,
        loadingMore: false,
        isEnd: true,
      });

      // 刷新购物车tab的红点消息
      trolley.refreshTrolleyBadge(app);

    });
  },

  // 获取本地产品数据
  getProductsLocal: function (productId) {
    let productsLocal = local.getProductsLocal();
    for (let i = 0; i < productsLocal.length; i++) {
      if (productsLocal[i]._id === productId) {
        return productsLocal;
      }
    }
  },

  // 跳转到产品详情页（产品列表）
  tapNavProduct: function (e) {
    let productId = e.currentTarget.dataset.productid;
    wx.navigateTo({
      url: "/pages/product-detail/index?id=" + productId
    })
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
    });

  },

  /*------------------------------------事件处理函数---------------------------------------*/
  onPullDownRefresh: function () {
    var that = this
    that.setData({
      loadingMore: true,
    })
    wx.showNavigationBarLoading()
    that.onLoad()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  onShareAppMessage: function () {
    return {
      title: app.globalData.mallName + '——' + app.globalData.shareProfile,
      path: '/pages/home/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onReachBottom: function(){

  },

  // 滑动banner事件处理函数
  swiperchange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },

})
