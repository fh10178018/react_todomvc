/*
包含n个操作数据库集合的Model模块
*/

//1、连接数据库
//1.1、引入数据库mongoose
const mongoose=require('mongoose')
//1.2、连接指定数据库（URL固定）
mongoose.connect('mongodb://localhost:27017/todomvc')
//1.3、获取连接对象
const conn=mongoose.connection
//1.4、绑定连接完成的监听
conn.on('connected',function () {
    console.log("db connect success！")
})





//2、定义特定集合的Model并向外暴露
//2.1、定义文档结构
const userSchema=mongoose.Schema({
    username:{type:String,required:true},//用户名
    password:{type:String,required:true},//密码
    header:{type:String}
})
//2.2、定义Model（与集合对应，可以操作集合）
const UserModel =mongoose.model('user',userSchema)
//2.3、向外暴露
exports.UserModel=UserModel


const ArticleSchema=mongoose.Schema({
    article_title:{type:String,required:true},//文章标题
    content:{type:String},//内容
    creat_time:{type:Date,required:true},//创建时间
    mtime:{type:Date,required:true},//修改时间时间
    level:{type:Number, default: 1,required:true}//级别 1 是大标题，2 是子标题内容
})
//2.2、定义Model（与集合对应，可以操作集合）
const ArticleModel =mongoose.model('article',ArticleSchema)
//2.3、向外暴露
exports.ArticleModel=ArticleModel

const LoginStateSchema=mongoose.Schema({
    user_id:{type:String,required:true},//文章标题
    creat_time:{type:Date,required:true},//创建时间,也就是
    state:{type:Boolean,required:true}//修改状态：login为true，logout为false

})
//允许批量删除操作
//2.2、定义Model（与集合对应，可以操作集合）
const LoginStateModel =mongoose.model('loginstate',LoginStateSchema)
//2.3、向外暴露
exports.LoginStateModel=LoginStateModel

const UserActivitySchema=mongoose.Schema({
    number:{type:Number,required:true},//每日用户活跃数量
    creat_time:{type:Date,required:true}//创建时间,也就是

})
//允许批量删除操作
//2.2、定义Model（与集合对应，可以操作集合）
const UserActivityModel =mongoose.model('useractivity',UserActivitySchema)
//2.3、向外暴露
exports.UserActivityModel=UserActivityModel

