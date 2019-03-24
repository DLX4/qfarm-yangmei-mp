let local = require('../utils/local.js');

// 购物车++
function addToTrolley(app, productId) {
  let numb = 0;
  for (let i = 0; i < app.globalData.products.length; i++) {
    if (app.globalData.products[i]._id === productId) {
      app.globalData.products[i].numb++;
    }
    numb += app.globalData.products[i].numb;
  }

  // 更新购物车红点提示
  wx.setTabBarBadge( {
      index: 1,
      text: numb + '',
    }
  );
  // 保存到本地
  local.saveProductsLocal({products: app.globalData.products});

  return app.globalData.products;
}

// 购物车--
function removeFromTrolley(app, productId) {
  let numb = 0;

  for (let i = 0; i < app.globalData.products.length; i++) {
    if (app.globalData.products[i]._id === productId) {
      app.globalData.products[i].numb--;
    }
    numb += app.globalData.products[i].numb;
  }

  // 更新购物车红点提示
  if (numb <= 0) {
    wx.removeTabBarBadge( {
        index: 1,
      }
    )
  } else {
    wx.setTabBarBadge( {
        index: 1,
        text: numb + '',
      }
    );
  }
  // 保存到本地
  local.saveProductsLocal({products: app.globalData.products});

  return app.globalData.products;

}

// 刷新购物车tab的红点消息
function refreshTrolleyBadge(app) {
  let numb = 0;
  for (let i = 0; i < app.globalData.products.length; i++) {
    numb += app.globalData.products[i].numb;
  }
  // 更新购物车红点提示
  if (numb > 0) {
    wx.setTabBarBadge( {
        index: 1,
        text: numb + '',
      }
    );
  }
}

// 购物车是否为空
function isTrolleyEmpty(app) {
  let numb = 0;
  for (let i = 0; i < app.globalData.products.length; i++) {
    numb += app.globalData.products[i].numb;
  }
  return numb === 0;
}

// 获取购物车信息
function getTrolley(app) {
  return app.globalData.products;
}

module.exports = {
  addToTrolley: addToTrolley,
  removeFromTrolley: removeFromTrolley,
  refreshTrolleyBadge: refreshTrolleyBadge,
  isTrolleyEmpty: isTrolleyEmpty,
  getTrolley: getTrolley
}
