
var IP_ADDRESS = 'http://localhost:3000/';

var oldLocs = []

async function setMetaData(){
    const playerList = await getPlayerList();
    const playerCount = getPlayerCount(playerList);
    oldLocs = Array(playerCount).fill(0);
    console.log(oldLocs)

}

  let pList = ["index 0"];
  let newLoc = 0;


let tList = [];
async function fetchCardsFromServer(){
    const cards = await fetch('/get/cards/');
    const data = await cards.json();
    return data;
}


/**
 * sends the updated player turn data to the server
 *  IMPORTANT
 * WE WILL UPDATE THE TURN IN THE SERVER ONLY WHEN IT CHANGES. 
 * If we repeatedly call updateTurn, mongodb throws an error.
 * DON'T CALL IT INSIDE setInterval()
 */
function updateTurn(){
    let url = '/update/turn';
    let p = fetch(url, {
        method: 'POST',
        body: JSON.stringify({turn: playersTurn}),
        headers: {"Content-Type": "application/json"}
    });
    p.then(response => {
        console.log(response);
    });
    p.catch(() => { 
        alert('something went wrong while updating turn');
    });

}

//setInterval(updateTurn, 2000);

 
function fetchTurnFromServer(){
    // console.log('fetching turn info');
    return fetch('/get/turn')
    .then(data => {
        return data.json();
    })
    .then(turn => {
        console.log("turn:" + turn)
        return parseInt(turn);
    })
    .catch(error => {
    // Handle any errors here
    console.error("ERROR: fetching turn id from server");
  });
}



/**
 *  populates the pList with all players if the pList doesn't have any players
 *  or it just updates the existing player data
 * @param {} data 
 */
function createPlayerList(data){
    // assuming that the pList is either empty or pList =  ["index 0"] at this point;
    let createNewPlayers = (pList.length <= 1); 
    for(let i=0; i < data.length; i++){
        let p = data[i];
        if(createNewPlayers){
            let newPlayer = new Player(p.id);
            pList.push(newPlayer);
        }else{
            let existingPlayer = getPlayerById(p.id);
            existingPlayer = {
                money: p.balance,
                pos: p.position,
                propList: p.listOfCardsOwned
            
            }
        }
        
    }
    
}

function getPlayerById(id){
    if(pList.length <= 1){
        console.log('player list is emplty');
        return
    }
    for(let i =1; i < pList.length; i++){
        let p = pList[i];
        if(p.id == id){
            return p;
        }
    }
    console.log('invalid search ID');
    return null;
}




function buyProperty(){
    if (currentProperty !== null && myPlayerObject !== null){
        var newBalance = myPlayerObject.balance - currentProperty.price
        console.log(newBalance)
        updatePlayerAndCard(myPlayerObject.id, newBalance, currentProperty.id);   
        postTurnValue(turn + 1, count);
    }
}

function dontBuyProperty(){
    if (turn !== null && count !== null){
        postTurnValue(turn + 1, count);
    }
}


var currentProperty = null;
var myPlayerObject = null;
var turn = null;    // turnID
var count = null;   // player count

async function rollDice(){
    var UserIDData = getUsername();
    var playersTurn = await fetchTurnFromServer();
    turn = playersTurn;
    console.log(playersTurn)
    var myID = await fetchClientIDFromServer(UserIDData);

    myID = parseInt(myID,10);
    const playerList = await getPlayerList();
    const playerCount = getPlayerCount(playerList);
    count = playerCount;
    console.log("My ID is: " + myID);
    if (playersTurn == myID) {
        //await incrementTurnPromise();
        for (i in playerList){
            let potentialPlayer = playerList[i];
            
            if (potentialPlayer.id == myID){
                console.log(potentialPlayer)
                var d1 = Math.floor(Math.random() * 6)+1;
                var d2 = Math.floor(Math.random() * 6)+1;

                console.log(d1+d2);

                var newLocation = (potentialPlayer.position + d1 + d2) % 32
                console.log("new location: " + newLocation)

                checkProperty(potentialPlayer, newLocation)
                updatePlayerLocation(myID, newLocation); 
            }
        }

        // wait 5s to buy property and then increment the turn
        // setTimeout(() => {
        //     postTurnValue(playersTurn + 1, playerCount);
        //   }, 20000);
          
      } else {
        console.log("not my turn");
      }
}


function getProperty(index){
    return fetch(IP_ADDRESS + 'get/property/' + index)
    .then((response) => {return response.text();})
    .then((text) => {return JSON.parse(text);})
    .catch((err) => {console.log("ERROR: getting property obj from server using ID")})
}



async function checkProperty(player,newLocation){
    getProperty(newLocation)
    .then(data => {
        // assign the resolved value to a variable
        const curProperty = data;
        console.log(curProperty);
        if (curProperty.ownerID == null && curProperty.price > 0){
            document.getElementById('buyProp').style.display =  'flex';
            console.log("this property is for sale")

            currentProperty = curProperty;
            myPlayerObject = player;
        }
        else {
            console.log("this property isnt for sale");
            document.getElementById('buyProp').style.display =  'none';
            postTurnValue(turn + 1, count);

        }
    })
    .catch(err => console.log("ERROR: getting property obj from server using ID"));

}

