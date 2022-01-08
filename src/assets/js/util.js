import axios from "axios";
export default {
  install(Vue, options) {
    window.App = {};
    Vue.prototype.$noBind = function (obj) {
      var res = obj ? JSON.parse(JSON.stringify(obj)) : '';
      return res;
    };
    // 通过接口获取数据
    Vue.prototype.$apiPost = function (url, data, callback, method = '') {
      var params = method.toLowerCase() == 'get' ? data : null;
      axios.request({
        method: method || 'post', // default
        baseURL: url,
        data: data,
        params: params,
        timeout: 60000,
      }).then(function (response) {
        switch (response.data.code) {
          case 200:
            typeof callback == 'function' && callback(response.data)
            break;
          case 403:
            Vue.prototype.$message('请重新登录');
            if (process.env.NODE_ENV !== "development") {
              setTimeout(() => {
                location.href = '/';
              }, 2000);
            }
            typeof callback == 'function' && callback(false)
            break;
          case 4031:
            typeof callback == 'function' && callback(response.data)
            break;
          default:
            Vue.prototype.$message.error('操作失败:' + response.data.message);
            typeof callback == 'function' && callback(false)
            break;
        }
      }).catch(function (error) {
        if (error.response) {
          Vue.prototype.$message.error('服务器繁忙');
        } else if (error.request) {
          Vue.prototype.$message.error('网络不稳定');
        } else {
          Vue.prototype.$message.error('解析出错：' + error.message);
          console.log('Error', error);
        }
        typeof callback == 'function' && callback(false)
      })
    };
    // 验证权限
    Vue.prototype.$checkAuth = function (auths) {
      return auths.some((auth) => {
        return App.auth.indexOf(auth) != -1
      })
    };
    // 将对象转为数组
    Vue.prototype.$objToArr = function (obj) {
      var arr = Array();
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          var temp = new Object();
          var value = obj[key];
          temp.key = key;
          temp.value = value;
          arr.push(temp);
        }
      }
      return arr;
    }
    // 数组去重
    Vue.prototype.$unique = function (array) {
      var res = [];
      var json = {};
      for (var i = 0; i < array.length; i++) {
        if (!json[array[i]]) {
          res.push(array[i]);
          json[array[i]] = 1;
        }
      }
      return res;
    }
    // 计算两个时间直接间隔
    // start: 开始时间 end: 结束时间
    Vue.prototype.$getInterval = function (start, end) {
      var interval = parseInt(end) - parseInt(start);
      var str = '';
      //计算出相差天数
      if (interval >= 24 * 3600 * 1000) {
        var days = Math.floor(interval / (24 * 3600 * 1000))
        str = days + '天';
      }
      //计算出小时数
      var leave1 = interval % (24 * 3600 * 1000)
      if (interval >= 3600 * 1000) {
        var hours = Math.floor(leave1 / (3600 * 1000))
        str += hours + '小时'
      }
      //计算相差分钟数
      var leave2 = leave1 % (3600 * 1000)
      if (interval >= 0) {
        var minutes = Math.floor(leave2 / (60 * 1000))
        str += minutes + '分钟'
      }
      return str;
    }

    // 时间戳格式化
    Vue.filter('formatTime', function (timestamp, type) {
      if (!timestamp) return '';
      var date = new Date(parseInt(timestamp))
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      var hour = date.getHours()
      var minute = date.getMinutes()
      var second = date.getSeconds()

      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }
      switch (type) {
        case 1:
          return [year, month, day].map(formatNumber).join('-');
        case 2:
          return [hour, minute, second].map(formatNumber).join(':');
        default:
          return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
      }
    })
    Vue.filter('formatSize', function (size) {
      var i = 0;
      var val = ['b', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      while ((size / 1024) > 1) {
        size /= 1024;
        ++i;
      }
      size = Math.round(size * 100) / 100;
      return size + val[i];
    })

    Vue.directive('fullpage', {
      // 当被绑定的元素插入到 DOM 中时……
      bind: function (el) {
        el.style.minHeight = window.innerHeight + 'px';
      }
    })
    Vue.prototype.$validIfNoData = function (data) {
      if (data.length <= 0) {
        return true;
      } else {
        return false;
      }
    }
    /**
     * 解决小数精度问题
     * @param {*数字} a
     * @param {*数字} b
     * @param {*符号} sign
     * fixedFloat(0.3, 0.2, '-')
     */
    window.fixedFloat = function (a, b, sign) {
      function handle(x) {
        var y = String(x)
        var p = y.lastIndexOf('.')
        if (p === -1) {
          return [y, 0]
        } else {
          return [y.replace('.', ''), y.length - p - 1]
        }
      }
      // v 操作数1, w 操作数2, s 操作符, t 精度
      function operate(v, w, s, t) {
        switch (s) {
          case '+':
            return (v + w) / t
          case '-':
            return (v - w) / t
          case '*':
            return (v * w) / (t * t)
          case '/':
            return (v / w)
        }
      }
      var c = handle(a)
      var d = handle(b)
      var k = 0
      if (c[1] === 0 && d[1] === 0) {
        return operate(+c[0], +d[0], sign, 1)
      } else {
        k = Math.pow(10, Math.max(c[1], d[1]))
        if (c[1] !== d[1]) {
          if (c[1] > d[1]) {
            d[0] += padding0(c[1] - d[1])
          } else {
            c[0] += padding0(d[1] - c[1])
          }
        }
        return operate(+c[0], +d[0], sign, k)
      }

      function padding0(p) {
        var z = ''
        while (p--) {
          z += '0'
        }
        return z
      }
    }
  }
}