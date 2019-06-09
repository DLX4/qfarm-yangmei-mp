
// 保存产品数据到本地
function saveProductsLocal (productsData) {
  wx.setStorageSync('product_data', productsData);
}
// 删除本地产品数据
function clearProductLocal () {
  wx.removeStorageSync('product_data');
}
// 从本地产品数据
function getProductsLocal () {
  return wx.getStorageSync('product_data');
}
// 从本地获取openid
function getProductsLocal() {
  return wx.getStorageSync('product_data');
} 

module.exports = {
  saveProductsLocal: saveProductsLocal,
  getProductsLocal: getProductsLocal,
  clearProductLocal: clearProductLocal
};