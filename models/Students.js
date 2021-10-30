const {Schema,Types, model} = require('mongoose')

const schema = new Schema({
    login:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    rooms:[{type:Types.ObjectId}],
    type:{type:String, default:"Student"},
    group:{type:Types.ObjectId, ref:'Groups'}
})
module.exports = model('Student',schema)