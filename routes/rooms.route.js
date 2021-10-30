const {Router} = require('express')
const auth = require('../midlevares/auth.midleware')
const Teacher = require('../models/Teachers')
const Student = require('../models/Students')
const Room = require('../models/Rooms')
const Group = require("../models/Groups");
const router = Router()

router.get('/',auth,async (req,res)=>{
    const userId = req.user.userId
    let user = await Teacher.findById(userId)
    if(!user){
        user = await Student.findById(userId)
    }
    const rooms = user.rooms
    let result = []
    for(let i = 0; i<rooms.length; i++){
        const room = await Room.findById(rooms[i])
        result.push(room)
    }
    res.status(200).send(result)
})

router.post('/add',auth,async (req,res)=>{
    try{
        const userId = req.user.userId
        const {groupName} = req.body
        const user = await Student.findById(userId)
        const group = await Group.findById(user.group)
        const room = await new Room({name:groupName+' ' + group.name})
        await room.save()
        for(let i = 0; i < group.students.length; i++){
            const student = await Student.findById(group.students[i])
            student.rooms.push(room.id)
            await student.save()
        }
    }catch (e){
        res.status(500).json({message:"Что то пошло не так"})
    }
})



module.exports = router