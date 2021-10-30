const {model,Schema,Types} = require('mongoose')

const schema = new Schema({
    login:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    type:{type:String, default:"Teacher"},
    rooms:[{type:Types.ObjectId,ref:'Rooms'}],
    groups:[
        {type:Types.ObjectId, ref:'Groups'}
    ]
})

module.exports = model('Teacher',schema)