import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

var data = [];
var now = new Date(1997, 9, 3);
var oneDay = 24 * 3600 * 1000;
var value = Math.random() * 1000;
var chartAll = null;
var intervalId = null; // 存储setInterval的ID，便于清理

// 获取当前日期30天前的日期字符串
function getLastMonthDate() {
  const date = new Date();
  date.setDate(date.getDate() - 28); // 设为28天前，确保在30天范围内
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
}

function randomData() {
  now = new Date(+now + oneDay);
  value = value + Math.random() * 21 - 10;
  return {
    value: [
      [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
      Math.round(value)
    ]
  };
}

async function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  data = [];

  // 注释掉与后端通信的代码
  /*
  try {
    const res = await new Promise((resolve, reject) => {
      wx.request({
        url: 'http://api.heclouds.com/devices/997978117/datapoints', 
        data: {
          'datastream_id': 'rain_info',
          'start': getLastMonthDate(),  // 使用动态计算的日期
          'limit': '1',
          'sort': 'DESC'
        },
        header: {
          'content-type': 'application/json',
          'Authorization': 'version=2018-10-31&res=products%2F544361&et=1765738973&method=sha1&sign=C4OPW%2FNXTz%2BV%2FeCtKPNpojivlPM%3D',
        },
        success: resolve,
        fail: reject
      });
    });
    
    console.log(res.data);
    
    // 安全地访问数据
    if (res.data && res.data.data && res.data.data.datastreams && 
        res.data.data.datastreams.length > 0 && 
        res.data.data.datastreams[0].datapoints) {
      
      const datapoints = res.data.data.datastreams[0].datapoints;
      console.log(datapoints);
      
      for (var d = 0; d < datapoints.length; d++) {
        data.push({
          value: [datapoints[d].at, datapoints[d].value]
        });
      }
    } else {
      console.log('API返回数据格式不符合预期或无数据');
      // 添加一些默认数据以防API没有返回数据
      data.push({value: [new Date().toISOString(), 0]});
    }
  } catch (error) {
    console.error('请求失败:', error);
    // 添加默认数据
    data.push({value: [new Date().toISOString(), 0]});
  }
  */

  // 添加默认模拟数据
  now = new Date(); // 使用当前日期
  // 生成过去30天的模拟数据
  for (var i = 30; i >= 0; i--) {
    var pastDate = new Date(now.getTime() - (i * oneDay));
    data.push({
      value: [
        pastDate.toISOString(),
        Math.round(Math.random() * 100) // 0-100之间的随机雨量
      ]
    });
  }

  console.log('初始化模拟数据:', data);

  var option = {
    title: {
      text: '雨量显示 (模拟数据)'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        params = params[0];
        var date = new Date(params.name);
        return (
          date.getDate() +
          '/' +
          (date.getMonth() + 1) +
          '/' +
          date.getFullYear() +
          ' : ' +
          params.value[1]
        );
      },
      axisPointer: {
        animation: false
      }
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
      splitLine: {
        show: false
      }
    },
    series: [
      {
        name: '雨量数据',
        type: 'line',
        showSymbol: false,
        data: data
      }
    ]   
  };

  chart.setOption(option);
  chartAll = chart;
  
  // 启动定时更新
  startDataPolling();
  
  return chart;
}

var nowDate = null;
var traceMark = false;
var storageTimeStamp = null;

function startDataPolling() {
  // 清除可能存在的旧计时器
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  intervalId = setInterval(function() {
    // 注释掉原来的API请求代码
    /*
    wx.request({
      url: 'http://api.heclouds.com/devices/997978117/datapoints', 
      data: {
        'datastream_id': 'rain_info',
        'start': getLastMonthDate(), // 使用动态计算的日期
        'limit': '1',
        'sort': 'DESC'
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'version=2018-10-31&res=products%2F544361&et=1765738973&method=sha1&sign=C4OPW%2FNXTz%2BV%2FeCtKPNpojivlPM%3D',
      },
      success: function(res) {
        console.log('定时请求返回:', res.data);
        
        // 安全地访问数据
        if (res.data && res.data.data && res.data.data.datastreams && 
            res.data.data.datastreams.length > 0 && 
            res.data.data.datastreams[0].datapoints) {
          
          const datapoints = res.data.data.datastreams[0].datapoints;
          
          for (var d = 0; d < datapoints.length; d++){
            console.log('新数据时间戳:', datapoints[d].at);
            
            if (data.length > 0) {
              console.log('最后一条数据时间戳:', data[data.length-1].value[0]);
            }
            
            traceMark = false;
            storageTimeStamp = datapoints[d].at;
            data.push({value: [datapoints[d].at, datapoints[d].value]});
            
            if (data.length > 0 && datapoints[d].at === data[data.length-1].value[0]) {
              traceMark = true;
            }
            
            // 修正了拼写错误 True -> true
            if (data.length > 20 && traceMark === true) {
              data.shift();
            }
          }
          
          // 安全地更新图表
          if (chartAll) {
            chartAll.setOption({
              series: [{
                data: data
              }]
            });
          } else {
            console.warn('图表尚未初始化,无法更新');
          }
        }
      },
      fail: function(err) {
        console.error('定时请求失败:', err);
      }
    });
    */

    // 添加新的模拟数据
    var newData = randomData();
    console.log('添加新的模拟数据:', newData);
    
    data.push(newData);
    
    // 保持数据量合理
    if (data.length > 30) {
      data.shift();
    }
    
    // 更新图表
    if (chartAll) {
      chartAll.setOption({
        series: [{
          data: data
        }]
      });
    } else {
      console.warn('图表尚未初始化，无法更新');
    }
    
  }, 5000);
}

Page({
  onShareAppMessage: function (res) {
    return {
      title: '智能雨刷',
      path: '/pages/index/index',
      success: function () { },
      fail: function () { }
    }
  },
  data: {
    ec: {
      onInit: initChart
    },
  },
  onReady() {
  },
  onUnload(){
    // 清除定时器防止内存泄漏
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    console.log("quit");
  }
});
