const app = getApp()
Page({
  data: {
    modalType: null, // 用于控制显示哪个模态框
    authorized: false,
    days: 0,
    avatarUrl: '../../assets/image/tx.jpg', // 默认头像
    nickname: '陌生人', // 默认昵称
    avatarFile: '../../assets/image/tx.jpg', // 修改头像
    nicknameFile: '',
    easterEggClickCount: 0, // 新增：彩蛋点击计数
    easterEggTimer: null,    // 新增：彩蛋点击定时器
  },

  // 获取用户信息
  onShow: function () {
    if (wx.getStorageSync("token") != "") {
      wx.request({
        url: app.url + 'user/userInfo',
        method: "GET",
        header: {
          token: wx.getStorageSync("token")
        },
        success: (res) => {
          if (res.data.code == 200) {
            this.calculateDays(res.data.data.createTime)
            this.setData({
              authorized: true
            });
            if (res.data.data.avatarUrl != null) {
              this.setData({
                avatarUrl: res.data.data.avatarUrl,
                avatarFile: res.data.data.avatarUrl
              });
            }
            if (res.data.data.nickname != null) {
              this.setData({
                nickname: res.data.data.nickname,
                nicknameFile: res.data.data.nickname
              });
            }
          }
        }
      });
    }
  },

  // 修改用户信息
  updateUserInfo: function () {
    const avatarChanged = this.data.avatarFile != this.data.avatarUrl;
    const nicknameChanged = this.data.nicknameFile != this.data.nickname;

    //如果只修改了头像
    if (avatarChanged) {
      wx.uploadFile({
        url: app.url + 'user/updateUserInfo',
        filePath: this.data.avatarFile,
        name: 'file',
        header: {
          'content-type': 'multipart/form-data',
          "token": wx.getStorageSync("token")
        },
        useHighPerformanceMode: true,
        success: (res) => {
          wx.hideLoading()
          const data = JSON.parse(res.data);
          if (data.code == 200) {
            this.setData({
              avatarUrl: this.data.avatarFile
            });
          } else {
            wx.showToast({
              title: data.data,
              duration: 2000,
              icon: "none",
              mask: true
            })
          }
        }
      })
    } 

    //如果只修改了昵称
    if(nicknameChanged) {
     if(this.data.nicknameFile.trim()==""){
      wx.hideLoading()
      this.setData({
        modalType: null
      });
        return;
     }
      wx.request({
        url: app.url + 'user/updateUserInfo',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          "token": wx.getStorageSync("token")
        },
        data: {
          nickname: this.data.nicknameFile
        },
        success: (res) => {
          wx.hideLoading()
          console.log(res)
          if (res.data.code == 200) {
            this.setData({
              nickname: this.data.nicknameFile
            });
          } else {
            wx.showToast({
              title: res.data.data,
              duration: 2000,
              icon: "none",
              mask: true
            })
          }
        }
      })
    }
    wx.hideLoading()
    this.setData({
      modalType: null
    });
  },

  // 计算天数的函数
  calculateDays: function (time) {
    // 将时间字符串中的 '-' 替换为 '/'，以兼容 IOS 系统
    const formattedStartTimeStr = time.replace(/-/g, '/');
    const startDate = new Date(formattedStartTimeStr);
    const currentDate = new Date();
    const diffTime = currentDate - startDate;
    const diffDays = Math.abs(Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    this.setData({
      days: diffDays,
    });
  },

  goLogin: function () {
    wx.navigateTo({
      url: "/pages/login/index",
    });
  },

  // 打开编辑个人资料的模态框
  openEditProfileModal: function () {
    this.setData({
      modalType: 'editProfile'
    });
  },

  // 获取用户头像临时地址
  onChooseAvatar(e) {
    console.log(e.detail);
    const { avatarUrl } = e.detail
    this.setData({
      avatarFile: avatarUrl
    });
  },

  // 监听昵称输入
  onNicknameInput(e) {
    this.setData({
      nicknameFile: e.detail.value,
    });
  },

  // 关闭模态框
  closeModal: function () {
    this.setData({
      modalType: null
    });
  },

  // 我的作品
  mywork() {
    if (wx.getStorageSync("token") == "") {
      wx.navigateTo({
        url: "/pages/login/index",
      });
    } else {
      wx.switchTab({
        url: '/pages/photo/index'
      })
    }
  },
  goCustomlist(){
    if (wx.getStorageSync("token") == "") {
      wx.navigateTo({
        url: "/pages/login/index",
      });
    } else {
      wx.navigateTo({
        url: "/pages/customlist/index",
      });
    }
  },

  // 赏好评
  evaluate() {
    if (wx.openBusinessView) {
      wx.openBusinessView({
        businessType: 'servicecommentpage',
        success: (res) => {
          console.log(res)
        },
        fail: (res) => {
          console.log(res)
        }
      });
    }
  },

  // 我的权益弹框
  navigateToEdit() {
    this.setData({
      modalType: 'rights'
    });
  },

  // 常见问题弹框
  navigateToFree() {
    this.setData({
      modalType: 'questions'
    });
  },

  // 彩蛋点击处理函数
  easterEgg(){
    const { easterEggClickCount} = this.data;
    const newCount = easterEggClickCount + 1;
    this.setData({
      easterEggClickCount: newCount
    });
    if (newCount === 1) {
      this.data.easterEggTimer = setTimeout(() => {
        this.setData({
          easterEggClickCount: 0
        });
      }, 9000);
    }

    if (newCount === 3) {
      clearTimeout(this.data.easterEggTimer);
      this.setData({
        modalType: 'easterEgg',
        easterEggClickCount: 0
      });
    }
  },

  // 分享设置
  onShareAppMessage() {
    return {
      title: '哇塞，这个证件照小程序也太好用了吧！好清晰，还免费',
      path: 'pages/index/index',
      imageUrl: '../../images/share.jpg'
    }
  }

  
})