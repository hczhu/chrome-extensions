function sendMessage(msg) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, msg, function(response) {
      console.log("finished msg: " + JSON.stringify(msg) + " and got response: " + JSON.stringify(response));
    });
  });
}

function replace() {
  sendMessage({
    denominator: document.getElementById('denominator').value,
    cmd: 'replace'
  });
}
function restore() {
  sendMessage({
    cmd: 'restore'
  });
}

window.onload = function() {
  console.log("Loading the pop-up window...");
  chrome.storage.local.get('__denom__', function(result) {
    document.getElementById('denominator').value =
      result.hasOwnProperty('__denom__') ?
        result['__denom__'] : '1,000,000';
  });
  document.getElementById('replace').onclick = replace;
  document.getElementById('restore').onclick = restore;
}


