var express = require('express');
var config = require('./config/index');

var port = process.env.PORT || config.build.port; // 当前环境下的port，或者config下的port，即端口

var app = express();// 启动express

var router = express.Router();

// 定义一个路由，在根目录返回一个function
router.get('/', function (req, res, next) {
  req.url = '/index,html';
  next();
});
// 使用router
app.use(router);

// 下面的是一些关于异步接口的router，之前定义过，从dev-server.js中复制过来，
var appData = require('./data.json');
var seller = appData.seller;
var goods = appData.goods;
var ratings = appData.ratings;
// 创建express的路由功能，就可以根据需求创建多个路由，需要多少创建多少
var apiRoutes = express.Router();
// 使用字符串的路径模式定义请求的端点，get（）是http请求的方法，res.json（）发送一个json格式的响应
apiRoutes.get('/seller', function(req,res){
  res.json({
    errno: 0,
    data: seller
  });
});
apiRoutes.get('/goods', function(req,res){
  res.json({
    errno: 0,
    data: goods
  });
});
apiRoutes.get('/rating', function (req,res) {
  res.json({
    errno: 0,
    data: ratings
  });
});
// api这里是做的字符串筛选，即所有包括api的字符串，第二个参数即相应的router路由
app.use('/api', apiRoutes);

// di定义static的目录
app.use(express.static('./dist'));

// 启动express
module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Listening at http://localhost:' + port + '\n');
});
