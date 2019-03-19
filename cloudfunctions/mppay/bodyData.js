function bodyData(wechat, payBody, non_str, openid, out_trade_no, total_fee, sign) {
  var bodyData = '<xml>';
  bodyData += '<appid>' + wechat.appid + '</appid>';
  bodyData += '<body>' + payBody + '</body>';
  bodyData += '<mch_id>' + wechat.mch_id + '</mch_id>';
  bodyData += '<nonce_str>' + non_str + '</nonce_str>';
  bodyData += '<openid>' + openid + '</openid>';
  bodyData += '<notify_url>' + wechat.notify_url + '</notify_url>';
  bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>';
  bodyData += '<spbill_create_ip>' + wechat.ip + '</spbill_create_ip>';
  bodyData += '<total_fee>' + total_fee + '</total_fee>';
  bodyData += '<trade_type>JSAPI</trade_type>';
  bodyData += '<sign>' + sign.toUpperCase() + '</sign>';
  bodyData += '</xml>';
  return bodyData;
}

module.exports = bodyData;