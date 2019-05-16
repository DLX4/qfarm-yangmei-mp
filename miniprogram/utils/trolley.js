let local = require('../utils/local.js');

// 购物车++
function addToTrolley(app, productId) {
  let numb = 0;
  for (let i = 0; i < app.globalData.products.length; i++) {
    if (app.globalData.products[i]._id === productId) {
      app.globalData.products[i].numb++;
      // 添加到购物车之后默认是选中的状态
      app.globalData.products[i].active = true;
    }
    if (numb + app.globalData.products[i].numb <= 99) {
      numb += app.globalData.products[i].numb;
    } else {
      console.info("购物车商品件数最大为99件");
      return;
    }

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
    if (app.globalData.products[i]._id === productId ) {
      if (app.globalData.products[i].numb > 0) {
        app.globalData.products[i].numb--;
      } else {
        // 避免由于界面刷新滞后导致数量较少到负数
        return ;
      }
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

// 选中某条购物车记录
function selectTrolleyItem(app, productId) {
  for (let i = 0; i < app.globalData.products.length; i++) {
    if (app.globalData.products[i]._id === productId) {
      // 此处断言：active属性的值必然是true 或者 false
      app.globalData.products[i].active = !app.globalData.products[i].active;
    }
  }
  // 保存到本地
  local.saveProductsLocal({products: app.globalData.products});

  return app.globalData.products;
}

// 选中全部购物车记录
function selectAllTrolleyItem(app) {
  for (let i = 0; i < app.globalData.products.length; i++) {
    // 此处断言：active属性的值必然是true 或者 false
    app.globalData.products[i].active = !app.globalData.products[i].active;
  }
  // 保存到本地
  local.saveProductsLocal({products: app.globalData.products});

  return app.globalData.products;
}

// 购物车中选中的商品总额结算
function sumSelectTrolley(app) {
  let sum = 0.00;
  for (let i = 0; i < app.globalData.products.length; i++) {
    // 此处断言：active属性的值必然是true 或者 false
    if (app.globalData.products[i].active) {
      sum += parseFloat(app.globalData.products[i].salePrice) * app.globalData.products[i].numb;
    }
  }
  return parseFloat(sum);
}

// 保存购物车中选中的要支付的商品信息
function saveSelectTrolleyToPay(app) {
  app.globalData.productsToPay = [];
  for (let i = 0; i < app.globalData.products.length; i++) {
    // 此处断言：active属性的值必然是true 或者 false
    if (app.globalData.products[i].active) {
      app.globalData.productsToPay.push(app.globalData.products[i]);
    }
  }
  console.log("[购物车==> 下单收银台][productsToPay]:" + app.globalData.productsToPay);
  for (let i = 0; i < app.globalData.productsToPay.length; i++) {
    console.log(app.globalData.productsToPay[i]._id);
  }
}

// 读取要支付的商品信息
function getSelectTrolleyToPay(app) {
  return app.globalData.productsToPay;
}

// 删除已经提交订单的商品信息
function deleteTrolleyForOrder(app) {
  for (let i = 0; i < app.globalData.productsToPay.length; i++) {
    app.globalData.productsToPay[i].active = false;
  }
}

module.exports = {
  addToTrolley: addToTrolley,
  removeFromTrolley: removeFromTrolley,
  refreshTrolleyBadge: refreshTrolleyBadge,
  isTrolleyEmpty: isTrolleyEmpty,
  getTrolley: getTrolley,
  selectTrolleyItem: selectTrolleyItem,
  selectAllTrolleyItem: selectAllTrolleyItem,
  sumSelectTrolley: sumSelectTrolley,
  saveSelectTrolleyToPay: saveSelectTrolleyToPay,
  getSelectTrolleyToPay: getSelectTrolleyToPay,
  deleteTrolleyForOrder: deleteTrolleyForOrder
}
