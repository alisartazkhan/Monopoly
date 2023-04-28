//boardfunctions

var IP_ADDRESS = 'http://localhost:3000/';

var oldLocs = []

async function setMetaData(){
    const playerList = await getPlayerList();
    const playerCount = getPlayerCount(playerList);
    oldLocs = Array(playerCount).fill(1);
    console.log(oldLocs)
    displayNewLocation();

}




  //var playersTurn = 1;
  //let curPlayersTurn = playersTurn;
    // let pList = ["index 0",new Player(1),new Player(2),new Player(3),new Player(4)] // create player list
  let pList = ["index 0"];
  let newLoc = 0;
  //displayInitialLocations();
//   let tList = [
//     new Tile(0,0,0),
//     new Tile(1,60,2),
//     new Tile(2,0,0),
//     new Tile(3,60,4),
//     new Tile(4,200,50),
//     new Tile(5,100,6),
//     new Tile(6,100,6),
//     new Tile(7,120,8),
//     new Tile(8,0,0), 
//     new Tile(9,140,10),
//     new Tile(10,140,10),
//     new Tile(11,160,12),
//     new Tile(12,200,50),
//     new Tile(13,180,14),
//     new Tile(14,180,14),
//     new Tile(15,200,16),
//     new Tile(16,0,0), 
//     new Tile(17,220,18),
//     new Tile(18,220,18),
//     new Tile(19,240,20),
//     new Tile(20,200,50),
//     new Tile(21,260,22),
//     new Tile(22,260,22),
//     new Tile(23,280,24),
//     new Tile(24,0,0), 
//     new Tile(25,300,26),
//     new Tile(26,300,26),
//     new Tile(27,320,28),
//     new Tile(28,200,50),
//     new Tile(29,350,35),
//     new Tile(30,0,0),
//     new Tile(31,400,50)]
  //pList[3].money = 0

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
        //console.log("turn:" + turn)
        return parseInt(turn);
    })
    .catch(error => {
    // Handle any errors here
    console.error("ERROR: fetching turn id from server");
  });
}

//setInterval(fetchTurnFromServer, 2000);




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


/**
 * sends the updated player data to the server
 */
function updatePlayers(){
    // console.log('sending player data to the server')
    let url = '/update/players';   
    let jsonPlayersToSend = [];
    for(let i=1; i< pList.length; i++){
        let player = pList[i];
        let obj = {
            balance: player.money,
            id: player.id,
            position: player.pos,
            listOfCardsOwnded: player.propList
        }
        jsonPlayersToSend.push(obj);
    }

    // console.log(jsonPlayersToSend);
    const data = JSON.stringify(jsonPlayersToSend);
    let p = fetch(url, {
        method: 'POST',
        body: data, // skips "index 0" in the pList
        headers: {"Content-Type": "application/json"}
    });
    p.then(response => {
        // console.log(response);
      });
    p.catch(() => { 
        alert('something went wrong while updating players');
    });

}
//setInterval(updatePlayers, 2000);




/**
 * sends the updated card data to the server
 */
function updateCards(){
    let url = '/update/cards';

    const tileObjects = tList.map(tile => {
        return {
            id: tile.id,
            price: tile.price,
            rent: tile.baseRent,
            ownerID: tile.owner
        };
      });
    let p = fetch( url, {
        method: 'POST',
        body: JSON.stringify(tileObjects),
        headers: {"Content-Type": "application/json"}
    });
    p.then(response => {
        // console.log(response);
        });
      p.catch(() => { 
        alert('something went wrong while updating cards');
    });
}

//setInterval(updateCards, 2000);
  

  function buyProp(){
    if (tList[newLoc].owner == 0 && tList[newLoc].price > 0){
        pList[curPlayersTurn].money = pList[curPlayersTurn].money - tList[newLoc].price;
        var moneyString = "p"+curPlayersTurn.toString()+"money";
        console.log(moneyString)
        document.getElementById(moneyString).innerText = pList[curPlayersTurn].money
        tList[newLoc].owner = curPlayersTurn;
        var displayString = "p"+curPlayersTurn.toString()+"props";
        var propString = " " + newLoc.toString()
        document.getElementById(displayString).innerText += propString

    }
    else {
        console.log("property cannot be bought")
    }
    console.log("porp bot")
    
}

