function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  var hour = date.getHours();
  var min = date.getMinutes();
  var second = date.getSeconds();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  if (hour >= 0 && hour <= 9) {
    hour = "0" + hour;
  }
  if (min >= 0 && min <= 9) {
    min = "0" + min;
  }
  if (second >= 0 && second <= 9) {
    second = "0" + second;
  }

  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + hour + seperator2 + min
    + seperator2 + second;
  return currentdate;
}

function getFormatDate(date) {
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  var hour = date.getHours();
  var min = date.getMinutes();
  var second = date.getSeconds();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  if (hour >= 0 && hour <= 9) {
    hour = "0" + hour;
  }
  if (min >= 0 && min <= 9) {
    min = "0" + min;
  }
  if (second >= 0 && second <= 9) {
    second = "0" + second;
  }

  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + hour + seperator2 + min
    + seperator2 + second;
  return currentdate;
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function vcode(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('_')  + '_'+[hour, minute, second].map(formatNumber).join('_')
}
module.exports = {
  getNowFormatDate: getNowFormatDate,
  getFormatDate: getFormatDate,
  vcode: vcode
}
