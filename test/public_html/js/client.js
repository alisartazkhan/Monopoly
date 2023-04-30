
function test(){
fetch('http://localhost:3000/')
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.log(error));

fetch('http://localhost:3000/about')
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.log(error));

fetch('http://localhost:4000/')
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.log(error));

fetch('http://localhost:4000/contact')
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.log(error));

}