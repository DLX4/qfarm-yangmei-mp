// 云函数入口文件
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')
cloud.init()

exports.main = async (event, context) => {

  try {
    return await cloud.uploadFile({
      cloudPath: event.path,
      fileContent: new Buffer(event.file, 'base64')
    })
  } catch (e) {
    console.log("上传文件错误" + e);
    return e;
  }
}