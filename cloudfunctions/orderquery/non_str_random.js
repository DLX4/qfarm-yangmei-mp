function non_str() {
  var data = '';
  var chars = [
    '0', '1', '2', '4', '5', '6', '7', '8', '9',
    'Z','Y','X','W','V','U','T','S','R','Q','P','O','N','M','L','K','J','I','H','G','F','E','D','C','B','A'
  ];
  for (var i = 0; i < 32; i++) {
    var id = parseInt(Math.random() * (chars.length - 1));
    data += chars[id];
  }
  return data;
}

module.exports = non_str;