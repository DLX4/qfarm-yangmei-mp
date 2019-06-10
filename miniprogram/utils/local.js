
// 保存产品数据到本地
function saveProductsLocal (productsData) {
  wx.setStorageSync('product_data', productsData);
}

// 从本地产品数据
function getProductsLocal () {
  return wx.getStorageSync('product_data');
}

module.exports = {
  saveProductsLocal: saveProductsLocal,
  getProductsLocal: getProductsLocal
};