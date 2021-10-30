const {Router} = require("express")
const auth = require("../midlevares/auth.midleware")
const Teacher = require("../models/Teachers")
const Group = require('../models/Groups')
const Room = require('../models/Rooms')
const Student = require('../models/Students')

const router = Router()

router.get("/",auth, async (req,res)=>{
    try{
        const {userId} = req.user
        const user = await Teacher.findById(userId)
        if(!user) return res.status(400).json({message:"Ошибка авторизации"})
        let groups =[]
        for (let i = 0; i<user.groups.length;i++){
            const group = await Group.findById(user.groups[i])
            groups.push(group)
        }
        res.send(groups)

    }catch (e){
        res.status(501).json({message:"Что пошло не так"})
    }
})

router.post("/add",auth, async (req,res)=>{
    try{
        const group = req.body.group
        const user = await Teacher.findById(req.user.userId)
        const candidate = await Group.findOne({name:group})
        if(candidate && user.groups.includes(candidate.id)){
            return res.status(400).json({message:"Группа уже добавлена"})
        }
        let newGroup = candidate
        if (!candidate){
            newGroup = new Group({name:group,teachers:[user.id],students:[]})
        }
        const groups = user.groups
        const room = await new Room({name:`${req.body.group} ${user.login}`})
        const rooms = user.rooms
        rooms.push(room.id)
        user.rooms = rooms
        groups.push(newGroup.id)
        await addStudents(room.id,newGroup)
        user.update({groups})
        newGroup.save()
        user.save()
        room.save()
        res.send(newGroup).status(200).json({message:'ok'})

    }catch (e){
        res.status(501).json({message:"Что пошло не так"})
    }
})
router.get('/delete:id',auth,async(req,res)=>{
    try{
        const id = req.params.id.split(':')[1]
        const user = await Teacher.findById(req.user.userId)
        let groups = user.groups
        groups = groups.filter((groupId)=>groupId.toString() !== id)
        user.groups = groups
        await user.save()
        res.status(200).json({message:"ok"})
    }catch (e){
        res.status(501).json({message:"Что то пошло не так"})
    }
})

async function addStudents(id,group){
    const students = group.students
    for (let i; i<students.length; i++){
        const student = await Student.findById(students[i])
        const rooms = [...students.rooms]
        rooms.push(id)
        student.rooms = [...rooms]
        await student.save()
    }

}


module.exports = router