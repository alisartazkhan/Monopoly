/*
Name: Ali Sartaz Khan
Course: CSc 337
Description:

*/

var IP_ADDRESS = 'http://localhost:3000/';

var oldLocs = []
let gameEnded = false;
let winner = null;

/*
purpose: sets the metadata when the page is loaded. sets the global variables and
constants needed by the client and displays the original game state.
params: none
return: none
*/
async function setMetaData(){
    const playerList = await getPlayerList();
    const playerCount = getPlayerCount(playerList);
    oldLocs = Array(playerCount).fill(1);
    console.log(oldLocs)
    displayNewLocation(null);
    displayPlayers(null);
    updatePlayersTurnDisplay();

}

/*
Socket created and listens for updates to turn, players, and cards
has cases for updating balances, paying rent, moving after dice roll, etc.
*/
const socket = new WebSocket('ws://localhost:3080');
socket.addEventListener('open', function (event) {
    console.log('WebSocket connection established');
  });
  
  socket.addEventListener('message', function (event) {
    const message = JSON.parse(event.data);
    console.log('Received message from server:', message);
    switch(message.type){
        case 'update balances and owned cards':
            console.log('time to update balances and owned cards');
            displayPlayers(message.players);
            updateLog(message.log);
            isGameOver(message.players);
            break;
        case 'update turn':
            console.log('time to update turn');
            updatePlayersTurnDisplay();
            break;
        case 'update balance go':
            console.log('time to update balance go');
            displayPlayers(message.players);
            updateLog(message.log);
            break;
        case 'update balance rent paid':
            console.log('time to balance rent');
            displayPlayers(message.players);
            updateLog(message.log);
            isGameOver(message.players);

            break;
        case 'update location after dice roll':
            console.log('time to update location after dice roll');
            displayNewLocation(message.players);
            
            break;
        
    }
  });
  
  //closes socket
  socket.addEventListener('close', function (event) {
    console.log('WebSocket connection closed');
  });



/////////////////////////////////////////////

/*
purpose: checks if game is over by seeing if only one player has a
positive balance and changes the html to display game over message.
params: players: the list of players
return: none
*/
async function isGameOver(players){
    let gameOver = true;
    let count = 0;
    for (i in players){
        let player = players[i];
        if (player.balance > 0) {
            winner = player.username;
            count++;
        }
    }
    console.log(count);

    // there is only one player with a balance over zero
    if (count == 1){
        gameEnded = true;
        updateLog(`${winner} is the winner!`);
        document.getElementsByTagName('table')[0].style.display = 'none';
        document.getElementById('restart').style.display = 'inline-block';
    }


}

/*
purpose: Updates the log by adding the most recent action to the list
and updating it
params: newLog: th element representing the addition to the log
return: none
*/
function updateLog(newLog){
    // Create a new p element with the newLog text
    const newLogElement = document.createElement('p');
    newLogElement.textContent = newLog;
  
    // Append the new p element to the game-log element
    document.getElementById('game-log').appendChild(newLogElement);
  }

//set global variables
let pList = ["index 0"];
let newLoc = 0; 
let tList = [];

