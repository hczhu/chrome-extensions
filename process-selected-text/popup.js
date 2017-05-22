function sendMessage(msg) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, msg, function(response) {
          console.log("finished msg: " + JSON.stringify(msg));
          });
      });
}

function replace() {
  var denom = document.getElementById('divider').value;
  var divider = parseFloat(denom);
  sendMessage({
    divider: divider,
    cmd: 'replace'
  });
}
function restore() {
  sendMessage({
    cmd: 'restore'
  });
}

window.onload = function() {
  document.getElementById('replace').onclick = replace;
  document.getElementById('restore').onclick = restore;
}


