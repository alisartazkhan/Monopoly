
const forms = document.getElementsByTagName('form');
// Stop form from reloading the page
for (let i = 0; i < forms.length; i++) {
  forms[i].addEventListener('submit', function(event) {
    event.preventDefault(); 
  });
}

/**
 * Updates ready button when clicked
 * @param {*} btn 
 */
function toggleReady(btn) {
    if (btn.innerText === "Not Ready") {
        btn.innerText = "Ready";
    } else {
        btn.innerText = "Not Ready";
    }
  }
  