/*
purpose: checks if game is over by seeing if only one player has a
positive balance and changes the html to display game over message.
params: players: the list of players
return: none
*/
async function fetchCardsFromServer(){
    const cards = await fetch(IP_ADDRESS + 'get/cards/');
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

 
/*
purpose: fetches the id turn from the server
params: none
return: the integer representing the turn id
*/
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



/*
purpose: gets player object of given playerIID
params: id of player searching for
return: player object
*/
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


/*
purpose: sends the updated player data to the server
params: none
return: none
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
    let p = fetch(IP_ADDRESS + url, {
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




/*
purpose: sends the updated card data to the server
params: none
return: none
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
  
/*
purpose: locally adjusts user and card data to represent client buying property
currenty located at
params: none
return: none
*/
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

/*
purpose: calls increment turn function and to move to next turn properly
params: none
return: none
*/
function incrementTurnPromise() {
    return new Promise(resolve => {
      incrementTurn();
      resolve();
    });
  }

/*
purpose: function that runs on click of rolldice button to call functions that
represent a players turn
params: none
return: none
*/
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
            
            if (potentialPlayer.id == myID && potentialPlayer.balance > 0){
                //console.log(potentialPlayer)
                var d1 = Math.floor(Math.random() * 6)+1;
                var d2 = Math.floor(Math.random() * 6)+1;
                var total = d1 + d2
                var newLocation = (potentialPlayer.position + total) % 32

                if (newLocation < potentialPlayer.position){
                  collectGo(potentialPlayer.id)
                }

                if (newLocation == 24){      // send player to jail
                    
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
        
        postTurnValue(playersTurn+1, playerCount, playerList);

    } else {
        console.log("not my turn, its " + " turn");

        // enable roll dice button
        document.getElementById("roll_dice_btn").disabled = false;
    }
}


/*
purpose: updates the balance of player given ID when passing go
params: ID of player to update balances
return: none
*/
function collectGo(userID) {
  fetch(IP_ADDRESS + 'update/balance/go/' + userID)
  .then((response) => {return response.text();})
  .catch((err) => {console.log("ERROR: adding money from passing go")})
}

/*
purpose: returns card object matching given index
params: index of card searching for
return: property object based on grid index (cardID)
*/
function getProperty(index){
    return fetch(IP_ADDRESS + 'get/property/' + index)
    .then((response) => {return response.text();})
    .then((text) => {return JSON.parse(text);})
    .catch((err) => {console.log("ERROR: getting property obj from server using ID")})
}


/**
 * Checks if property is available and for sale and allows user to buy prop or pay rent
 * @param {*} player player whos turn it is
 * @param {*} newLocation new location player has moved to
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


  /*
purpose: returns rent of given property depending of if made into
a monopoly yet
params: property object seraching for rent
return: number reprenting amount of dollars owed
*/
  function getRent(prop){
    // checks if there is a monopoly
    if (prop.hasSet){
        return prop.rent*3;
    }
    return prop.rent;
}
    
/*
purpose: updates player and card after just buying property and sending
information back to server
params: playerID of buyer
params: newBalance of buyer after buying property
paramsL proertyID of property just purchased
return: resulting message
*/
function updatePlayerAndCard(playerID, newBalance, propertyID){
    fetch(IP_ADDRESS + 'update/pac/' + playerID + '/' + newBalance + '/' + propertyID)
    .then((response) => {return response.text();})
    .then((text) => {console.log(text);})
    .catch((err) => {console.log("Cant update player and card info in server")});
}



/*
purpose: function that stalls program so other players cant roll dice while player
decides if they will buy property or not
params: button1 and button2, representing yes and no buttons
return: awaited promies object
*/
function waitForClick(buttonId1, buttonId2) {
    return new Promise(resolve => {
        const button1 = document.getElementById(buttonId1);
        const button2 = document.getElementById(buttonId2);
        button1.addEventListener('click', () => resolve(button1), { once: true });
        button2.addEventListener('click', () => resolve(button2), { once: true });
    });
    }

    /*
purpose: updates new location of player in mongodb
params: myID: id of curren player
params: newLocation: new location of player
return: resulting text message
*/
async function updatePlayerLocation(myID, newLocation){
    fetch(IP_ADDRESS + 'update/location/' + myID + '/' + newLocation)
    .then((response) => {return response.text();})
    .then((text) => {console.log(text);})
    .catch((err) => {console.log("Cant update player location in server")});
}


/*
purpose: recursive function hat increments turn and sends turn object back to server
params: val number of players still in game
params: playerCount: number of players
params: playerList: list of players
return: text response
*/
async function postTurnValue(val, playerCount, playerList){
    if (val >= playerCount){
        val = 0;
    }
    if (playerList[val].balance <= 0){
        postTurnValue(val+1,playerCount,playerList);
        return;
    }
    fetch(IP_ADDRESS + 'update/turn/' + val)
    .then((response) => {return response.text();})
    .then((text) => {
        console.log("new turn" + val);
        console.log(text);})
    .catch((err) => {console.log("cant update player turn")})
}

/*
purpose: Get username from URL and returns it
params: none
return: string representing username from url
*/
function getUsername() {
    const urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username');
    return username;
  }


async function fetchClientIDFromServer(username){
    const response = await fetch(IP_ADDRESS + 'get/userID/'+username);
    const text = await response.text();
    console.log("Server output for ID: " + text);
    return text;
}


/*
purpose: displays everyones new location on board
params: players list of players
return: none
*/
async function displayNewLocation(players){
    console.log("should display everyones location")
    var [newLocs, colors] = await generateNewLocs(players);
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
        console.log("redrawing the players")
        //console.log("plusONe:" + plusOne)
        var newLocString = newLoc.toString()+"p"+plusOne.toString();
        //console.log("NLS"+newLocString)

        document.getElementById(newLocString).innerHTML = '<div style="height: 10px; display: inline-block; margin-top: 2px ; width: 10px; background-color: '+color + '" ></div>'
        }
    }


    oldLocs = newLocs
    

}

