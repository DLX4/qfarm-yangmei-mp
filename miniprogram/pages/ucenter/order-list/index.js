var wxpay = require('../../../utils/pay.js')
var dateUtil = require('../../../utils/date.js')
var db = require('../../../utils/db.js')
var app = getApp()
Page({
  data: {
    tabs: ["待付款", "待发货", "待收货", "待评价", "已完成"],
    tabClass: ["", "", "", "", ""],
    stv: {
      windowWidth: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false
    },
    activeTab: 0,
    loadingStatus: false,
  },
  onLoad: function (options) {
    try {
      let { tabs } = this.data;
      var res = wx.getSystemInfoSync()
      this.windowWidth = res.windowWidth;
      this.data.stv.lineWidth = this.windowWidth / this.data.tabs.length;
      this.data.stv.windowWidth = res.windowWidth;
      this.tabsCount = tabs.length;
    } catch (e) {
    }
    // 获取订单列表
    this.setData({
      stv: this.data.stv,
      loadingStatus: true
    });
    this.getOrderList();
  },
  onReady: function () {
    // let that = this;
    // setTimeout(function() {
    //   that.setData({
    //     orderList: that.data.orderList,
    //     loadingStatus: false
    //   });
    //   //that._updateSelectedPage(0);
    // }, 400);

  },
  onShow: function () {
  },
  // 获取订单列表
  getOrderList: function () {
    let that = this;
    let orderDataList = new Array(5);

    db.getUserOrderList(app).then(data => {
      if (data.length > 0 ) {

        for (let i = 0; i < that.data.tabs.length; i++) {
          let tempList = [];
          for (let j = 0; j < data.length; j++) {
            if (data[j].status === i ) {
              tempList[tempList.length] = {
                createTime: dateUtil.getFormatDate(data[j].createTime),
                _id: data[j]._id,
                status: data[j].status,
                remark: data[j].remark,
                productList: data[j].productList,
                totalAmount: data[j].totalAmount
              };
            }
          }
          orderDataList[i] = { 'status': i, 'isnull': tempList.length === 0, 'orderList': tempList };
        }
      }
      this.setData({
        loadingStatus: false,
        orderList: orderDataList,
      })
    }, err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      });
    });
  },
  // 前端订单支付回调接口
  toPayTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    wxpay.wxpay(app, money, orderId, db, "/pages/ucenter/order-list/index");
  },

  orderDetail: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  },
  cancelOrderTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          wxpay.query(orderId);
          wx.hideLoading();
          //TODO-DLX
          // wx.request({
          //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/close',
          //   data: {
          //     token: wx.getStorageSync('token'),
          //     orderId: orderId
          //   },
          //   success: (res) => {
          //     wx.hideLoading();
          //     if (res.data.code == 0) {
          //       that.onShow();
          //     }
          //   }
          // })
        }
      }
    })
  },

  ////////
  handlerStart(e) {
    console.log('handlerStart')
    let { clientX, clientY } = e.touches[0];
    this.startX = clientX;
    this.tapStartX = clientX;
    this.tapStartY = clientY;
    this.data.stv.tStart = true;
    this.tapStartTime = e.timeStamp;
    this.setData({ stv: this.data.stv })
  },
  handlerMove(e) {
    console.log('handlerMove')
    let { clientX, clientY } = e.touches[0];
    let { stv } = this.data;
    let offsetX = this.startX - clientX;
    this.startX = clientX;
    stv.offset += offsetX;
    if (stv.offset <= 0) {
      stv.offset = 0;
    } else if (stv.offset >= stv.windowWidth * (this.tabsCount - 1)) {
      stv.offset = stv.windowWidth * (this.tabsCount - 1);
    }
    this.setData({ stv: stv });
  },
  handlerCancel(e) {

  },
  handlerEnd(e) {
    console.log('handlerEnd')
    let { clientX, clientY } = e.changedTouches[0];
    let endTime = e.timeStamp;
    let { tabs, stv, activeTab } = this.data;
    let { offset, windowWidth } = stv;
    //快速滑动
    if (endTime - this.tapStartTime <= 300) {
      console.log('快速滑动')
      //判断是否左右滑动(竖直方向滑动小于50)
      if (Math.abs(this.tapStartY - clientY) < 50) {
        //Y距离小于50 所以用户是左右滑动
        console.log('竖直滑动距离小于50')
        if (this.tapStartX - clientX > 5) {
          //向左滑动超过5个单位，activeTab增加
          console.log('向左滑动')
          if (activeTab < this.tabsCount - 1) {
            this.setData({ activeTab: ++activeTab })
          }
        } else if (clientX - this.tapStartX > 5) {
          //向右滑动超过5个单位，activeTab减少
          console.log('向右滑动')
          if (activeTab > 0) {
            this.setData({ activeTab: --activeTab })
          }
        }
        stv.offset = stv.windowWidth * activeTab;
      } else {
        //Y距离大于50 所以用户是上下滑动
        console.log('竖直滑动距离大于50')
        let page = Math.round(offset / windowWidth);
        if (activeTab != page) {
          this.setData({ activeTab: page })
        }
        stv.offset = stv.windowWidth * page;
      }
    } else {
      let page = Math.round(offset / windowWidth);
      if (activeTab != page) {
        this.setData({ activeTab: page })
      }
      stv.offset = stv.windowWidth * page;
    }
    stv.tStart = false;
    this.setData({ stv: this.data.stv })
  },
  //
  _updateSelectedPage(page) {
    //console.log('_updateSelectedPage')
    let { tabs, stv, activeTab } = this.data;
    activeTab = page;
    stv.offset = stv.windowWidth * activeTab;
    this.setData({
      activeTab: activeTab,
      stv: this.data.stv,
      orderList: this.data.orderList,
    });
  },
  // 用户点击订单页顶部tab切换
  handlerTabTap(e) {
    //console.log('handlerTapTap', this.data.orderList)
    this._updateSelectedPage(e.currentTarget.dataset.index);
  },
  //事件处理函数
  swiperchange: function (e) {
    //console.log('swiperCurrent',e.detail.current)
    let { tabs, stv, activeTab } = this.data;
    activeTab = e.detail.current;
    this.setData({ activeTab: activeTab })
    stv.offset = stv.windowWidth * activeTab;
    this.setData({ stv: this.data.stv })
  },
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/home/index"
    });
  },
})