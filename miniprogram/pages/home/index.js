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
      title: '仙居杨梅',
    });

    var that = this;
    that.setData({
      recommendTitlePicStr: "http://iph.href.lu/175x56",
      shopCarProducts: app.globalData.products,
      loadingMore: true,
      isEnd: true,
      banners: [
        {bannerId:'XIpZm3kPDdDCJ7Hx', picUrl:"http://iph.href.lu/750x375"},
        {bannerId:'XIpZm3kPDdDCJ7Hx', picUrl:"http://iph.href.lu/750x375"}
      ],
      noticeList: [
        {
          id:1, title:"仙居杨梅火热预定中！",
        },
        {
          id:2, title:"仙居杨梅火热预定中！",
        }
      ]
    });

    // 获取产品数据
    this.getProductsFromDB();

  },
  onShow: function () {
  },

  // 从数据库获取产品数据，并和本地的数据merge
  getProductsFromDB: function () {
    let that = this;
    db.getProducts(app).then(data => {
      if (data.length === 0) {
        return;
      }

      for (let i = 0; i < data.length; i++) {
        let temp = data[i];
        temp.salePrice = temp.salePrice.toFixed(2);
        temp.originPrice = temp.originPrice.toFixed(2);
        // 已经添加的件数
        temp.numb = 0;
        //console.log('[插入更新产品数据]',temp);
        that.insdateProductsLocal(temp);

      }
      app.globalData.products = local.getProductsLocal().products;
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

  // 保存更新本地产品数据
  insdateProductsLocal: function (product) {
    let productsData = local.getProductsLocal();
    //console.log('[product信息]>> 从storage读取', productsData);
    if (productsData === "") {
      productsData = {products: [product]};
      local.saveProductsLocal(productsData);
      return;
    }

    for (let i = 0; i < productsData.products.length; i++) {
      if (productsData.products[i]._id === product._id) {
        product.numb += productsData.products[i].numb;
        productsData.products[i] = product;
        local.saveProductsLocal(productsData);
        return;
      }
    }
    productsData.products[productsData.products.length] = product;
    local.saveProductsLocal(productsData);
    //console.log('[product信息]>> 新增并写入到storage', productsData);
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
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/product-detail/index?id=" + e.currentTarget.dataset.id
    })
  },
  // 跳转到产品详情页（顶部banner）
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id !== 0) {
      wx.navigateTo({
        url: "/pages/product-detail/index?id=" + e.currentTarget.dataset.id
      })
    }
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
      isEnd: false
    })
    wx.showNavigationBarLoading()
    that.onLoad()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  onShareAppMessage: function () {
    return {
      title: app.globalData.mallName + '——' + app.globalData.shareProfile,
      path: '/pages/finder/index',
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
