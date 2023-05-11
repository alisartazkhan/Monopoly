/**
 * Name: Ali Sartaz Khan, Sam Richardson, Khojiakbar Yokubjonov
 * Course: CSC337
 * Description: This is the client side that handles the user login.
 */

const hostname = 'localhost'
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

/**
 * Handles the user login. After successful validation, it will take the user to
 * the waiting room page.
 */
function login(){
    showLoginMessage(null);
    let url =  '/account/login/'
    let userName = document.getElementById('username').value;
    let ps = document.getElementById('password').value;
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

/**
 * displays message for invalid login credentials
 * @param {*} message 
 */
function showLoginMessage(message){
    document.getElementById("invalid-login").innerText = message;
}
