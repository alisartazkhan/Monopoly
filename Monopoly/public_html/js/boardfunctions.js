
class Player {
    constructor(id) {
    this.money = 1500;
    this.id = id;
    this.pos = 0;
    this.propList = ""
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
  let curPlayersTurn = playersTurn
  let pList = ["index 0",new Player(1),new Player(2),new Player(3),new Player(4)] // create player list
  let newLoc = 0;
  displayInitialLocations();
  let tList = [
    new Tile(0,0,0),
    new Tile(1,60,2),
    new Tile(2,0,0),
    new Tile(3,60,4),
    new Tile(4,0,0),
    new Tile(5,200,50),
    new Tile(6,100,6),
    new Tile(7,0,0),
    new Tile(8,100,6),
    new Tile(9,120,8),
    new Tile(10,0,0),
    new Tile(11,140,10),
    new Tile(12,150,0),
    new Tile(13,140,10),
    new Tile(14,160,12),
    new Tile(15,200,50),
    new Tile(16,180,14),
    new Tile(17,0,0),
    new Tile(18,180,14),
    new Tile(19,200,16),
    new Tile(20,0,0),
    new Tile(21,220,18),
    new Tile(22,0,0),
    new Tile(23,220,18),
    new Tile(24,240,20),
    new Tile(25,200,50),
    new Tile(26,260,22),
    new Tile(27,260,22),
    new Tile(28,150,0),
    new Tile(29,280,24),
    new Tile(30,0,0),
    new Tile(31,300,26),
    new Tile(32,300,26),
    new Tile(33,0,0),
    new Tile(34,320,28),
    new Tile(35,200,50),
    new Tile(36,0,0),
    new Tile(37,350,35),
    new Tile(38,0,0),
    new Tile(39,400,50)]
  //pList[3].money = 0
  

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
    newLoc = (curLoc + d1 + d2) % 40

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

