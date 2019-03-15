//app.js
var starscore = require("./templates/starscore/starscore.js");
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

    // 获取商城数据（关键，配置相关，如商品价格，优惠信息）
    wx.cloud.init();
    that.globalData.db = wx.cloud.database();
    that.getProducts(0);
    wx.setStorageSync('mallName', that.globalData.mallName);
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
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        that.globalData.openid = res.result.openid
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

  sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString, emphasis_keyword){
    var that = this;
    //TODO-DLX
    // wx.request({
    //   url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
    //   method:'POST',
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   data: {
    //     token: wx.getStorageSync('token'), //登录接口返回的登录凭证
    //     type: 0, //0 小程序 1 服务号
    //     module: 'order', //所属模块：immediately 立即发送模板消息；order 所属订单模块
    //     business_id: orderId, //登录接口返回的登录凭证
    //     trigger: trigger, //module不为immediately时必填，代表对应的【订单】触发的状态
    //     template_id: template_id, //模板消息ID
    //     form_id: form_id, //type=0时必填，表单提交场景下，为 submit 事件带上的 formId；支付场景下，为本次支付的 prepay_id
    //     url: page, //小程序：点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）；服务号：跳转的网页地址
    //     postJsonString: postJsonString, //模板消息内容
    //     emphasis_keyword: emphasis_keyword //小程序："keyword1.DATA" 模板需要放大的关键词，不填则默认无放大
    //   },
    //   success: (res) => {
    //     //console.log(res.data);
    //   }
    // })
  },
  getProducts: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    console.log("[load页]获取所有产品信息");
    var that = this;
    var db = that.globalData.db;
    db.collection('products').where({
      disable: false,
      // recommend: true,
    })
      .orderBy('sort', 'asc')
      .get({
        success(res) {
          // res.data 是包含以上定义的两条记录的数组
          that.globalData.products = [];
          if (res.data.length == 0) {
            return;
          }
          for (let i = 0; i < res.data.length; i++) {
            let temp = res.data[i];
            temp.salePrice = temp.salePrice.toFixed(2);
            temp.originPrice = temp.originPrice.toFixed(2);
            temp.starpic = starscore.picStr(temp.starScore);
            that.globalData.products.push(temp);
          }

          console.log(that.globalData.products);
        }
      });
  },
  // 按照一定的规则计算快递费用
  getDeliveryPrice: function () {

  },
  globalData:{
    page: 1, //初始加载商品时的页面号
    pageSize: 10000, //初始加载时的商品数，设置为10000保证小商户能加载完全部商品
    categories: [],
    products: [],
    hotGoods: ['桔', '火龙果', '香蕉', '酸奶', '甘蔗'], //自定义热门搜索商品
    goodsName: [],
    goodsList: [],
    onLoadStatus: true,
    activeCategoryId: null,

    globalBGColor: '#f00056',
    bgRed: 240,
    bgGreen: 0,
    bgBlue: 86,
    userInfo: null,
    subDomain: "tggtest",// 商城后台个性域名tgg
    version: "2.0.6",
    shareProfile: '   一流的服务，做超新鲜的水果', // 首页转发的时候术语

    db:{},
    mallName:"杨梅小店",
    env: 'qfarm-mp-test',
    isConnected: true,
    launchOption: undefined,
    openid: null
  }
  // 根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒
})