function incrementTurnPromise() {
    return new Promise(resolve => {
      incrementTurn();
      resolve();
    });
  }

async function rollDice(){
    // disable roll dice button
    document.getElementById("roll_dice_btn").disabled = true;

    var UserIDData = getUsername();
    var playersTurn = await fetchTurnFromServer();
    //console.log("It is now player "+playersTurn+'s turn')
    var myID = await fetchClientIDFromServer(UserIDData);
    myID = parseInt(myID,10);
    const playerList = await getPlayerList();
    const playerCount = getPlayerCount(playerList);
    console.log("My ID is: " + myID);
    if (playersTurn == myID) {
        //await incrementTurnPromise();
        for (i in playerList){
            let potentialPlayer = playerList[i];
            
            if (potentialPlayer.id == myID){
                //console.log(potentialPlayer)
                var d1 = Math.floor(Math.random() * 6)+1;
                var d2 = Math.floor(Math.random() * 6)+1;
                var total = d1 + d2


                var newLocation = (potentialPlayer.position + total) % 32

                if (newLocation < potentialPlayer.position){
                  collectGo(potentialPlayer.id)
                }

                if (newLocation == 24){
                    
                  newLocation = 8
                }


                //console.log("new location"+newLocation)
                console.log("Rolled a "+total+ " to put them at "+ newLocation);


                updatePlayerLocation(myID, newLocation);
                await checkProperty(potentialPlayer, newLocation)
            }


        }

        // enable roll dice button
        document.getElementById("roll_dice_btn").disabled = false;
        
        postTurnValue(playersTurn+1, playerCount);

    } else {
        console.log("not my turn, its " + " turn");

        // enable roll dice button
        document.getElementById("roll_dice_btn").disabled = false;
    }
}


function collectGo(userID) {
  fetch(IP_ADDRESS + 'update/balance/go/' + userID)
  .then((response) => {return response.text();})
  .catch((err) => {console.log("ERROR: adding money from passing go")})
}

/**
 * Fetches the JSON card OBJ
 * @param {} index 
 * @returns 
 */
function getProperty(index){
    return fetch(IP_ADDRESS + 'get/property/' + index)
    .then((response) => {return response.text();})
    .then((text) => {return JSON.parse(text);})
    .catch((err) => {console.log("ERROR: getting property obj from server using ID")})
}


/**
 * Checks if property is available and for sale and allows user to buy prop or pay rent
 * @param {*} player 
 * @param {*} newLocation 
 * @returns {Promise<boolean>} resolves to true if the user chooses to buy the property, false otherwise
 */
