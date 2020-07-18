var createError = require('http-errors');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');



var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



// 通过 zrevrangebyscore 来查询上一分钟在线用户。
// 我们将能得到从当前时间算起在 60,000 毫秒内活跃的用户。
app.use('/',function(req, res, next) {
    var min = 60 * 1000;
    var ago = Date.now() - min;
    db.zrevrangebyscore('online', '+inf', ago, function (err, users) {
        if (err) {
            return next (err);
        }

        req.online = users;
        next ();
    });
});




module.exports = app;