/*
purpose: generates list of player locations to pass into other function
params: list representing old locations
return: list containg new locations list and list of players colors
*/
async function generateNewLocs(list){
    if(list === null){
        list = await getPlayerList();
    }
    // var list = await getPlayerList();
    var retList = []
    var colorList = []
    for (let i in list){
        let player = list[i]
        retList.push(parseInt(player.position))
        colorList.push(player.color)
    }
    return [retList, colorList]
}



/*
purpose: calls incrementPlayerNum function
params: none
return: none
*/
function incrementTurn(){
    incrementPlayerNum();
    //add more later
}


/*
purpose: calculates new players turn using modulus
params: none
return: none
*/
function incrementPlayerNum(){
    playersTurn += 1
    if (playersTurn > getPlayerCount()){
        playersTurn = 1
    }
    //.log(playersTurn);
}

/*
purpose: fetch username from server given userID
params: userID of player seraching for
return: none
*/
function fetchUsernameFromServer(userId) {
    return new Promise((resolve, reject) => {
      fetch(IP_ADDRESS + 'get/username/' + userId)
        .then(response => response.text())
        .then(text => resolve(text))
        .catch(err => reject(err));
    });
  }
  

/*
purpose: Updatse turn display on board to represent whos turn it is
params: none
return: none
*/
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



// setInterval(updatePlayersTurnDisplay, 1000);

/*
purpose: returns length of list
params: list
return: integer
*/
function getPlayerCount(list) {
    return list ? list.length : 0; // Check if list is defined before accessing its length property
  }
  

  /*
purpose: Get playerList from server
params: none
return: list of players
*/
function getPlayerList() {
    return fetch(IP_ADDRESS + 'get/players')
      .then((response) => response.text())
      .then((text) => JSON.parse(text))
      .catch((err) => console.log("Can't get players list from server."));
  }




/*
purpose: Get playerslist from server
params: none
return: player list
*/
async function getPlayers(){
    let url = 'get/players';
    const properties = await fetch(IP_ADDRESS + url);
    const data = await properties.json();
    return data;
}


/**
 * Fetches the JSON card objs that belongs to a given player
 * @param {} player to search for
 * @returns list of properties
 */
async function getPlayerProperties(playerID){
    let url = IP_ADDRESS + 'get/properties/';
    const results = await fetch( url+ playerID);
    const properties = await results.json();
    return properties;
}


