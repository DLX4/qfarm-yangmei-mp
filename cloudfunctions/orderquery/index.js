var wechat = require('./wechat_config.js');
var request_data = require('./requestData.js');
var non_str_random = require('./non_str_random.js');
var cryptoMO = require('crypto');
var request = require('request');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray: false, ignoreAttrs: true})
var non_str = non_str_random();

exports.main = async (event, context) => {
  console.log(event);
  console.log(context);
  var out_trade_no = event.order_id;

  var str = `appid=${wechat.appid}&mch_id=${wechat.mch_id}&nonce_str=${non_str}&out_trade_no=${out_trade_no}&key=${wechat.key}`;
  var sign = cryptoMO.createHash('md5').update(str).digest('hex');
  var temp_request_data = request_data(wechat, non_str, out_trade_no , sign);
  console.log('temp_request_data', temp_request_data);

  return new Promise((resolve, reject) => request({
    url: wechat.url,
    method: 'POST',
    body: temp_request_data
  }, (err, res, body) => {
    xmlParser.parseString(body, (err, res) => {
      console.log('[微信支付查询订单状态]', res.xml);
      return resolve({
        data: res.xml
      });
    })
  }))

}
