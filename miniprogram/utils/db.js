// 查询用户的地址
function getUserAddress(app) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('user_address').where({
    _openid: app.globalData.openid,
  }).get().then(res => {
    console.log('[数据库] [查询记录] 成功: ', res)
    resolve(res.data);
  }, err => {
    console.error('[数据库] [查询记录] 失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

// 查询用户的地址
function getUserAddressByKey(app, id) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('user_address').where({
    _openid: app.globalData.openid,
    _id: id
  }).get().then(res => {
    console.log('[数据库] [查询记录] 成功: ', res)
    resolve(res.data);
  }, err => {
    console.error('[数据库] [查询记录] 失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

// 查询用户的默认地址
function getDefaultUserAddress(app) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) =>  getUserAddress(app).then(result => {
    // 如果有default的地址就返回，否则返回地址列表
    for (let i = 0; i < result.length; i++) {
      if (result[i].isDefault) {
        console.log('[数据库] [查询记录default] 成功: ', result[i]);
        resolve([result[i]]);
        return;
      }
    }
    resolve(result);
  }, err => {
    console.error('[数据库] [查询记录] 失败：', err)
    reject({code: "FAIL", data: null});
  }));
  return promise;
}

// 保存用户的地址
function saveUserAddress(app, userAddress) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('user_address').add({
    data: userAddress,
  }).then(res => {
    console.log('[数据库] [新增记录] [保存用户的地址] 成功，记录 _id: ', res._id);
    resolve(res);
  }, err => {
    console.error('[数据库] [新增记录] [保存用户的地址] 失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

// 更新用户的地址
function updateUserAddress(app, userAddress) {
  let db = app.globalData.db;
  let id = String(userAddress._id);
  delete userAddress._openid;
  delete userAddress._id;
  let promise = new Promise((resolve, reject) => db.collection('user_address').doc(id).set({
    data: userAddress,
  }).then(res => {
    console.log('[数据库] [更新记录] [更新用户的地址] 成功，记录 _id: ', res._id);
    resolve(res);
  }, err => {
    console.error('[数据库] [更新记录] [更新用户的地址] 失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

// 保存用户订单
function saveOrder(app, order) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('order').add({
    data: order,
  }).then(res => {
    console.log('[数据库] [新增记录] [创建订单] 成功，记录 _id: ', res._id);
    resolve(res._id);
  }, err => {
    console.error('[数据库] [新增记录] [创建订单] 失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

// 查询用户订单
function getUserOrderList(app) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('order').where({
    _openid: app.globalData.openid,
  }).get().then(res => {
    console.log('[数据库] [查询记录] [用户订单] 成功: ', res)
    resolve(res.data);
  }, err => {
    console.error('[数据库] [查询记录] [用户订单]失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

// 获取产品信息
function getProducts(app) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('products').where({
    disable: false,
  })
    .orderBy('sort', 'asc')
    .get()
    .then(res => {
    console.log('[数据库] [查询记录] [产品信息] 成功: ', res)
    resolve(res.data);
  }, err => {
    console.error('[数据库] [查询记录] [产品信息]失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

module.exports = {
  getUserAddress: getUserAddress,
  getDefaultUserAddress: getDefaultUserAddress,
  getUserAddressByKey: getUserAddressByKey,
  updateUserAddress: updateUserAddress,
  saveOrder: saveOrder,
  saveUserAddress: saveUserAddress,
  getUserOrderList: getUserOrderList,
  getProducts: getProducts
};