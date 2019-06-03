var config = require('./tplId.js');
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  if (event.orderStatus === 1) {
    console.log("支付成功模版消息推送")
    try {
      const sendResult = await cloud.openapi.templateMessage.send({
        touser: cloud.getWXContext().OPENID,
        templateId: config.PAID_TPL_ID,
        formId: event.prepayId,
        page: 'pages/home/index',
        data: {
          keyword1: {
            value: event.orderId,
          },
          keyword2: {
            value: event.productName,
          },
          keyword3: {
            value: event.cashFee,
          },
          keyword4: {
            value: event.payTime,
          },
          keyword5: {
            value: '待发货',
          },
        }
      })
      console.log("模板消息发送成功：" + sendResult);
      return sendResult;
    } catch (err) {
      throw err;
    }
  }
}
