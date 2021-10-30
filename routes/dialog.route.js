const {Router} = require('express')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const router = Router()

router.get('/t',(req,res)=>{

})
module.exports = router