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