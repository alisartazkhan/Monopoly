
class Player {
    constructor(id) {
    this.money = 1500;
    this.id = id;
    this.pos = 0;
    this.propList = [];
    }
  }

  
class Tile {
    constructor(id,price,baseRent) {
    this.id = id;
    this.price = price;
    this.baseRent = baseRent;
    this.owner = 0;
    }
  }


  let playersTurn = 1;
  let curPlayersTurn = playersTurn;
    // let pList = ["index 0",new Player(1),new Player(2),new Player(3),new Player(4)] // create player list
  let pList = ["index 0"];
  let newLoc = 0;
  displayInitialLocations();
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

 
function fetchTurnFromServer(){
    // console.log('fetching turn info');
    let p = fetch('/get/turn');
    p.then(data => {
        return data.json();
    })
    .then(turn => {
        // console.log(turn);
        playersTurn = turn
    });
    p.catch(error => {
    // Handle any errors here
    console.error(error);
  });
}

setInterval(fetchTurnFromServer, 2000);


async function  createTiles(){
    const tiles = await fetchCardsFromServer();
    for(let i in tiles){
        let tile = new Tile(tiles[i].id, tiles[i].price, tiles[i].rent);
        tList.push(tile);
    } 
    // console.log(tList.length);
}


createTiles();

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

/**
 * fetches a list of all the players from server
 */
function getAllPlayers(){
    // console.log('fetching all players');
    let p = fetch('/get/players')
    p.then(data => {
        return data.json();
        })
        .then(post => {
            createPlayerList(post);
        });
    p.catch(error => {
        // Handle any errors here
        console.error(error);
      });

    
}
setInterval(getAllPlayers, 2000); 

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
setInterval(updatePlayers, 2000);




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

setInterval(updateCards, 2000);
  

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


function rollDice(){
    var d1 = Math.floor(Math.random() * 6)+1;
    var d2 = Math.floor(Math.random() * 6)+1;
    //console.log(d1+d2);
    var curLoc = pList[playersTurn].pos
    newLoc = (curLoc + d1 + d2) % 32

    document.getElementById("eventLog").innerText = "Player "+playersTurn+" rolled a "+(d1+d2)
    displayNewLocation(curLoc,newLoc)
    pList[playersTurn].pos = newLoc;
    console.log("P"+playersTurn+"rolled a " +(d1+d2))
    console.log("Locations are " + pList[1].pos + " "+ pList[2].pos + " "+ pList[3].pos + " "+ pList[4].pos)

    curPlayersTurn = playersTurn

    if ((tList[newLoc].owner != curPlayersTurn && tList[newLoc].owner != 0) && tList[newLoc].baseRent > 0){
        //document.getElementById("buyProp").innerHTML = '<button type="button" onclick="buyProp()">Buy Property!</button><button type="button" onclick="dontBuyProp()">Don\'t Buy Property!</button>';
        //document.getElementById("buyProp").innerHTML = '<button type="button onclick="change()">Buy Property!</button>';
        console.log("rent owed")
        var rent = tList[newLoc].baseRent
        var owner = pList[tList[newLoc].owner]
        var renter = pList[curPlayersTurn]
        renter.money -= rent;
        owner.money += rent;

        var rentMoneyString = "p"+renter.id.toString()+"money";
        document.getElementById(rentMoneyString).innerText = renter.money
        var ownerMoneyString = "p"+owner.id.toString()+"money";
        document.getElementById(ownerMoneyString).innerText = owner.money

    }

 
    incrementTurn();    
}

function displayNewLocation(curLoc, newLoc){
    var curLocString = curLoc.toString()+"p"+playersTurn.toString();
    document.getElementById(curLocString).innerText = ""
    var newLocString = newLoc.toString()+"p"+playersTurn.toString();
    document.getElementById(newLocString).innerText = playersTurn
    

}

function displayInitialLocations(){
    document.getElementById("0p1").innerText = "1";
    document.getElementById("0p2").innerText = "2";
    document.getElementById("0p3").innerText = "3";
    document.getElementById("0p4").innerText = "4";

}


function incrementTurn(){
    incrementPlayerNum();
    while (pList[playersTurn].money <= 0){
        incrementPlayerNum();
    }
    document.getElementById("pTurn").innerText = playersTurn
}

function incrementPlayerNum(){
    playersTurn += 1
    if (playersTurn > 4){
        playersTurn = 1
    }
    //.log(playersTurn);
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