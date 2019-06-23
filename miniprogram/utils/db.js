
// 获取梅友圈点赞信息
function getMeiyouZan(app, postid) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('post_zan').where({
    postid: postid,
  }).get().then(res => {
    console.log('[数据库] [查询记录] 成功: ', res)
    resolve(res.data);
  }, err => {
    console.error('[数据库] [查询记录] 失败：', err)
    reject({ code: "FAIL", data: null });
  }));

  return promise;
}
// 保存梅友圈点赞信息
function saveMeiyouZan(app, postid) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => getUserInfo(app).then(resUser => {
    getMeiyouZan(app, postid).then(res => {

      let zaned = false;// 已经点赞过了
      for (let i = 0; i < res.length; i++) {
        if (res[i]._openid === app.globalData.openid) {
          zaned = true;
        }
      }

      if (zaned === false) {
        db.collection('post_zan').add({
          data: {
            nickName: resUser[0].nickName,
            postid: postid
          },
        }).then(res => {
          console.log('[数据库] [新增记录] [保存梅友圈点赞信息] 成功，记录 _id: ', res._id);
          resolve(res);
        }, err => {
          console.error('[数据库] [新增记录] [保存梅友圈点赞信息] 失败：', err)
          reject({ code: "FAIL", data: null });
        });
      }
    })
  }));

  return promise;
}

// 保存朋友圈信息
function saveMeiyouPost(app, post) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('post').add({
    data: post,
  }).then(res => {
    console.log('[数据库] [新增记录] [保存朋友圈信息] 成功，记录 _id: ', res._id);
    resolve(res);
  }, err => {
    console.error('[数据库] [新增记录] [保存朋友圈信息] 失败：', err)
    reject({ code: "FAIL", data: null });
  }));

  return promise;
}

// 查询朋友圈信息
function getMeiyouPost(app) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('post').orderBy('createTime', 'desc').where({
    isDisable: false,
  }).get().then(res => {
    console.log('[数据库] [查询记录] 成功: ', res)
    resolve(res.data);
  }, err => {
    console.error('[数据库] [查询记录] 失败：', err)
    reject({ code: "FAIL", data: null });
  }));

  return promise;
}
// 分页查询梅友圈信息，默认一页5条记录
function getMeiyouPostByPage(app, pageNum) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('post').orderBy('createTime', 'desc').where({
    isDisable: false,
  }).skip(pageNum * 5)
    .limit(5)
    .get().then(res => {
    console.log('[数据库] [查询记录] 成功: ', res)
    resolve(res.data);
  }, err => {
    console.error('[数据库] [查询记录] 失败：', err)
    reject({ code: "FAIL", data: null });
  }));

  return promise;
}

// 保存用户信息
function saveUserInfo(app, userInfo) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('userinfo').add({
    data: userInfo,
  }).then(res => {
    console.log('[数据库] [新增记录] [保存用户信息] 成功，记录 _id: ', res._id);
    resolve(res);
  }, err => {
    console.error('[数据库] [新增记录] [保存用户信息] 失败：', err)
    reject({ code: "FAIL", data: null });
  }));

  return promise;
}

