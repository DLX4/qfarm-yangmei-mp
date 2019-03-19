function wxpay(app, money, orderId, redirectUrl) {
  console.log("[订单支付]", orderId);
  wx.cloud.callFunction({
    name: 'mppay',
    data: {
      openid: wx.getStorageSync('openid'),
      total_fee: money * 100,
      order_id: orderId,
      body: "新鲜杨梅"
    },
    complete: res => {
      console.log("[微信支付统一下单云函数]", res);
      wx.requestPayment({
        timeStamp: res.result.data.timeStamp,
        nonceStr: res.result.data.nonceStr,
        package: res.result.data.package,
        signType: 'MD5',
        paySign: res.result.data.paySign,
        fail: function () {
          wx.showToast({title: '支付失败'})
        },
        success: function () {
          wx.showToast({title: '支付成功'});
          wx.redirectTo({
            url: redirectUrl // 一般跳转到订单列表页 "/pages/order-list/index"
          });
        }
      })
    }
  });
}

module.exports = {
  wxpay: wxpay
}
