const mongoose=require('mongoose')
const md5=require('blueimp-md5') //md5加密的函数

//连接数据库
mongoose.connect('mongodb://localhost:27017/todomvc')
const conn=mongoose.connection
conn.on('connected',function () {
    console.log("数据库连接成功！")
})
//定义文档结构
const userSchema=mongoose.Schema({
    username:{type:String,required:true},//用户名
    password:{type:String,required:true},//密码
    header:{type:String}
})
// 定义model ，与集合对应，可以操作集合
const UserModel =mongoose.model('user',userSchema)
function save () {
    const  usermodel=new UserModel({username: '1206758827',password: md5('1022FANGhan0015')})
    usermodel.save(function (error,user) {
        console.log('save()',error,user)
    })
}
//find()/findOne()查询多个或一个数据,find()返回数组，findOne返回对象列表
function testFind() {
    UserModel.find(function (error,users) {
        console.log('find()',error,users)
    })
    UserModel.findOne({username:1206758827},function (error,users) {
        console.log('find()',error,users)
    })
}

//更行某一个数据，findByIdAndUpadate()更新某个数据

//通过remove 删除某个数据

