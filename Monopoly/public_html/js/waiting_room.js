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
  // adding loader
  document.getElementById('ready_btn').style.display = 'none';
  document.getElementById('loader').style.display = 'flex';
  document.getElementById('welcome_msg').innerText = 'Waiting for other players...';

  var username = getUsername();
  let url = IP_ADDRESS + 'set/ready/' + username;
  fetch(url)
  .then((response) => {return response.text();})
  .then((text) => {
    // console.log(text);
  });
  // Check if everyone is ready every second
  let intervalid = setInterval(function() {
    isEveryoneReady().then((everyoneReady) => {
      console.log("Main " + everyoneReady);
      if (everyoneReady === true) {
        window.location.href = `/board.html?username=${encodeURIComponent(username)}`;
        clearInterval(intervalid);
      }
    });
  }, 1000);
}

  

async function isEveryoneReady() {
  let url = IP_ADDRESS + 'isReady/';
  const response = await fetch(url);
  const text = await response.text();
  console.log("EveryoneReady: " + text);
  if (text === 'true') {
    return true;
  } else {
    return false;
  }
}




/**
 * Get username from URL and returns it
 */
function getUsername() {
  const urlParams = new URLSearchParams(window.location.search);
  let username = urlParams.get('username');
  return username;
}


function loadWaitingRoom(){
  var username = getUsername();
  document.getElementById('welcome_msg').innerText = "Welcome, " + username + "!";
  let url = IP_ADDRESS + 'get/user_color/' + username;
  fetch(url)
  .then((response) => {return response.text();})
  .then((text) => {
    let color = text;
    // console.log(color);
    document.getElementById('user_color').innerHTML = `<b>${color}</b>`;    
    document.getElementById('user_color').style.color = color;
  });
}