const socket = io()
// Element 
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $message = document.querySelector('#message')

// Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
 
// option
 const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () =>{
    // new message element
const $newMessage = $message.lastElementChild
// heigth of the message
const newMessageStyle = getComputedStyle($newMessage)
const newMessageMargin = parseInt(newMessageStyle.marginBottom)
const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

// visable heigth
const visableHeight = $message.offsetHeight

// heigth of the message container
const containerHeight = $message.scrollHeight

// how to far  have  I scrolled?
const scrollOffset = $message.scrollTop + visableHeight
if (containerHeight - newMessageHeight <= scrollOffset) {
    $message.scrollTop = $message.scrollHeight
}
}

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
     //disable
    let  message= e.target.elements.message.value
  
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
        return  alert(error);
        }
        console.log("message Delivered !!");
    })
})
socket.on('message',(message)=>{
  console.log(message);
  const html = Mustache.render(messageTemplate,{
    username:message.username,
    message:message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
    })


    socket.on('locationMessage',(message)=>{
        console.log(message);
        const html = Mustache.render(locationTemplate,{
            username:message.username,
           url:message.url,
           createdAt:moment(message.createdAt).format('h:mm a')
          })
          $message.insertAdjacentHTML('beforeend',html)
        autoscroll()
    })

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

    $sendLocation.addEventListener('click',()=>{
        if (!navigator.geolocation) {
            return alert('Your browser dose not support geolocation')
        }
        navigator.geolocation.getCurrentPosition((position)=>{
            $sendLocation.setAttribute('disabled','disabled')
            
            socket.emit('sendLocation',{
                latitude : position.coords.latitude,
                longtitude:position.coords.longitude
            },()=>{
                console.log('Location shared');
                $sendLocation.removeAttribute('disabled')
              })
        })
       
    })

socket.emit('join',{username,room},(error)=>{
if (error) {
    alert(error)
    location.href = '/'
}
})