// 查询用户信息
function getUserInfo(app) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('userinfo').where({
    _openid: app.globalData.openid,
  }).get().then(res => {
    console.log('[数据库] [查询记录] 成功: ', res)
    resolve(res.data);
  }, err => {
    console.error('[数据库] [查询记录] 失败：', err)
    reject({ code: "FAIL", data: null });
  }));

  return promise;
}

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
  let promise = new Promise((resolve, reject) => db.collection('user_address').doc(id).set({// 注意这里是替换更新
    data: userAddress,
  }).then(res => {
    console.log('[数据库] [更新记录] [更新用户的地址] 成功，记录 _id: ', res._id);
    resolve(res);
  }, err => {
    console.error('[数据库] [更新记录] [更新用户的地址] 失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;lis
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

// 更新用户订单-支付状态
function setOrderPaid(app, orderId, detail, prepayId) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('order').doc(orderId).update({
    data: {
      prepayId: prepayId,
      isPaid: true,
      payTime: new Date(),
      payDetail: detail,
      status : 1 // 已支付（待发货）
    },
  }).then(res => {
    console.log('[数据库] [更新支付订单] 成功，记录 _id: ', orderId);
    resolve(res._id);
  }, err => {
    console.error('[数据库] [更新支付订单] 失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

// 更新用户订单-取消订单状态
function setOrderCanceled(app, orderId) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('order').doc(orderId).update({
    data: {
      isCanceled: true,
      cancelTime: new Date(),
      status : -1 // 已取消
    },
  }).then(res => {
    console.log('[数据库] [更新取消订单] 成功，记录 _id: ', orderId);
    resolve(res._id);
  }, err => {
    console.error('[数据库] [更新取消订单] 失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

// 更新用户订单-确认收货
function setOrderDeliveryReceived(app, orderId) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('order').doc(orderId).update({
    data: {
      isReceived: true,
      receiveTime: new Date(),
      status : 3 // 已经确认收货
    },
  }).then(res => {
    console.log('[数据库] [更新订单确认收货] 成功，记录 _id: ', orderId);
    resolve(res._id);
  }, err => {
    console.error('[数据库] [更新订单确认收货] 失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

// 更新用户订单-已经提交评价
function setOrderPraised(app, orderId) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('order').doc(orderId).update({
    data: {
      isPraised: true,
      praiseTime: new Date(),
      status : 4 // 已经提交评价
    },
  }).then(res => {
    console.log('[数据库] [更新订单已评价状态] 成功，记录 _id: ', orderId);
    resolve(res._id);
  }, err => {
    console.error('[数据库] [更新订单已评价状态] 失败：', err)
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

// 根据订单号查询订单
function getUserOrderByKey(app, orderId) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('order').where({
    _openid: app.globalData.openid,
    _id: orderId
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

// 保存用户订单的评价信息
function saveUserPraise(app, praise) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('praise').add({
    data: praise,
  }).then(res => {
    console.log('[数据库] [新增评价] 成功，记录 _id: ', res._id);
    resolve(res);
  }, err => {
    console.error('[数据库] [新增评价] 失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

// 根据订单号获取快递信息
function getExpressByOrderId(app, orderid) {
  let db = app.globalData.db;

  let promise = new Promise((resolve, reject) => db.collection('express').where({
    orderid: orderid
  }).get().then(res => {
    console.log('[数据库] [查询记录] [快递信息] 成功: ', res)
    resolve(res.data);
  }, err => {
    console.error('[数据库] [查询记录] [快递信息]失败：', err)
    reject({code: "FAIL", data: null});
  }));

  return promise;
}

module.exports = {
  getMeiyouZan: getMeiyouZan,
  saveMeiyouZan: saveMeiyouZan,
  saveMeiyouPost: saveMeiyouPost,
  getMeiyouPost: getMeiyouPost,
  getMeiyouPostByPage: getMeiyouPostByPage,
  saveUserInfo: saveUserInfo,
  getUserInfo: getUserInfo,
  getUserAddress: getUserAddress,
  getDefaultUserAddress: getDefaultUserAddress,
  getUserAddressByKey: getUserAddressByKey,
  updateUserAddress: updateUserAddress,
  saveOrder: saveOrder,
  setOrderPaid: setOrderPaid,
  setOrderDeliveryReceived: setOrderDeliveryReceived,
  setOrderPraised: setOrderPraised,
  setOrderCanceled: setOrderCanceled,
  getUserOrderByKey: getUserOrderByKey,
  saveUserAddress: saveUserAddress,
  getUserOrderList: getUserOrderList,
  getProducts: getProducts,
  saveUserPraise: saveUserPraise,
  getExpressByOrderId: getExpressByOrderId
};