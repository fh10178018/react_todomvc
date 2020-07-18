var express = require('express')

var router = express.Router();

//定时模块
var schedule = require("node-schedule");

var  today =new  Date(Date.now());


const md5=require('blueimp-md5') //md5加密的函数
const {UserModel,ArticleModel,LoginStateModel,UserActivityModel}=require('../db/models')
const filter={password:0,__v:0}//指定过滤属性

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//注册一个路由：用户注册
/*
a)path为：/register
b)请求方式为：POST
c)接受username、password
d)是否已经是注册用户
e)注册成功返回{code:0,data:{id:'123',username,password}}
*/
router.post('/register',function (req,res) {
    //获取参数
    const {username,password} = req.body
    //查询处理，与保存处理，并返回信息
    UserModel.findOne({username},filter,function (error,user) {
        if(user){
            res.send({code:1,msg:"此用户已经存在！"})
        }else {
            new UserModel({username,password:md5(password),header:'default-01'}).save(function (error,user) {
                res.cookie('userid',user._id,{maxAge:1000*60*60*24})//持久化cookie，浏览器会保存在本地文件，最多保存一天，以毫米为单位
                res.send({code:0,data:user})
            })
        }
    })
})
module.exports = router;

//注册一个路由：登陆路由
router.post('/login',function (req,res) {
    const {username,password} = req.body
    UserModel.findOne({username,password:md5(password)},filter,function (error,user) {
        if(user){
            var today_str = today.format('yyyy-MM-dd hh:mm:ss');
            res.cookie('userid',user._id,{maxAge:1000*60*60*24})
            LoginStateModel.findOne({user_id:user._id},function (error,loginstate) {

                if(loginstate){
                    LoginStateModel.findOne({user_id:loginstate._id}).update({user_id:loginstate._id},{state:true,creat_time: today_str},function (error,a) {
                        console.log(error,a)
                    })//如果查询到，更新state
                }else {
                    new LoginStateModel({user_id:user._id,state:true,creat_time: today_str}).save()//如果没有查询到，存储登陆状态
                }
            })

            res.send({code:0,data:user})
        }else {
            res.send({code:1,msg:"用户名或密码错误！"})
        }
    })
})
//注册一个路由：登出路由
router.post('/logout',function (req,res) {
    const {_id} = req.body
    res.cookie('userid','',{expires:new Date(0)}) //删除cookie
    var today_str = today.format('yyyy-MM-dd hh:mm:ss');
    LoginStateModel.findOne({user_id:_id},function (error,loginstate) {
        if(loginstate){
            LoginStateModel.findOne({user_id:loginstate._id}).update({user_id:_id},{state:false,creat_time: today_str},function (error,a) {
                console.log(error,a)
            })//如果查询到，更新state
        }else {
            new LoginStateModel({user_id:_id,state:false,creat_time: today_str}).save()//如果没有查询到，存储登陆状态
        }
    })
    res.send({code:0,msg:"已经登出！"})
})

//获取用户信息的路由,根据server的cookie中的userid获取user
router.get('/user',function (req,res) {
    const userid=req.cookies.userid
    if(!userid){
        res.send({code:1,msg:"登陆过期，请先登陆！"})
    }
    UserModel.findOne({_id:userid},filter,function (error,user) {
        res.send({code:0,data:user})
    })
})


//创建一篇文章
router.post('/createarticle',function (req,res) {
    const {article_title,content,creat_time,mtime,level} = req.body
    new ArticleModel({article_title,content,creat_time,mtime,level}).save(function (error,article) {
        if (article) {
            res.send({code:0,msg:'创建成功！'})
        }else {
            res.send({code:1,msg:'创建失败！'})
        }
    })
})
//编辑一篇文章
router.post('/editarticle',function (req,res) {
    const {article_title,content,mtime,level,_id} = req.body
    ArticleModel.findByIdAndUpdate({_id},{article_title,content,mtime,level},function (error,old_article) {
        if(!error){
            res.send({code:0,msg:'修改成功！'})
        }else {
            res.send({code:1,msg:error})
        }
    })
})

//删除一篇文章,成功返回被删除的
router.post('/deletearticle',function (req,res) {
    const {_id} = req.body
    ArticleModel.remove({_id},function (error,doc) {
        if(!error){
            if(doc.n===1){
                res.send({code:0,msg:'删除成功！'})
            }else {
                res.send({code:0,msg:'尚未找到！'})
            }
        }else {
            res.send({code:1,msg:'删除失败！'})
        }
    })
})

//获取多篇文章
router.get('/articlelist',function (req,res) {
    ArticleModel.find(function (error,articlelist) {
        if(!error){
            res.send({code:0,data:articlelist})
        }else {
            res.send({code:1,msg:'加载失败！'})
        }
    })
})



//获取当前在线和前一日活跃用户数量
router.get('/useractivity',function (req,res) {
    var  yesterday =new  Date(Date.now()-1000*60*60*24);
    var  today =new  Date(Date.now());
    //转为指定字符串
    var yesterday_str = yesterday.format('yyyy-MM-dd hh:mm:ss');
    var today_str = today.format('yyyy-MM-dd hh:mm:ss');
    var y_number=0
    var t_number=0
    UserActivityModel.find({"$and":[{"creat_time":{"$gt":yesterday_str}},{"creat_time":{"$lt":today_str}}]},function (error,useractivity) {
        if (useractivity) {  //获取前一日活跃用户数
            y_number=useractivity[0].number
            console.log(y_number)
        }else {
            y_number=0
        }
    })
    LoginStateModel.find({state:true},function (error,loginstate) {
        t_number=loginstate.length   //获取当前今日登陆人数
        res.send({code:0,data:{y_number,t_number}})
    })
})
  //指定字符串格式的时间类型




var rule     = new schedule.RecurrenceRule();
rule.second =[0,20,40]
 //每天0点清除登陆状态数据库
schedule.scheduleJob('0 0 0 * * *', function(){
    LoginStateModel.find(function (error,loginstate) {
        if(!error){
            const res={} //遍历数组重复查询,通过用户唯一的_id
            loginstate.forEach((key)=>{
                if(res[key.user_id]){
                    res[key.user_id]++
                }else{
                    res[key.user_id]=1
                }
            })
            var today_str = today.format('yyyy-MM-dd hh:mm:ss');
            new UserActivityModel({number:Object.keys(res).length,creat_time:today_str}).save() //保存每日活跃用户数量
            console.log(Object.keys(res).length)
        }else {
            new UserActivityModel({number:0,creat_time:today_str}).save() //保存每日活跃用户数量
            console.log(0)
        }
    })
    LoginStateModel.remove({__v: 0},function (error,doc) {
        console.log(doc)
    })
});


Date.prototype.format = function (format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
};
