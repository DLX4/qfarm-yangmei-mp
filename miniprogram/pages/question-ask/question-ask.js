import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'

var dateUtil = require('../../utils/date.js')
const wxUploadFile = promisify(wx.uploadFile)
const db = wx.cloud.database()

Page({

  data: {
    titleCount: 0,
    contentCount: 0,
    title: '',
    content: '',
    images: []
  },

  onLoad(options) {
    $init(this)
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
    for(var i = 0; i < len ; i++)
    {
      console.log(i)
      wx.getFileSystemManager().readFile({
        filePath: that.data.images[i], //选择图片返回的相对路径
        encoding: 'base64', //编码格式
        success: res => { //成功的回调
          wx.cloud.callFunction({
            name:'fileupload',
            data:{
              path: 'pictures/' + dateUtil.vcode(new Date())+index+'.png',
              file: res.data
            },
            success(_res){

              console.log(_res)
              wx.hideLoading()
              //wx.hideLoading()
            },fail(_res){
              console.log(_res)
            }
          })
          index++;
        }
      })
    }
  }

})