/*
purpose: adds the functinoality to the show properties button to show each players list of properties
params: list of propertires to displat
return: none
*/
function createPropertiesWindow(properties){
    let propertiesWindow = document.getElementById('property-data-popup');
    propertiesWindow.innerHTML = '<div class="close-button" id="close-property-window">&times;</div>';
    let cardList = document.createElement('div');
    cardList.classList.add('card-list');
    if(properties !== null){
        for(let i=0; i< properties.length; i++){
            let card = document.createElement('div');
            card.classList.add('card');
            if(properties[i].color !== null){
                card.innerHTML = `
                    <h3 style="background:${properties[i].color};">${properties[i].name}</h3>
                    <p>price: ${properties[i].price}</p>
                    <p>rent: ${properties[i].rent}</p>
                `
            }else{
                card.innerHTML = `
                    <h3>TITLE</h3>
                    <p>color: ${properties[i].color}</p>
                    <p>price: ${properties[i].price}</p>
                    <p>RENT TO DO</p>
                `
            }
            
            cardList.appendChild(card);
        }
    }
    

    propertiesWindow.appendChild(cardList);
}

/*
purpose: displaye player information for each player
params: list of players
return: none
*/
async function displayPlayers(items){
    console.log(items);
    if(items === null){
        items = await getPlayers();
    }
    console.log(items);
    // var items = await getPlayers();
    document.getElementById('players').innerHTML = '';
    const outputArea = document.getElementById('players');
    let searchParams = getCurrentUrlSearchParams();
    let currentPlayerName = searchParams.get('username');
    // console.log(items);
    let currentPlayer = findUserName(items, currentPlayerName)[0];
    

    // puts the current player at the top
    const div = document.createElement('div');
    div.classList.add("player-info");
    div.id = currentPlayer.color + '-player';
    div.innerHTML = `
    <h2>${currentPlayer.username}</h2>
    <p class="balance"> <span class="dollar-sign">$</span>${currentPlayer.balance}</p>
    <p></p>
    <button class='show-properties' id='${currentPlayer.id}'>Properties</button>
    
    `;
    outputArea.appendChild(div);
    // let properties = await getPlayerProperties(currentPlayer.id);
    // createPropertiesWindow(null);


    // puts the remaining players
    items.forEach(item => {
        if(item.username !== currentPlayerName){
            const div = document.createElement('div');
            div.classList.add("player-info");
            div.id = item.color + '-player';
            div.innerHTML = `
            <h2>${item.username}</h2>
            <p class="balance"> <span class="dollar-sign">$</span>${item.balance}</p>
            <p></p>
            <button class='show-properties' id='${item.id}'>Properties</button>
            `;
            
            outputArea.appendChild(div);
        }
        
    });
}


// displays property information
const showButtons = document.querySelectorAll('.show-properties');
const propertyData = document.querySelector('#property-data-popup');

    /*
    purpose: inner function to toggle whether properties are show or not
    params: id of player window
    return: none
    */
    async function togglePropertyWindow(id) {
        console.log('id: '+id);
        let properties = await getPlayerProperties(id);
        // sets up the popup window for player properties
        createPropertiesWindow(properties);
        isWindowVisible = !isWindowVisible; // Toggle the visibility state
        propertyData.classList.toggle('visible', isWindowVisible); // Toggle the 'visible' class based on state
        



    /*
    purpose: closes the property window
    params: none
    return: none
    */
    function closePropertyWindow(){
        isWindowVisible = !isWindowVisible; // Toggle the visibility state
        propertyData.classList.toggle('visible', isWindowVisible); // Toggle the 'visible' class based on state
    }

}





/*
purpose: grabs the params from the url 
params: none
return: the params as a string
*/
function getCurrentUrlSearchParams(){
    const queryString = window.location.search;
    return new URLSearchParams(queryString);
}


/*
purpose: returns the player object associated with the given username
param: players: list representing users
param: username, the username to serach for
return: the integer representing the turn id
*/
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


/*
purpose: displaus the help page
params: none
return: none
*/
function helpPage(){
    window.location.href = '../help.html';
}