const {Router} = require('express')
const auth = require("../midlevares/auth.midleware");
const router = Router()
const Teacher = require('../models/Teachers')
const Student = require('../models/Students')
const Group = require('../models/Groups')
const bcrypt = require("bcryptjs");
const Room = require('../models/Rooms')
router.get('/',auth ,async (req,res)=>{
    try{
        const {userId,userType} = req.user
        let user
        if(userType === 'Teacher'){
            user = await Teacher.findById(userId)
        }else {
            user = await  Student.findById(userId)

        }
        if(!user){
           return res.status(501).json({message:'Что пошло не так'})
        }

        res.json(user)
    }catch (e){
        res.status(501).json({message:'Что пошло не так'})
    }
})
router.post('/',auth,async (req,res)=>{
    const type = req.user.userType
    try {
        if(type === 'Student'){
            let {login,group,oldPassword,newPassword} = req.body
            const student = await Student.findById(req.user.userId)

            let candidate = null
            if(student.login !== login){
                candidate = await Student.findOne({login})
            }
            login = login.trim() ? login : student.get('login')
            group = group.trim()
            if(group) {
                const newGroup = await Group.findOne({name: group})
                if(!newGroup) return res.status(400).json({message:`Преподаватель еще не создал группу ${group}`})
                group = newGroup._id
                if(student.group && newGroup.id !== student.group.toString()){
                    await removeOldRooms(student)
                    await addNewRooms(student,newGroup)
                }else if(!student.group){
                    await addNewRooms(student,newGroup)
                }
                newGroup.students.push(student.id)
                await newGroup.save()
            }else {
                group = student.group
            }
            if(oldPassword !== "" && newPassword !==""){
                const isMatch = await bcrypt.compare(oldPassword,student.password)
                if(!isMatch) return res.status(400).json({message:"Старый пароль неверен"})
                newPassword = await bcrypt.hash(newPassword,12)
            }else {
                newPassword = student.password
            }
            if(candidate){
                return res.status(400).json({message:"Такой пользователь уже существует"})
            }
            student.login = login
            student.password = newPassword
            student.group = group
            await student.save()
            res.status(200).json({message:"ok"})
        }else {
            let {login,oldPassword,newPassword} = req.body
            const teacher = await Teacher.findById(req.user.userId)
            let candidate = null
           if(teacher.login !== login){
               candidate = await Teacher.findOne({login})
           }   
            login = login.trim() ? login : teacher.get('login')
            if(oldPassword !== "" && newPassword !==""){
                const isMatch = await bcrypt.compare(oldPassword,teacher.password)
                if(!isMatch) return res.status(400).json({message:"Старый пароль неверен"})
                newPassword = await bcrypt.hash(newPassword,12)
            }
            if(candidate){
                return res.status(400).json({message:"Такой пользователь уже существует"})
            }
        teacher.login = login
        teacher.password = newPassword
        await teacher.save()
        res.status(200).json({message:"ok"})
        }
    }catch (e){
        res.status(501).json({message:'Что пошло не так'})
    }
})

router.post('/delete:id',async (req,res)=>{
    if(req.user.userType !== 'Teacher'){
        return res.status(400).json({message:"Ошибка авторизации"})
    }
    try{
        const id = req.params.id
        const teacher = await Teacher.findById(req.user.userId)
        teacher.groups = teacher.groups.filter((group) => id !== group)
        await teacher.save()
    }catch (e){
        res.status(501).json({message:"Что то пошло не так"})
    }
})
async function removeOldRooms(student){
    let group = await Group.findById(student.group)
    const teachers = group.teachers
    let rooms = student.rooms
    for (let i = 0; i<teachers.length; i++){
        const teacher = await Teacher.findById(teachers[i])
        const room = await Room.findOne({name:`${group.name} ${teacher.login}`})
        rooms = rooms.filter(el=>el.toString() !== room.id)
    }
    student.rooms = rooms
    await student.save()
}
async function addNewRooms(student,newGroup){
    let group = await Group.findOne({name:newGroup.name})
    const teachers = group.teachers
    let rooms = [...student.rooms]
    if(group.students.length > 0){
        const student = await Student.findById(group.students[0])
        rooms = [...rooms,...student.rooms]
    }else{
        for (let i = 0; i<teachers.length; i++){
            const teacher = await Teacher.findById(teachers[i])
            const room = await Room.findOne({name:`${newGroup.name} ${teacher.login}`})
            rooms.push(room._id)
        }
    }
    student.rooms = [...rooms]
}

module.exports = router