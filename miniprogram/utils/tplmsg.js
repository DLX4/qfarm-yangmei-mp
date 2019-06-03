// 模板消息发送接口 （支付成功时）
function sendMessageForPaid(prepayId, orderId, cashFee, payTime) {
  console.log("[微信支付订单查询]", orderId);

  let promise = new Promise((resolve, reject) => wx.cloud.callFunction({
    name: 'tplmsg',
    data: {
      orderStatus: 1,
      prepayId: prepayId,
      orderId: orderId,
      productName: '勤富农场杨梅',
      cashFee: cashFee,
      payTime: payTime,
    }
  }).then(res => {
    console.log('[云函数] [模板消息发送] [支付成功] 成功: ', res)
    resolve(res);
  }, err => {
    console.error('[云函数] [模板消息发送] [支付成功] 失败：', err)
    reject({code: "FAIL", data: null});
  }));
  return promise;
}


module.exports = {
  sendMessageForPaid: sendMessageForPaid,
}
