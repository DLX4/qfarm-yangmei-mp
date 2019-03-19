//app.js
var starscore = require("./templates/starscore/starscore.js");
var db = require('./utils/db.js')
App({
  onLaunch: function () {
    var that = this;

    // 检测新版本
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(function(res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000,
          complete: function() {
            that.goStartPage()
          }
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    });

    // 获取产品数据
    wx.cloud.init();
    that.globalData.db = wx.cloud.database();
    that.getProductsFromDB();

    // 记录log
    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
    that.userLogin();
  },
  onShow (e) {
    this.globalData.launchOption = e
    // 保存邀请人
    if (e && e.query && e.query.inviter_id) {
      wx.setStorageSync('referrer', e.query.inviter_id)
    }
  },
  // 获取用户授权
  userAuthorize: function() {
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              console.log('用户授权成功', res);
              //that.bindGetUserInfo();
            }
          })
        } else {
          console.log('用户已经授权过了', res);
        }
      }
    });
  },
  // 用户登录（获取并保存用户openid）
  userLogin: function() {
    var that = this;

    let openid = wx.getStorageSync('openid');
    if (openid) {
      return;
    }
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        that.globalData.openid = res.result.openid;
        wx.setStorageSync('openid', that.globalData.openid);
      }
    });
  },
  // 跳转到起始页
  goStartPage: function() {
    setTimeout(function() {
      wx.redirectTo({
        url: "/pages/start/start"
      })
    }, 1000)
  },
  // 从数据库获取产品数据，并和本地的数据merge
  getProductsFromDB: function () {
    let that = this;
    db.getProducts(this).then(data => {
      that.globalData.products = [];
      if (data.length == 0) {
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
      that.globalData.products = wx.getStorageSync('product_data').products;
      console.log('[load页]获取所有产品信息merge', that.globalData.products);
    });
  },

  // 保存更新本地产品数据
  insdateProductsLocal: function (product) {
    let productsData = wx.getStorageSync('product_data');
    //console.log('[product信息]>> 从storage读取', productsData);
    if (productsData == "") {
      productsData = {products: [product]};
      wx.setStorageSync('product_data', productsData);
      //console.log('[product信息]>> 初始化并写入到storage', productsData);
      return;
    }

    for (let i = 0; i < productsData.products.length; i++) {
      if (productsData.products[i]._id === product._id) {
        product.numb += productsData.products[i].numb;
        productsData.products[i] = product;
        wx.setStorageSync('product_data', productsData);
        //console.log('[product信息]>> 更新并写入到storage', productsData);
        return;
      }
    }
    productsData.products[productsData.products.length] = product;
    wx.setStorageSync('product_data', productsData);
    //console.log('[product信息]>> 新增并写入到storage', productsData);
  },


  // 保存产品数据到本地
  saveProductsLocal: function () {
    let that = this;
    let productsData = {products: that.globalData.products};
    wx.setStorageSync('product_data', productsData);
  },
  // 获取本地产品数据
  getProductsLocal: function (productId) {
    let productsLocal = wx.getStorageSync('product_data');
    for (let i = 0; i < productsLocal.length; i++) {
      if (productsLocal[i]._id == productId) {
        return productsLocal;
      }
    }
  },

  // 按照一定的规则计算快递费用
  getDeliveryPrice: function () {

  },
  globalData:{
    products: [],
    db:{},
    isConnected: true,
    launchOption: undefined,
    openid: null,

    mallName:"杨梅小店",
    shareProfile: '为您奉上最好的杨梅', // 首页转发的时候术语
    globalBGColor: '#fff',
    bgRed: 255,
    bgGreen: 255,
    bgBlue: 255,
  }
})
