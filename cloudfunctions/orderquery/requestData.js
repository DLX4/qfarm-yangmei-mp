function requestData(wechat, non_str, out_trade_no, sign) {
  var bodyData = '<xml>';
  bodyData += '<appid>' + wechat.appid + '</appid>';
  bodyData += '<mch_id>' + wechat.mch_id + '</mch_id>';
  bodyData += '<nonce_str>' + non_str + '</nonce_str>';
  bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>';
  bodyData += '<sign>' + sign.toUpperCase() + '</sign>';
  bodyData += '</xml>';
  return bodyData;
}

module.exports = requestData;