function updatePlayerAndCard(playerID, newBalance, propertyID){
    fetch('update/playerAndCard/' + playerID + '/' + newBalance + '/' + propertyID)
    .then((response) => {return response.text();})
    .then((text) => {console.log(text);})
    .catch((err) => {console.log("Cant update player and card info in server")});
}

async function updatePlayerLocation(myID, newLocation){
    fetch('update/location/' + myID + '/' + newLocation)
    .then((response) => {return response.text();})
    .then((text) => {console.log(text);})
    .catch((err) => {console.log("Cant update player location in server")});
}


async function postTurnValue(val, playerCount){
    if (val >= playerCount){
        val = 0;
    }
    fetch(IP_ADDRESS + 'update/turn/' + val)
    .then((response) => {return response.text();})
    .then((text) => {
        console.log("new turn" + val);
        console.log(text);})
    .catch((err) => {console.log("cant update player turn")})
}

/**
 * Get username from URL and returns it
 */
function getUsername() {
    const urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username');
    return username;
  }


async function fetchClientIDFromServer(username){
    const response = await fetch('/get/userID/'+username);
    const text = await response.text();
    console.log("Server output for ID: " + text);
    return text;
}


async function displayNewLocation(){
    console.log("display location")
    //console.log("should display everyones location")
    var newLocs = await generateNewLocs();
    //console.log(newLocs)
    //console.log(oldLocs)
    for (let i in newLocs){
        let newLoc = newLocs[i]
        let oldLoc = oldLocs[i]
        //console.log("newLoc: "+newLoc)
        //console.log("oldLoc: "+oldLoc)
        if (newLoc != oldLoc){
            //console.log("need to change location")
            var plusOne = parseInt(i)+1

            var curLocString = oldLoc.toString()+"p"+plusOne.toString();
            console.log(curLocString)
            document.getElementById(curLocString).innerText = ""
            //console.log("plusONe:" + plusOne)
            var newLocString = newLoc.toString()+"p"+plusOne.toString();
            //console.log("NLS"+newLocString)
            document.getElementById(newLocString).innerText = i
        }
    }
    oldLocs = newLocs
}

setInterval(displayNewLocation,1000)

async function generateNewLocs(){
    var list = await getPlayerList();
    var retList = []
    for (let i in list){
        let player = list[i]
        retList.push(parseInt(player.position))
    }
    return retList
}

function displayInitialLocations(){
    document.getElementById("0p1").innerText = "1";
    document.getElementById("0p2").innerText = "2";
    document.getElementById("0p3").innerText = "3";
    document.getElementById("0p4").innerText = "4";

}


function incrementTurn(){
    incrementPlayerNum();
    //while (pList[playersTurn].money <= 0){
     //   incrementPlayerNum();
    //}
    //document.getElementById("pTurn").innerText = playersTurn
}



function incrementPlayerNum(){
    playersTurn += 1
    if (playersTurn > getPlayerCount()){
        playersTurn = 1
    }
    //.log(playersTurn);
}

async function updatePlayersTurnDisplay(){
    var turnID = await fetchTurnFromServer();
    fetch(IP_ADDRESS + 'get/username/' + turnID)
    .then((response) => {return response.text();})
    .then((text) => {
        console.log("Username from server: " + text);
        document.getElementById("pTurn").innerText = text;})
    .catch((err) => {console.log("ERROR: cant get username using userID from server")})
}

//setInterval(updatePlayersTurnDisplay, 1000);

function getPlayerCount(list) {
    return list ? list.length : 0; // Check if list is defined before accessing its length property
  }
  

function getPlayerList() {
    return fetch(IP_ADDRESS + 'get/players')
      .then((response) => response.text())
      .then((text) => JSON.parse(text))
      .catch((err) => console.log("Can't get players list from server."));
  }
  




















































/*function displayFunction(){
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
*/

// displays property information
const infoButton = document.querySelector('#info-button');
const infoPopup = document.querySelector('#info-popup');
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
                // console.log(items);
                let currentPlayer = findUserName(items, currentPlayerName)[0];
                // console.log(currentPlayer);

                // puts the current player at the top
                const div = document.createElement('div');
                    div.classList.add("player-info");
                    div.id = currentPlayer.color + '-player';
                    div.innerHTML = `
                    <h2>${currentPlayer.username}</h2>
                    <p class="balance"> <span class="dollar-sign">$</span>${currentPlayer.balance}</p>
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
                        <p class="balance"> <span class="dollar-sign">$</span>${currentPlayer.balance}</p>
                        <p>Properties: ${item.listOfOwnedCards}</p>
                        `;
                       
                        outputArea.appendChild(div);
                    }
                   
                });

            }
        }
    }

}

getPlayers();


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



function helpPage(){
    window.location.href = './help.html';
}