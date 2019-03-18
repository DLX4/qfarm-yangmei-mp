//index.js
//获取应用实例
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
      loadingMore: false,
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

  },
  onShow: function () {
    this.refreshTrolleyBadge();
  },

  // 跳转到产品详情页（产品列表）
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  // 跳转到产品详情页（顶部banner）
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  // 刷新购物车tab的红点消息
  refreshTrolleyBadge: function() {
    let numb = 0;
    for (let i = 0; i < app.globalData.products.length; i++) {
      numb += app.globalData.products[i].numb;
    }
    // 更新购物车红点提示
    wx.setTabBarBadge( {
        index: 1,
        text: numb + '',
      }
    );
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
      }
      numb += app.globalData.products[i].numb;
    }

    that.setData({
      shopCarProducts: app.globalData.products,
    });
    // 更新购物车红点提示
    wx.setTabBarBadge( {
        index: 1,
        text: numb + '',
      }
    );
    // 保存到本地
    app.saveProductsLocal();
  },
  // 购物车--
  removeFromTrolley: function (e) {
    var that = this;
    // 更新全局的产品数据
    let productId = e.currentTarget.dataset.productid;
    let numb = 0;

    for (let i = 0; i < app.globalData.products.length; i++) {
      if (app.globalData.products[i]._id == productId) {
        app.globalData.products[i].numb--;
      }
      numb += app.globalData.products[i].numb;
    }

    that.setData({
      shopCarProducts: app.globalData.products,
    })
    // 更新购物车红点提示
    if (numb <= 0) {
      wx.removeTabBarBadge( {
          index: 1,
        }
      )
    }
    // 保存到本地
    app.saveProductsLocal();
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
