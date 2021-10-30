const {Router} = require('express')
const router = Router()
const Student = require('../models/Students')
const Teacher = require('../models/Teachers')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.post('/login',async (req,res)=>{
    try {
        const {login,password} = req.body
        let candidate = await Student.findOne({login})
        if(!candidate){
             candidate = await Teacher.findOne({login})
        }
        if(!candidate){
            return res.status(400).json({message:"Пользователь с таким логином не существует"})
        }
        const isMatch = bcrypt.compareSync(password,candidate.password)
        if(!isMatch){
            return res.status(400).json({message:"Вы ввели неверный пароль"})
        }
        const token= jwt.sign(
        {userId:candidate._id,userType:candidate.type},
        "secretWorld",
            {expiresIn: '1h'}
        )
        res.send({token,userId:candidate.id,userType:candidate.type})


    }catch (e){
        res.status(500).json({message:"Что то пошло не так"})
    }
})

router.post('/register',async (req,res)=>{
    try{
        const {login,password,repeatPassword,type} = req.body
        const candidate = type === "Student" ? await Student.findOne({login}):await Teacher.findOne({login})
        if(candidate){
            return res.status(400).json({message:"Такой пользователь уже существует"})
        }
        if(repeatPassword !== password){
            return res.status(400).json({message:"Пароли не совпадают"})
        }
        const pass = bcrypt.hashSync(password,12)
        const user = type === "Student"  ? new Student({login,password:pass,group:req.body.group}):  new Teacher({login,password:pass})
        await user.save()
        res.status(200).json({message:"Пользователь успешно создан"})

    }catch (e){
        res.status(500).json({message:"Что то пошло не так"})
    }
})


module.exports = router