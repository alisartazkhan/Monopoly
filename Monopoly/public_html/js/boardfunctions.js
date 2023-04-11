

function restartFunction(){
    createOriginalSpaces();


}

function createOriginalSpaces() {
    /*
	Purpose: This function is called to create the post request and send
	the information to the server.js to create the mongoose Item element.
        Params: None
        Return: None
	*/

    nameList = ["Go","Red Park","Red Rest","Red Vill","Jail","Green Park","Green Rest","Green Vill","Free",
    "Yellow Park", "Yellow Rest", "Yellow Vill", "Go to Jail","Blue Park","Blue Rest","Blue Vill"];

    costList = [0,100,100,120,0,120,120,140,0,200,200,220,0,250,250,300];

    for (var i = 0; i <= 15; i++) {
        var id = i.toString(10);

        document.getElementById(id).innerText = nameList[i];
        console.log(i);
    


    let n = nameList[i];
    let c = costList[i];
    let data = "name="+n+"&cost="+c;
    
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add/space/", true);

    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = () => { // Call a function when the state changes.
    if (xhttp.readyState === XMLHttpRequest.DONE && xttp.status === 200) {
    // Request finished. Do processing here.
  }
}

    
    xhttp.send(data);
    console.log(data);

    
    }
}