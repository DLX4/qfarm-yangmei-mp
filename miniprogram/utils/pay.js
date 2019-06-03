let tplmsg = require('../utils/tplmsg.js');
//let dateUtil = require('../utils/date.js');

// 微信支付查询接口
function queryMppay(orderId) {
  console.log("[微信支付订单查询]", orderId);

  let promise = new Promise((resolve, reject) => wx.cloud.callFunction({
    name: 'orderquery',
    data: {
      order_id: orderId,
    }
  }).then(res => {
    console.log('[云函数] [查询记录] [用户订单] 成功: ', res)
    resolve(res);
  }, err => {
    console.error('[云函数] [查询记录] [用户订单]失败：', err)
    reject({code: "FAIL", data: null});
  }));
  return promise;
}

// 微信支付统一下单接口
function wxpay(app, money, orderId, db, redirectUrl) {
  console.log("[订单支付]", orderId);
  wx.cloud.callFunction({
    name: 'mppay',
    data: {
      openid: wx.getStorageSync('openid'),
      //total_fee: money * 100,
      total_fee: 1,
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
          wx.showToast({title: '支付失败'});
        },
        success: function () {
          wx.showToast({title: '支付成功'});
          let prepayId = res.result.data.package.slice('prepay_id='.length);

          wx.showLoading();

          setTimeout(() => {
            // 查询支付结果
            queryMppay(orderId).then(queryRes => {
              //console.log("#########：" + JSON.stringify(res));
              let data = queryRes.result.data;
              // 查询并更新订单状态
              if (data.result_code === "SUCCESS"
                && data.trade_state === "SUCCESS" ) {
                // 保存prepayId到订单表中
                db.setOrderPaid(app, orderId, data, prepayId);
                //console.log("订单支付成功" + res)
              }

              // 发送模板消息

              tplmsg.sendMessageForPaid(
                prepayId,
                queryRes.result.data.out_trade_no,
                money,
                queryRes.result.data.time_end).then( res => {


              }, err => {

              });

              // 跳转回订单页
              wx.hideLoading();
              wx.redirectTo({
                url: redirectUrl // 一般跳转到订单列表页 "/pages/order-list/index"
              });
            }, err => {
              // 再次尝试TODO
              wx.hideLoading();
              wx.showToast({title: '支付失败'});
            });
          }, 1000);
        }
      })
    }
  });
}


module.exports = {
  wxpay: wxpay,
  query: queryMppay
}
