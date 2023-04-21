// var socket = io();
// socket.emit('wantData');
// socket.on('');

function dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

const locationStaticEle = document.getElementById('locationStatic');
const birthdayEle = document.getElementById('birthday');
const locationEle = document.getElementById('location');
const descriptionEle = document.getElementById('description');

if (user.Location != null) {
  locationStaticEle.innerHTML = user.Location;
  locationEle.innerHTML = user.Location;
}

if (user.Birthday != null) birthdayEle.innerHTML = dateToYMD(new Date(user.Birthday));

if (user.Description != null) descriptionEle.innerHTML = user.Description;

const myModal = document.getElementById('edit-modal')
const myInput = document.getElementById('edit-button')

myModal.addEventListener('shown.bs.modal', () => {
  myInput.focus()
})