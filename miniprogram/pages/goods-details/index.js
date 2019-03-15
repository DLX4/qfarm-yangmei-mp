//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../templates/wxParse/wxParse.js');

Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail: {},
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSizePrice: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,

    shopDeliveryPrice: 0,

    shopCarInfo:{productList:[]},// 购物车数据
    buyNowInfo:null,
    shopType: "addShopCar",// 当前购物类型，加入购物车或立即购买，默认为加入购物车，前端根据这个变量显示不同的button
    product:null,
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  onLoad: function (e) {
    var that = this;
    // 设置详情页产品信息
    console.log('[详情页]', e.id);
    let products = app.globalData.products;
    for (let i = 0; i < products.length; i++) {
      if (products[i]._id == e.id) {
        this.setData({
          product: products[i],
        });
      }
    }
    console.log('[详情页]', that.data.product);
    that.setData({
      hasMoreSelect: true,
      selectSizePrice: that.data.product.salePrice,
    });

    // 库存信息
    that.setData({
      buyNumMax: that.data.product.pieceNum,
      buyNumber: (that.data.product.pieceNum > 0) ? 1 : 0
    });

    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        that.setData({
          shopCarInfo: (res.data == null ? {productList:[]} : res.data),

        });
      }
    });
    console.log('[初始化购物车数据]', that.data.shopCarInfo)
  },
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.selectPieceNum();
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.selectPieceNum();
  },
  /**
   * 选择件数弹出框
   */
  selectPieceNum: function () {
    this.setData({
      hideShopPopup: false
    })
  },
  /**
   * 选择件数弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  numJianTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },

  /**
  * 加入购物车
  */
  addShopCar: function () {
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建购物车
    this.bulidShopCarInfo();

    // 写入本地存储
    wx.setStorage({
      key: "shopCarInfo",
      data: this.data.shopCarInfo
    })

    this.closePopupTap();
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
  },
	/**
	  * 立即购买
	  */
  buyNow: function () {

    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }

    //组建立即购买信息
    var buyNowInfo = this.buildBuyNowInfo();
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    this.closePopupTap();

    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow"
    })
  },
  /**
   * 组建购物车信息
   */
  bulidShopCarInfo: function () {
    // 加入购物车
    let shopCarProduct = {};
    shopCarProduct.productId = this.data.product._id;
    shopCarProduct.pic = this.data.product.pic;
    shopCarProduct.name = this.data.product.title;
    shopCarProduct.price = this.data.product.salePrice;
    shopCarProduct.active = true;
    shopCarProduct.number = this.data.buyNumber;
    shopCarProduct.weight = this.data.product.weight;

    let shopCarProductList = this.data.shopCarInfo.productList;
    let mergerFlag = false;
    for (let i = 0; i < shopCarProductList.length; i++) {
      if (shopCarProductList[i].productId == shopCarProduct.productId) {
        mergerFlag = true;
        shopCarProductList[i].number = shopCarProductList[i].number + shopCarProduct.number;
        break;
      }
    }
    if (!mergerFlag) {
      this.data.shopCarInfo.productList.push(shopCarProduct);
      this.setData({
        shopCarInfo: this.data.shopCarInfo
      });
    }
    console.log('[添加到购物车]', this.data.shopCarInfo)
  },
	/**
	 * 组建立即购买信息
	 */
  buildBuyNowInfo: function () {
    let buyNowProduct = {};
    buyNowProduct.productId = this.data.product._id;
    buyNowProduct.pic = this.data.product.pic;
    buyNowProduct.name = this.data.product.title;
    buyNowProduct.price = this.data.product.salePrice;
    buyNowProduct.active = true;
    buyNowProduct.number = this.data.buyNumber;
    buyNowProduct.weight = this.data.product.weight;
    this.data.buyNowInfo = buyNowProduct;
    console.log('[立即购买]', this.data.buyNowInfo);
    return buyNowProduct;
  },

  onShareAppMessage: function () {
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + wx.getStorageSync('openid'),
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  // reputation: function (goodsId) {
  //   var that = this;
  //   wx.request({
  //     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/reputation',
  //     data: {
  //       goodsId: goodsId
  //     },
  //     success: function (res) {
  //       if (res.data.code == 0) {
  //         //console.log(res.data.data);
  //         that.setData({
  //           reputation: res.data.data
  //         });
  //       }
  //     }
  //   })
  // },
  // getVideoSrc: function (videoId) {
  //   var that = this;
  //   wx.request({
  //     url: 'https://api.it120.cc/' + app.globalData.subDomain + '/media/video/detail',
  //     data: {
  //       videoId: videoId
  //     },
  //     success: function (res) {
  //       if (res.data.code == 0) {
  //         that.setData({
  //           videoMp4Src: res.data.data.fdMp4
  //         });
  //       }
  //     }
  //   })
  // },


})
