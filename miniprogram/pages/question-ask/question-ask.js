import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'

var app = getApp();
var db = require('../../utils/db.js')
var dateUtil = require('../../utils/date.js')
const wxUploadFile = promisify(wx.uploadFile)
//const db = wx.cloud.database()

Page({

  data: {
    userinfo:null,
    titleCount: 0,
    contentCount: 0,
    title: '',
    content: '',
    images: []
  },

  onLoad(options) {
    let that = this;
    $init(this);
    db.getUserInfo(app).then(res => {
      if (res.length > 0) {
        console.log("获取用户头像，昵称信息==>" + JSON.stringify(res[0]));
        that.setData({
          userinfo: res[0]
        });
      }
    })
  },

  // 获取用户头像昵称相关信息
  onGotUserInfo: function (e) {
    var that = this;

    // console.log(e.detail.userInfo);
    // console.log("nickname=" + e.detail.userInfo.nickName);
    db.saveUserInfo(app, e.detail.userInfo);
    that.setData({
      userinfo: e.detail.userInfo
    })
  },
  
  handleTitleInput(e) {
    const value = e.detail.value
    this.data.title = value
    this.data.titleCount = value.length
    $digest(this)
  },

  handleContentInput(e) {
    const value = e.detail.value
    this.data.content = value
    this.data.contentCount = value.length
    $digest(this)
  },

  chooseImage(e) {
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const images = this.data.images.concat(res.tempFilePaths)
        this.data.images = images.length <= 3 ? images : images.slice(0, 3)
        $digest(this)
      }
    })
  },

  removeImage(e) {
    const idx = e.target.dataset.idx
    this.data.images.splice(idx, 1)
    $digest(this)
  },

  handleImagePreview(e) {
    const idx = e.target.dataset.idx
    const images = this.data.images

    wx.previewImage({
      current: images[idx],
      urls: images,
    })
  },

  submitForm(e) {
    var that = this;
    var index = 0;
    var len = that.data.images.length;
    wx.showLoading({
      title: '上传中...',
    })
    let pictures = [];
    for(var i = 0; i < len ; i++)
    {
      console.log(i)
      wx.getFileSystemManager().readFile({
        filePath: that.data.images[i], //选择图片返回的相对路径
        encoding: 'base64', //编码格式
        success: res => { //成功的回调
          
          let picturePath = 'pictures/' + dateUtil.vcode(new Date()) + index + '.png';
          wx.cloud.callFunction({
            name:'fileupload',
            data:{
              path: picturePath,
              file: res.data
            },
            success(_res){
              console.log(_res)
              pictures.push('https://7166-qfarm-mp-test-8ef757-1258810866.tcb.qcloud.la/' + picturePath);
              index++;
              if (index === len) {
                // 保存一条动态
                let post = {
                  avatarUrl: that.data.userinfo.avatarUrl,
                  nickName: that.data.userinfo.nickName,
                  pictures: pictures,
                  content: that.data.content,
                  isDisable: false,
                  createTime: dateUtil.getNowFormatDate(),
                };
                
                
                console.log("保存一条动态");
                db.saveMeiyouPost(app, post).then(res => {
                  wx.hideLoading();
                  wx.navigateTo({
                    url: "/pages/circle-friends/circle-friends"
                  })
                });
                
              }
            },fail(_res){
              console.log(_res)
            }
          })
          
        }
      })
    }
  }

})