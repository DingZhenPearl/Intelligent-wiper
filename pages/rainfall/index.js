import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

var data = [];
var now = new Date(1997, 9, 3);
var oneDay = 24 * 3600 * 1000;
var value = Math.random() * 1000;
var chartAll = null;

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

  // var temp_data = [];
  // for (var i = 0; i < 1000; i++) {
  //   now = new Date(+now + oneDay);
  //   value = value + Math.random() * 21 - 10;
  //   temp_data.push( {value: [
  //     [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
  //     Math.round(value)
  //   ]});
  // }
  // console.log(temp_data)

  data = [];

  await wx.request({
    url: 'https://your-server.com/api/rainfall/data', // 替换为您的服务器地址
    data: {
      'start_time': '2025-03-01T00:00:00',
      'limit': 1
    },
    header: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + wx.getStorageSync('token') // 使用JWT token认证
    },
    success (res) {
      console.log(res.data)
      console.log(res.data.data.datastreams[0].datapoints)
      for (var d = 0; d < res.data.data.datastreams[0].datapoints.length; d++){
        data.push({value: [res.data.data.datastreams[0].datapoints[d].at, res.data.data.datastreams[0].datapoints[d].value]})
      }
    }
  })

  console.log(data)

  var option = {
    title: {
      text: '雨量显示'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        console.log(params);
        params = params[0];
        console.log(params);
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
        name: 'Fake Data',
        type: 'line',
        showSymbol: false,
        data: data
      }
    ]   
  };

  chart.setOption(option);
  chartAll = chart;
  return chart;
}

var nowDate = null;
var traceMark = false;
var storageTimeStamp = null;
setInterval(function () {
  wx.request({
    url: 'https://your-server.com/api/rainfall/realtime', // 替换为您的实时数据接口
    data: {
      'timestamp': new Date().toISOString()
    },
    header: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + wx.getStorageSync('token')
    },
    success (res) {

      console.log('333333333333333333333333333333')
      console.log(res.data)
      console.log(res.data.data.datastreams[0].datapoints)
      for (var d = 0; d < res.data.data.length; d++) {
        console.log('**********************')
        console.log(res.data.data[d].timestamp)
        console.log(data[data.length-1].value[0])
       //待解决 设备产生数据的时间戳和本地时钟的时间无法同步，造成本地时钟相对超前
        // if((res.data.data.datastreams[0].datapoints[d].at == data[data.length-1].value[0]) || (res.data.data.datastreams[0].datapoints[d].at == storageTimeStamp && traceMark == true)){
        //   traceMark = true;
        //   console.log('enter')
        //   nowDate = new Date();
        //   console.log(nowDate.getMonth()) //注意getMonthd
        //   let temp_date = nowDate.getFullYear() + '-' + (nowDate.getMonth()+1).toString() + '-' + nowDate.getDate() + ' ' + nowDate.getHours() + ':' + nowDate.getMinutes() + ':' + nowDate.getSeconds() + '.' + '000'; 
        //   console.log(nowDate)
        //   console.log(temp_date)
        //   console.log('8888888888888888888888888888888888')
        //   console.log({value: [temp_date, res.data.data.datastreams[0].datapoints[d].value]})
        //   data.push({value: [temp_date, res.data.data.datastreams[0].datapoints[d].value]})
        // }else{
          traceMark = false;
          storageTimeStamp = res.data.data.datastreams[0].datapoints[d].at;
          data.push({value: [res.data.data[d].timestamp, res.data.data[d].value]})
          if(res.data.data.datastreams[0].datapoints[d].at == data[data.length-1].value[0]){
               traceMark = true;
          }
         if(data.length > 20 && traceMark == True){
             data.shift();
        }
        // }
      }
    },
    error(){
      data = data;
    }
  })
  // for (var i = 0; i < 5; i++) {
  //   data.shift();
  //   data.push(randomData());
  // }
  chartAll.setOption({
    series: [
      {
        data: data
      }
    ]
  });
}, 5000);

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
    //data = [];
    console.log("quit");
    //clearInterval();
  }
});
