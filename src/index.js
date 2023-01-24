const express = require('express')
const path = require('path')
const  http = require('http')
const socket  = require('socket.io')
const Filter =require('bad-words')
const { genarateMessage,genarateLocationMessage } = require('./utils/message')
const {addUsers,getUsers,removeUser,getUserInRoom} = require('./utils/users')
 
const app = express()
const PORT = 3000 || process.env.PORT
const server = http.createServer(app)
 const io = socket(server)
const publicDirPath = path.join(__dirname, '../public')
app.use(express.static(publicDirPath))



io.on('connection',(socket)=>{
    console.log('New Websocket connected ! ');
 
    socket.on('join',({username,room},callback)=>{
  const {error, user} =    addUsers({id:socket.id,username,room})
  if (error) {
    return callback(error)
  }
        socket.join(user.room)

        socket.emit('message', genarateMessage('Admin','Welcome !'))
        socket.broadcast.to(user.room).emit('message',genarateMessage('Admin',`${user.username} has joined !`))
        io.to(user.room).emit('roomData',{
          room:user.room,
          users:getUserInRoom(user.room)
  
        })
        callback()
    })
  socket.on('sendMessage',(message,callback)=>{
    const user =getUsers(socket.id)
    const filter  =new  Filter()
    if (filter.isProfane(message)) {
        return callback('Profanity is not allowed')
    }

    io.to(user.room).emit('message',genarateMessage(user.username,message))
    callback()
  })
  socket.on('sendLocation',(coords,callback)=>{
    const user = getUsers(socket.id)
    io.to(user.room).emit('locationMessage',genarateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longtitude}`))
    callback()
  })
  socket.on('disconnect',()=>{
    const user = removeUser(socket.id)
    if(user){
      io.to(user.room).emit('message',genarateMessage('Admin',`${user.username} has left !`))
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUserInRoom(user.room)

      })
    }
   
})
})



server.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
})