async function checkProperty(player, newLocation) {
    return getProperty(newLocation)
      .then(data => {
        // assign the resolved value to a variable
        const curProperty = data;
        console.log(curProperty);
        // checking if property is for sale
        if (curProperty.ownerID == null && curProperty.price > 0) {
          console.log("this property is for sale")
          document.getElementById('buyProp').style.display = 'inline-block'; // display the prompt
          return new Promise((resolve, reject) => {
            
            document.getElementById('yes_btn').addEventListener('click', () => {
              console.log('User chose to buy the property');
              document.getElementById('buyProp').style.display = 'none'; // hide the prompt
              resolve(true);
                let playerID = player.id
                let newBalance = player.balance - curProperty.price
                let propertyID = curProperty.id
                updatePlayerAndCard(playerID, newBalance, propertyID)
                console.log("property was bought")
            });
            
            document.getElementById('no_btn').addEventListener('click', () => {
              console.log('User chose not to buy the property');
              document.getElementById('buyProp').style.display = 'none'; // hide the prompt
              resolve(false);
            });

          });
        } else {
          console.log("this property isn't for sale");
          document.getElementById('buyProp').style.display = 'none';
          if (curProperty.price == 0){
            console.log("This is not a property")
          }
          else if(curProperty.ownerID != player.id){
                console.log("you owe rent")
                let newBalance = player.balance - getRent(curProperty)
                console.log(newBalance)
                fetch("/update/balance/" + curProperty.ownerID + '/' + player.id + '/' + getRent(curProperty))
                .then((response) => {return response.text();})
                .then((text) => {console.log("You paid rent to ownerID: " + curProperty.ownerID) })
                .catch(() => {console.log('cant pay rent')})


          }
          else {
            console.log("you own this prop")

          }
          return Promise.resolve(false);

        }
      })
      .catch(err => {
        console.log("ERROR: getting property obj from server using ID")
        return Promise.reject(err);
      });
  }

  function getRent(prop){
    return prop.rent;
  }
    
    function updatePlayerAndCard(playerID, newBalance, propertyID){
        fetch('update/pac/' + playerID + '/' + newBalance + '/' + propertyID)
        .then((response) => {return response.text();})
        .then((text) => {console.log(text);})
        .catch((err) => {console.log("Cant update player and card info in server")});
    }



    function waitForClick(buttonId1, buttonId2) {
        return new Promise(resolve => {
          const button1 = document.getElementById(buttonId1);
          const button2 = document.getElementById(buttonId2);
          button1.addEventListener('click', () => resolve(button1), { once: true });
          button2.addEventListener('click', () => resolve(button2), { once: true });
        });
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
    //console.log("should display everyones location")
    var [newLocs, colors] = await generateNewLocs();
    //console.log(newLocs)
    //console.log(oldLocs)
    for (let i in newLocs){
        let color = colors[i]
        let newLoc = newLocs[i]
        let oldLoc = oldLocs[i]
        //console.log("newLoc: "+newLoc)
        //console.log("oldLoc: "+oldLoc)
        if (newLoc != oldLoc){
            //console.log("need to change location")
            var plusOne = parseInt(i)+1

        var curLocString = oldLoc.toString()+"p"+plusOne.toString();
        //document.getElementById(curLocString).innerText = ""
        document.getElementById(curLocString).innerHTML = ""

        //console.log("plusONe:" + plusOne)
        var newLocString = newLoc.toString()+"p"+plusOne.toString();
        //console.log("NLS"+newLocString)

        document.getElementById(newLocString).innerHTML = '<div style="height: 10px; display: inline-block; margin-top: 2px ; width: 10px; background-color: '+color + '" ></div>'
        }
    }


    oldLocs = newLocs
    

}

setInterval(displayNewLocation,1000)

async function generateNewLocs(){
    var list = await getPlayerList();
    var retList = []
    var colorList = []
    for (let i in list){
        let player = list[i]
        retList.push(parseInt(player.position))
        colorList.push(player.color)
    }
    return [retList, colorList]
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

function fetchUsernameFromServer(userId) {
    return new Promise((resolve, reject) => {
      fetch(IP_ADDRESS + 'get/username/' + userId)
        .then(response => response.text())
        .then(text => resolve(text))
        .catch(err => reject(err));
    });
  }
  
  async function updatePlayersTurnDisplay() {
    try {
      var turnID = await fetchTurnFromServer();
      var username = await fetchUsernameFromServer(turnID);
      //console.log("Username from server: " + username);
      document.getElementById("pTurn").innerText = username;
    } catch (err) {
      console.log("ERROR: can't get username using userID from server");
    }
  }
  

setInterval(updatePlayersTurnDisplay, 1000);

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
    // console.log(getCurrentUrlSearchParams());
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
                    <p>Properties: ${currentPlayer.listOfCardsOwned.sort((a, b) => a - b).join(', ')}</p>`;

                    outputArea.appendChild(div);

                // puts the remaining players
                items.forEach(item => {
                    if(item.username !== currentPlayerName){
                        const div = document.createElement('div');
                        div.classList.add("player-info");
                        div.id = item.color + '-player';
                        div.innerHTML = `
                        <h2>${item.username}</h2>
                        <p class="balance"> <span class="dollar-sign">$</span>${item.balance}</p>
                        <p>Properties: ${item.listOfCardsOwned.sort((a, b) => a - b).join(', ')}</p>
                        `;
                       
                        outputArea.appendChild(div);
                    }
                   
                });

            }
        }
    }

}

setInterval(getPlayers, 1000);


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