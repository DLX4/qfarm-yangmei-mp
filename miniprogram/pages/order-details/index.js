var db = require('../../utils/db.js')

var app = getApp();
Page({
  data: {
    order: 0,
    statusSteps:[]
  },
  onLoad: function (e) {
    let that = this;
    var orderId = e.id;

    db.getUserOrderByKey(app, orderId).then(result => {
      if (result !== undefined && result.length > 0) {
        that.data.order = result[0];
      }
      that.setData({
        order: that.data.order
      });
      that.updateStatusSteps(that.data.order);
    }, error => {
      that.data.order = {};
    });
  },
  onShow: function (orderId) {
    let that = this;
    if (orderId !== undefined) {
      db.getUserOrderByKey(app, orderId).then(result => {
        if (result !== undefined && result.length > 0) {
          that.data.order = result[0];
        }
        that.setData({
          order: that.data.order
        });
        that.updateStatusSteps(that.data.order);
      }, error => {
        that.data.order = {};
      });
    }
  },
  expressDetailsTap: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/wuliu/index?id=" + orderId
    })
  },
  // 确认收货
  confirmBtnTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认您已收到商品？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          db.setOrderDeliveryReceived (app, orderId).then( res => {
            db.getUserOrderByKey(app, orderId).then(result => {
              if (result !== undefined && result.length > 0) {
                that.data.order = result[0];
              }
              that.setData({
                order: that.data.order
              });
              that.updateStatusSteps(that.data.order);
              wx.hideLoading();
            }, error => {
              that.data.order = {};
            });
          }, err => {
            wx.showToast({title: '操作失败，请重试'});
          })
        }
      }
    })
  },
  // 提交评价信息
  submitPrise: function (e) {
    //console.log("submitPraise: " + JSON.stringify(e))
    let that = this;
    let orderId = this.data.order._id;
    let i = 0;
    let praiseCnt = 0;

    wx.showLoading();
    for (i = 0; e.detail.value["orderProductId" + i] !== undefined; i++) {
      let praise = {};
      praise.orderId = orderId;
      praise.orderProductId = e.detail.value["orderProductId" + i];
      praise.productPraiseLevel = e.detail.value["productPraiseLevel" + i];
      praise.productPraiseRemark = e.detail.value["productPraiseRemark" + i];

      db.saveUserPraise(app, praise).then(result => {
        if (++praiseCnt === i) {// 订单状态修改为已经评价，只提交一次
          db.setOrderPraised(app, orderId).then( res => {
            db.getUserOrderByKey(app, orderId).then(result => {
              if (result !== undefined && result.length > 0) {
                that.data.order = result[0];
              }
              that.setData({
                order: that.data.order
              });
              that.updateStatusSteps(that.data.order);
              wx.hideLoading();
              wx.showToast({title: '评价成功'});
            }, error => {
              that.data.order = {};
              wx.hideLoading();
            });
          }, err => {
            wx.showToast({title: '评价失败'});
            wx.hideLoading();
          });
        }
      }, err => {
        wx.showToast({title: '评价失败'});
        wx.hideLoading();
      });
    }
  },

  // 订单状态流程图
  updateStatusSteps: function (order) {
    var that = this;
    if (order.status === 0) {
      that.setData({
        statusSteps: [
          {
            current: true,
            done: false,
            text: '待支付',
            desc: '等待中...'
          },
          {
            current: false,
            done: false,
            text: '待发货',
            desc: ''
          },
          {
            current: false,
            done: false,
            text: '待收货',
            desc: ''
          },
          {
            current: false,
            done: false,
            text: '待评价',
            desc: ''
          },
          {
            current: false,
            done: false,
            text: '已完成',
            desc: ''
          }
        ]
      })
    } else if (order.status === 1) {
      that.setData({
        statusSteps: [
          {
            current: false,
            done: true,
            text: '待支付',
            desc: '成功'
          },
          {
            current: true,
            done: false,
            text: '待发货',
            desc: '等待中...'
          },
          {
            current: false,
            done: false,
            text: '待收货',
            desc: ''
          },
          {
            current: false,
            done: false,
            text: '待评价',
            desc: ''
          },
          {
            current: false,
            done: false,
            text: '已完成',
            desc: ''
          }
        ]
      })
    } else if (order.status === 2) {
      that.setData({
        statusSteps: [
          {
            current: false,
            done: true,
            text: '待支付',
            desc: '成功'
          },
          {
            current: false,
            done: true,
            text: '待发货',
            desc: '成功'
          },
          {
            current: true,
            done: false,
            text: '待收货',
            desc: '等待中...'
          },
          {
            current: false,
            done: false,
            text: '待评价',
            desc: ''
          },
          {
            current: false,
            done: false,
            text: '已完成',
            desc: ''
          }
        ]
      })
    } else if (order.status === 3) {
      that.setData({
        statusSteps: [
          {
            current: false,
            done: true,
            text: '待支付',
            desc: '成功'
          },
          {
            current: false,
            done: true,
            text: '待发货',
            desc: '成功'
          },
          {
            current: false,
            done: true,
            text: '待收货',
            desc: '成功'
          },
          {
            current: true,
            done: false,
            text: '待评价',
            desc: '等待中...'
          },
          {
            current: false,
            done: false,
            text: '已完成',
            desc: ''
          }
        ]
      })
    } else if (order.status === 4) {
      that.setData({
        statusSteps: [
          {
            current: false,
            done: true,
            text: '待支付',
            desc: '成功'
          },
          {
            current: false,
            done: true,
            text: '待发货',
            desc: '成功'
          },
          {
            current: false,
            done: true,
            text: '待收货',
            desc: '成功'
          },
          {
            current: false,
            done: true,
            text: '待评价',
            desc: '成功'
          },
          {
            current: true,
            done: true,
            text: '已完成',
            desc: ''//that.order.praiseTime
          }
        ]
      })
    }

  }
})