const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')
const Student = require('./models/Students')
const jwt = require("jsonwebtoken");
const Teacher = require("./models/Teachers");
const Room = require("./models/Rooms");
const Message = require('./models/Messages')
const Group = require('./models/Groups')

app.use(express.json({ extended: true }))

app.use("/api/auth",require('./routes/auth.route'))
app.use("/api/profile",require('./routes/reduct.router'))
app.use("/api/groups",require('./routes/group.route'))
app.use("/api/rooms",require('./routes/rooms.route'))
const PORT = 5000

io.on('connection',(client)=>{
    client.on('loadRooms', async (token,cb)=>{
        const userId = jwt.decode(token,'secretWorld').userId
        let user = await Teacher.findById(userId)
        if(!user){
            user = await Student.findById(userId)
        }
        const rooms = user.rooms
        let result = []
        for(let i = 0; i<rooms.length; i++){
            const room = await Room.findById(rooms[i])
            result.push(room)
            client.join(room.id)
        }
        return cb(result)
    })
    client.on('LoadMessages',async (roomId,cb)=>{
        const room = await Room.findById(roomId)
        const result = []
        for(let i = 0; i < room.messages.length; i++){
            let message = await Message.findById(room.messages[i])
            let user = await Teacher.findById(message.userId)
            if(!user){
                user = await Student.findById(message.userId)
            }
            message = {_id:message._id,message:message.message,login:user.login,userId:message.userId}
            result.push(message)
        }
        return cb(result)
    })
    client.on('newMessage',async (message,roomId)=>{
        const newMessage = await new Message(message)
        const room = await Room.findById(roomId)
        let user = await Teacher.findById(message.userId)
        if(!user){
            user = await Student.findById(message.userId)
        }
        room.messages.push(newMessage.id)
        const res = {_id:newMessage._id,message:newMessage.message,login:user.login,userId:newMessage.userId}
        await room.save()
        await newMessage.save()
        console.log(res)
        io.to(roomId).emit('mess',res)
    })
})





async function start(){
    try {
        await mongoose.connect('mongodb://localhost:27017/',{
            dbName: 'webChat',
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        http.listen(5000,()=>console.log(`server started on port ${5000}`))
    }catch (e){
        console.log('error',e.message)
    }
}

start()