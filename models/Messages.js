const {model,Schema,Types} = require('mongoose')

const schema = new Schema({
    userId:{type:Types.ObjectId,required:'true'},
    message:{type:String}
})

module.exports = model('Message',schema)