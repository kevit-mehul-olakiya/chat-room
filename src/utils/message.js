const genarateMessage = (username,text) =>{
      return {
        username,
        text,
        createdAt : new Date().getTime()
      }
}

const genarateLocationMessage = (username,url) =>{
    return {
    username,
    url,
    createdAt : new Date().getTime()
    }
}


module.exports = {
    genarateMessage,
    genarateLocationMessage
}