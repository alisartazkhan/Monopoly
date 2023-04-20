
function displayFunction(){
    for (var i = 0; i < 16; i++){
        var id = i.toString(10);
        displayMessages(id);
    }
}

function restartFunction(){
    createOriginalSpaces();
    displayFunction();

}

function createOriginalSpaces() {
    /*
	Purpose: This function is called to create the post request and send
	the information to the server.js to create the mongoose Item element.
        Params: None
        Return: None
	*/
    
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add/space/create", true);

    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = () => { // Call a function when the state changes.
    if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
    // Request finished. Do processing here.
  }
}

    
    xhttp.send();
    console.log("start");

    
    }


function displayMessages(id) {
    fetch('/get/spaces/'+id)
        .then((res) =>{
            //console.log(res);
            return res.text()})
        .then((res) => {
            console.log(res);
            var obj = JSON.parse(res);
            console.log(obj);
            var text = obj[0].name;
            text = text + '\n' + obj[0].cost;
            document.getElementById(id).innerText = text;
            document.getElementById(id).style.backgroundColor = obj[0].color;
                    }  
        )
    }


// displays property information
const infoButton = document.querySelector('info-button');
const infoPopup = document.querySelector('info-popup');
const closeButton = document.querySelector('.close-button');
let isPopupVisible = false; // Keep track of popup visibility state

function togglePopup() {
    isPopupVisible = !isPopupVisible; // Toggle the visibility state
    infoPopup.classList.toggle('visible', isPopupVisible); // Toggle the 'visible' class based on state
}

infoButton.addEventListener('click', togglePopup);
closeButton.addEventListener('click', togglePopup);


/**
 * Updates the board.html with player information from the server
 */
function getPlayers(){
    console.log(getCurrentUrlSearchParams());
    let url = '/get/players';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if( xhr.status == 200){
                let items = JSON.parse(xhr.responseText);
                document.getElementById('players').innerHTML = '';
                const outputArea = document.getElementById('players');
                let searchParams = getCurrentUrlSearchParams();
                let currentPlayerName = searchParams.get('username');
                console.log(items);
                let currentPlayer = findUserName(items, currentPlayerName)[0];
                console.log(currentPlayer);

                // puts the current player at the top
                const div = document.createElement('div');
                    div.classList.add("player-info");
                    div.id = currentPlayer.color + '-player';
                    div.innerHTML = `
                    <h2>${currentPlayer.username}</h2>
                    <p class="balance"> <span class="dollar-sign">$</span>1000</p>
                    <p>Properties: ${currentPlayer.listOfOwnedCards}</p>
                    `;
                    outputArea.appendChild(div);

                // puts the remaining players
                items.forEach(item => {
                    if(item.username !== currentPlayerName){
                        const div = document.createElement('div');
                        div.classList.add("player-info");
                        div.id = item.color + '-player';
                        div.innerHTML = `
                        <h2>${item.username}</h2>
                        <p class="balance"> <span class="dollar-sign">$</span>1000</p>
                        <p>Properties: ${item.listOfOwnedCards}</p>
                        `;
                       
                        outputArea.appendChild(div);
                    }
                   
                });

            }
        }
    }

}

// getPlayers();


function getCurrentUrlSearchParams(){
    const queryString = window.location.search;
    return new URLSearchParams(queryString);
}

function findUserName(players, username){
    let object = [];
    for(let i=0; i< players.length; i++){
        if (players[i].username === username){
            object[0] = players[i]
            break;
        };
    }
    return object;
}

