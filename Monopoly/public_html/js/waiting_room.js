
var IP_ADDRESS = 'http://localhost:3000/';

const forms = document.getElementsByTagName('form');
// Stop form from reloading the page
for (let i = 0; i < forms.length; i++) {
  forms[i].addEventListener('submit', function(event) {
    event.preventDefault(); 
  });
}

/**
 * Updates ready button when clicked
 * @param {*} btn 
 */
function toggleReady(btn) {
  let val;
    if (btn.innerText === "Not Ready") {
        btn.innerText = "Ready";
        val = "R";
    } else {
        btn.innerText = "Not Ready";
        val = "NR";
    }
    let url = IP_ADDRESS + 'set/ready/' + btn.value + '/' + val;
    fetch(url)
    .then((response) => {return response.text();})
    .then((text) => {
      console.log(text);
    })
  }
  

/**
 * Get username from URL and returns it
 */
function getUsername() {
  const urlParams = new URLSearchParams(window.location.search);
  let username = urlParams.get('username');
  return username;
}

function addRow(id, username, status, color) {
  var isMe = false;
  if (username === getUsername()){ isMe = true;}
  var replaceButton;
  var replaceColor;
  if (isMe) {
    replaceButton = '<td><button class="ready_btn" value="' + id + '" onclick="toggleReady(this)">Not Ready</button></td>\n';
    replaceColor = '<td class="color-picker">\n' +
    '<select id="' + username + '_color">\n' +
    '<option value="" disabled selected>' + color + '</option>\n' +
    '<option value="red">Red</option>\n' +
    '<option value="blue">Blue</option>\n' +
    '<option value="green">Green</option>\n' +
    '<option value="black">Black</option>\n' +
    '</select>\n' +
    '</td>\n'; 
  } else {
    replaceButton = '<td>'+ status + '</td>\n';
    replaceColor = '<td>'+ color + '</td>\n';
  }
  res =  ""+ 
  "<tr>\n" + 
  '<td id="' + username + '">'+ username + '</td>\n' + 
  '<td class="color-picker">\n' +
  '<select id="' + username + '_color">\n' +
  '<option value="" disabled selected>' + color + '</option>\n' +
  '<option value="red">Red</option>\n' +
  '<option value="blue">Blue</option>\n' +
  '<option value="green">Green</option>\n' +
  '<option value="black">Black</option>\n' +
  '</select>\n' +
  '</td>\n' +
  replaceButton + '\n' +
  '</tr>\n'; 
  return res;
}

var prevUsers = 0; 

function getLoggedInUsers() {
  let url = IP_ADDRESS + 'get/loggedInUsers';
  let yourName = getUsername();
  fetch(url)
    .then((response) => {return response.text();})
    .then((text) => {
      let list = JSON.parse(text);
      
      console.log(list);
      if (list.length >0){
        var text = "";
        for (i in list){
          let userObj = list[i];
          // console.log(userObj.color);
          text += addRow(userObj._id, userObj.username, userObj.status, userObj.color);
        }
        // console.log(text);
        document.getElementsByTagName('tbody')[0].innerHTML = text;


      }
    });
}

