// pages/CircleFriends/CircleFriends.js
var app = getApp()
var db = require('../../utils/db.js')
var date = require('../../utils/date.js')
var that

Page({
  /**
   * 页面的初始数据
   */
  data: {
    myOpenId: app.globalData.openid,
    userinfo: null,
    posts: [],
    postsMap: [],
    loadingMore: false,
    currentPage: 0,
    isEnd: false,
    // DataSource: [1, 1, 1, 1, 1],
    // icon: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3175633703,3855171020&fm=27&gp=0.jpg',
    // content: '我大学毕业到一家集团公司的办公室当文员。办公室主任有一特长，即文章写得好，很有思想，公司董事长很器重他，董事长的讲话稿和企业的年终总结等一系列重大文章都是出自他的手笔。',
    // resource: ['http://img2.imgtn.bdimg.com/it/u=2118739199,3378602431&fm=27&gp=0.jpg',
    //   'http://img0.imgtn.bdimg.com/it/u=2277942808,1417432970&fm=27&gp=0.jpg',
    //   'http://img5.imgtn.bdimg.com/it/u=1504812505,3480403568&fm=27&gp=0.jpg',
    //   'http://img4.imgtn.bdimg.com/it/u=3456219059,4251129897&fm=27&gp=0.jpg',
    //   'http://img3.imgtn.bdimg.com/it/u=3912316188,1981132393&fm=27&gp=0.jpg'
    // ],
    // zanSource: ['张三', '李四', '王五', '找钱', '孙俪', '王宝'],
    // contnet: [{
    //     'firstname': '张三',
    //     'content': '你好漂亮呀！！'
    //   },
    //   {
    //     'firstname': '李四',
    //     'content': '纳尼！！'
    //   },
    //   {
    //     'firstname': '王五',
    //     'content': '鬼扯咧'
    //   },
    //   {
    //     'firstname': '王宝',
    //     'content': '昨晚11点左右，一则郑爽胡彦斌疑似复合的消息刷爆各大论坛，微博在深夜11点热度高达200万直接爆掉，中国意难忘又开始了！！！'
    //   }
    // ],
    photoWidth: wx.getSystemInfoSync().windowWidth / 5,

    popTop: 0, //弹出点赞评论框的位置
    popWidth: 0, //弹出框宽度
    isShow: true, //判断是否显示弹出框
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    that.setData({
      loadingMore: true
    })

    db.getUserInfo(app).then(res => {
      if (res.length > 0) {
        console.log("获取用户头像，昵称信息==>" + JSON.stringify(res[0]));
        that.setData({
          userinfo: res[0]
        });
      }
    })

    db.getMeiyouPostByPage(app, 0).then(res => {
      if (res.length > 0) {
        // 初始化梅友圈动态 map
        for (let i = 0; i < res.length; i++) {
          that.data.postsMap[res[i]._id] = res[i];
          that.data.postsMap[res[i]._id].zans = [];
        }

        that.setData({
          posts: res,
          myOpenId: app.globalData.openid,
          loadingMore: false
        });

        // 初始化梅友圈点赞信息 (昵称列表)
        let count = 0;
        for (let i = 0; i < res.length; i++) {
          db.getMeiyouZan(app, res[i]._id).then(zanRes => {
            if (zanRes.length > 0) {
              for (let j = 0; j < zanRes.length; j++) {
                console.log("push:" + zanRes[j].nickName);
                that.data.postsMap[zanRes[j].postid].zans.push(zanRes[j].nickName);
              }
            } 
            count++;
            if (count === res.length) {
              // 点赞信息已经全部获取
              that.setData({
                posts: that.data.posts,
              });

            }
          })
        }
      }
      
    });
  },

  onShow: function() {
  },

  // 加载下一页朋友圈信息
  tapLoadNextPage: function() {
    let that = this;
    console.log("tapLoadNextPage");
    that.data.currentPage++;

    db.getMeiyouPostByPage(app, that.data.currentPage).then(res => {
      if (res.length > 0) {
        // push新的一页的朋友圈信息
        for (let i = 0; i < res.length; i++) {
          that.data.postsMap[res[i]._id] = res[i];
          that.data.postsMap[res[i]._id].zans = [];
          that.data.posts.push(res[i]);
        }

        that.setData({
          posts: that.data.posts,
        });

        // 初始化梅友圈点赞信息 (昵称列表)
        let count = 0;
        for (let i = 0; i < res.length; i++) {
          db.getMeiyouZan(app, res[i]._id).then(zanRes => {
            if (zanRes.length > 0) {
              for (let j = 0; j < zanRes.length; j++) {
                console.log("push:" + zanRes[j].nickName);
                that.data.postsMap[zanRes[j].postid].zans.push(zanRes[j].nickName);
              }
            }
            count++;
            if (count === res.length) {
              // 点赞信息已经全部获取
              that.setData({
                posts: that.data.posts,
              });

            }
          })
        }
      } else {
        // 已经加载完了
        that.setData({
          isEnd: true
        })
      }

    });
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

  // 点击图片进行大图查看
  LookPhoto: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.photurl,
      urls: [e.currentTarget.dataset.photurl],
    })
  },

  // 点击点赞的人
  TouchZanUser: function(e) {
    wx.showModal({
      title: e.currentTarget.dataset.name,
      showCancel: false
    })
  },

  // 删除朋友圈
  delete: function() {
    wx.showToast({
      title: '删除成功',
    })
  },
  // 点赞
  zan: function(e) {
    let that = this;
    let postid = e.currentTarget.dataset.postid;
    that.data.postsMap[postid].zanFlag = true;

    db.saveMeiyouZan(app, postid).then(res => {
      console.log("保存成功" + JSON.stringify(res));
      // 更新点赞用户
      db.getMeiyouZan(app, postid).then(zanRes => {
        console.log("zanRes:" + JSON.stringify(zanRes));
        if (zanRes.length > 0) {
          that.data.postsMap[postid].zans = [];
          for (let j = 0; j < zanRes.length; j++) {
            console.log("push:" + zanRes[j].nickName);
            that.data.postsMap[postid].zans.push(zanRes[j].nickName);
          }
        }

        that.setData({
          posts: that.data.posts,
        });
      })
    });
    // 更新点赞状态
    that.setData({
      posts: that.data.posts
    });
  },

  // 点击了点赞评论
  TouchDiscuss: function(e) {
    // this.data.isShow = !this.data.isShow
    // 动画
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0,
    })

    if (that.data.isShow == false) {
      that.setData({
        popTop: e.target.offsetTop - (e.detail.y - e.target.offsetTop) / 2,
        popWidth: 0,
        isShow: true
      })

      // 0.3秒后滑动
      setTimeout(function() {
        animation.width(0).opacity(1).step()
        that.setData({
          animation: animation.export(),
        })
      }, 100)
    } else {
      // 0.3秒后滑动
      setTimeout(function() {
        animation.width(120).opacity(1).step()
        that.setData({
          animation: animation.export(),
        })
      }, 100)

      that.setData({
        popTop: e.target.offsetTop - (e.detail.y - e.target.offsetTop) / 2,
        popWidth: 0,
        isShow: false
      })
    }
  },

  // 用户提交图文
  onPostClick: function() {
    wx.navigateTo({
      url: "/pages/question-ask/question-ask"
    })
  },

  onPullDownRefresh: function () {
    var that = this
    that.setData({
      loadingMore: true,
    })
    wx.showNavigationBarLoading()
    that.onLoad()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  }
})