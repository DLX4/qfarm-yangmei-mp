var commonCityData = require('../../utils/city.js')
var db = require('../../utils/db.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    name:'',// 姓名
    mobile:'',// 手机号
    address:'',// 详细地址
    code:'',// 邮政编码
    id:'',// 数据主键
    isSubmitted: false,// 老地址还是新地址

    provinces: [],
    citys: [],
    defaultProvinceCode: 2,
    defaultCityCode: 3,
    defaultCountyCode: 16,
    defaultAddressCode: '057750',
    districts: [],
    selProvince: '请选择',
    selCity: '请选择',
    selDistrict: '请选择',
    selProvinceIndex: 0,
    selCityIndex: 0,
    selDistrictIndex: 0
  },
  bindCancel: function () {
    wx.navigateBack({})
  },
  bindSave: function (e) {
    var that = this;
    var name = e.detail.value.name;
    var address = e.detail.value.address;
    var mobile = e.detail.value.mobile;
    var postalCode = e.detail.value.code;

    if (name === "") {
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel: false
      })
      return
    }
    if (mobile === "") {
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel: false
      })
      return
    }
    if (that.data.selProvince === "请选择") {
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel: false
      })
      return
    }
    if (that.data.selCity === "请选择") {
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel: false
      })
      return
    }
    var cityId = commonCityData.cityData[that.data.selProvinceIndex].cityList[that.data.selCityIndex].id;
    var cityName = commonCityData.cityData[that.data.selProvinceIndex].cityList[that.data.selCityIndex].name;
    var districtId;
    var districtName;
    if (that.data.selDistrict === "请选择" || !that.data.selDistrict) {
      districtId = '';
      districtName = '';
    } else {
      districtId = commonCityData.cityData[that.data.selProvinceIndex].cityList[that.data.selCityIndex].districtList[that.data.selDistrictIndex].id;
      districtName = commonCityData.cityData[that.data.selProvinceIndex].cityList[that.data.selCityIndex].districtList[that.data.selDistrictIndex].name;
    }
    if (address === "") {
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel: false
      })
      return
    }
    if (postalCode === "") {
      wx.showModal({
        title: '提示',
        content: '请填写邮编',
        showCancel: false
      })
      return
    }
    var apiAddoRuPDATE = "add";
    var apiAddid = that.data.id;
    if (apiAddid) {
      apiAddoRuPDATE = "update";
    } else {
      apiAddid = 0;
    }
    // 保存用户的地址
    let savePromise;
    if (that.data.id !== '') {
      // 保存老的地址
      savePromise = db.updateUserAddress(app, {
        provinceName: commonCityData.cityData[that.data.selProvinceIndex].name,
        cityName: cityName,
        districtName: districtName,
        name: name,
        address: address,
        mobile: mobile,
        postalCode: postalCode,
        isDefault: false,// 非默认地址,
        _id: that.data.id
      })
    } else {
      // 保存一条新的地址
      savePromise = db.saveUserAddress(app, {
        provinceName: commonCityData.cityData[that.data.selProvinceIndex].name,
        cityName: cityName,
        districtName: districtName,
        name: name,
        address: address,
        mobile: mobile,
        postalCode: postalCode,
        isDefault: false// 非默认地址
      });
    }

    savePromise.then(res => {
      wx.showToast({
        title: '地址保存成功',
      });
      // 跳转到结算页面
      wx.navigateBack({});
    }, err => {
      wx.showToast({
        icon: 'none',
        title: '地址保存失败'
      })
    });
  },
  initCityData: function (level, obj) {
    if (level == 1) {
      var pinkArray = [];
      for (var i = 0; i < commonCityData.cityData.length; i++) {
        pinkArray.push(commonCityData.cityData[i].name);
      }
      this.setData({
        provinces: pinkArray
      });
    } else if (level == 2) {
      var pinkArray = [];
      var dataArray = obj.cityList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        citys: pinkArray
      });
    } else if (level == 3) {
      var pinkArray = [];
      var dataArray = obj.districtList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        districts: pinkArray
      });
    }

  },
  bindPickerProvinceChange: function (event) {
    var selIterm = commonCityData.cityData[event.detail.value];
    this.setData({
      selProvince: selIterm.name,
      selProvinceIndex: event.detail.value,
      selCity: '请选择',
      selCityIndex: 0,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(2, selIterm)
  },
  bindPickerCityChange: function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity: selIterm.name,
      selCityIndex: event.detail.value,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(3, selIterm)
  },
  bindPickerChange: function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
    if (selIterm && selIterm.name && event.detail.value) {
      this.setData({
        selDistrict: selIterm.name,
        selDistrictIndex: event.detail.value
      })
    }
  },
  onLoad: function (e) {
    var that = this;
    this.initCityData(1);
    var id = e.id;
    if (id) {
      wx.showLoading();

      var that = this;
      db.getUserAddressByKey(app).then(result => {
        wx.hideLoading();
        if (result.length > 0 ) {
          let address = result[0];
          console.log("address:" + JSON.stringify(address));
          this.setData({
            selProvince: address.provinceName,
            selCity: address.cityName,
            selDistrict: address.districtName,

            name: address.name,// 姓名
            mobile: address.mobile,// 手机号
            address: address.address,// 详细地址
            code: address.postalCode,// 邮政编码
            id: address._id,// 数据主键
            isSubmitted: true,// 老地址还是新地址
          });
          that.recoverAddressSel(address.provinceName, address.cityName, address.districtName);
        }
      }, err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      });

      // TODO-DLX
      // wx.request({
      //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/shipping-address/detail',
      //   data: {
      //     token: wx.getStorageSync('token'),
      //     id: id
      //   },
      //   success: function (res) {
      //     wx.hideLoading();
      //     if (res.data.code == 0) {
      //       that.setData({
      //         id: id,
      //         addressData: res.data.data,
      //         selProvince: res.data.data.provinceStr,
      //         selCity: res.data.data.cityStr,
      //         selDistrict: res.data.data.areaStr
      //       });
      //       that.setDBSaveAddressId(res.data.data);
      //       return;
      //     } else {
      //       wx.showModal({
      //         title: '提示',
      //         content: '无法获取快递地址数据',
      //         showCancel: false
      //       })
      //     }
      //   }
      // })
    }
  },
  //
  recoverAddressSel: function (selProvince, selCity, selDistrict) {
    var retSelIdx = 0;
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (selProvince == commonCityData.cityData[i].name) {
        this.data.selProvinceIndex = i;
        console.log("this.data.selProvinceIndex = " + this.data.selProvinceIndex)
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (selCity == commonCityData.cityData[i].cityList[j].name) {
            this.data.selCityIndex = j;
            console.log("this.data.selCityIndex = " + this.data.selCityIndex)
            for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
              if (selDistrict == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                this.data.selDistrictIndex = k;
                console.log("this.data.selDistrictIndex" + this.data.selDistrictIndex)
              }
            }
          }
        }
      }
    }
  },
  selectCity: function () {

  },
  deleteAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          //TODO-DLX
          // wx.request({
          //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/shipping-address/delete',
          //   data: {
          //     token: wx.getStorageSync('token'),
          //     id: id
          //   },
          //   success: (res) => {
          //     wx.navigateBack({})
          //   }
          // })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  readFromWx: function () {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        let provinceName = res.provinceName;
        let cityName = res.cityName;
        let diatrictName = res.countyName;
        let retSelIdx = 0;
        for (var i = 0; i < commonCityData.cityData.length; i++) {
          if (provinceName == commonCityData.cityData[i].name) {
            let eventJ = { detail: { value: i } };
            that.bindPickerProvinceChange(eventJ);
            that.data.selProvinceIndex = i;
            for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
              if (cityName == commonCityData.cityData[i].cityList[j].name) {
                //that.data.selCityIndex = j;
                eventJ = { detail: { value: j } };
                that.bindPickerCityChange(eventJ);
                for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                  if (diatrictName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                    //that.data.selDistrictIndex = k;
                    eventJ = { detail: { value: k } };
                    that.bindPickerChange(eventJ);
                  }
                }
              }
            }
          }
        }

        that.setData({
          wxaddress: res,
        });
      }
    })
  }
})
