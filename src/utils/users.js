// addUsers, getUsers, removeUser, getUserInRoom
const users = []
const addUsers = ({id,username,room}) =>{
    // Clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error : 'username and room is required !'
        }
    }
    //Check existing User
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })
    // Ualidate username
    if (existingUser) {
        return {
            error: 'username is already taken'
        }
    }
// store user
const user ={id ,username,room}
users.push(user)
return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>user.id===id)
    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

const getUsers= (id) =>{
    // my code 
//  const user =   users.find((user)=> user.id ===id)
// return user || undefined
return  users.find((user)=> user.id ===id)
}

const getUserInRoom = (room) =>{
    // my code
    // const roomUser = []
    // for (let i = 0; i < users.length; i++) {
    //   if (users[i].room === room) {
    //     roomUser.push(users[i])
    //   }   
    // }
    // return roomUser
    return users.filter((user)=>user.room === room)
}

module.exports = {
    addUsers,
    getUsers,
    removeUser,
    getUserInRoom
}
