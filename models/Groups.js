const {model, Schema, Types} = require('mongoose')


const schema = new Schema({
    name:{type:String, required:true,unique:true},
    students:[
        {type:Types.ObjectId, ref:'Rooms'}
    ],
    teachers:[
        {type:Types.ObjectId,ref:'Teacher'}
    ]
})

module.exports = model('Groups',schema)