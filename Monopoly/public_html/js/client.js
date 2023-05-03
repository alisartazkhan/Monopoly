/**
 * Name: Ali Sartaz Khan
 * Course:
 * Description: 
 */

//  used when the server is running in the cloud
// const hostname11 = '204.48.28.205';
const hostname = '137.184.216.183'
const port = 3000;

/**
 * creates a new user account
 * sends new user credentials to the server to store
 */
function addUser(){
    showLoginMessage(null);
    let u = document.getElementById('username').value;
    let ps = document.getElementById('password').value;
    let url = '/add/user/';

    if(u !=="" && ps !== ""){
    let data = {username: u, password: ps};
    let p = fetch( url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    });
    p.then(response => {
        response.text().then(data => {
            if(data === 'SAVED SUCCESSFULLY'){
                // alert('Account Created');
                window.location.href = `/index.html`;
            }else if (data == "username is unavailable"){
                showLoginMessage(data);
            }
        });
      });
      p.catch(() => { 
        alert('something went wrong');
    });
    }
    
}

function login(){
    showLoginMessage(null);
    let url =  '/account/login/'
    let userName = document.getElementById('username').value;
    let ps = document.getElementById('password').value;
    // console.log(userName + " " +  ps);
    if(userName !=="" && ps !== ""){
         url += userName + '/' + ps + '/';
        try{
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.send();
            xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
            if( xhr.status == 200){
            if(xhr.responseText === "SUCCESS"){
                window.location.href = `/waiting_room.html?username=${encodeURIComponent(userName)}`;
            
            }else{                        
            showLoginMessage(xhr.responseText);
                }
            }else{
            console.log('smth went wrong');
            }}};
        }catch(e){
            console.log('catch', e);
        }
       
        
    }
}
// display message for invalid login credentials
function showLoginMessage(message){
    document.getElementById("invalid-login").innerText = message;
}