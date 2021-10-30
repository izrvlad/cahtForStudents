const {model, Schema, Types} = require('mongoose')


const schema = new Schema({
    name:{type:String, required:true},
    messages:[
        {type:Types.ObjectId,ref:'Message'}
    ]   
})

module.exports = model('Rooms',schema)