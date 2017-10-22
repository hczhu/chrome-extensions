function processDom(root, callback) {
  console.log("processing root with " + root.children.length + " children.");
  if (root.children.length == 0 && root.textContent != null && root.textContent != '') {
    console.log("Processing root text: [" + root.textContent + "]");
    root.textContent = callback(root.textContent);
  }
  for (var i = 0; i < root.children.length; ++i) {
    child = root.children[i];
    if (child.nodeType == Node.TEXT_NODE) {
      console.log("Processing child text: [" + child.textContent + "]");
      child.textContent = callback(child.textContent);
    } else {
      processDom(child, callback);
    }
  }
}

function processSeletion(callback) {
  selection = window.getSelection();
  // console.log(selection.toString());
  if (selection.rangeCount) {
    for (var i = 0; i < selection.rangeCount; ++i) {
      root = selection.getRangeAt(i).commonAncestorContainer
      processDom(root, callback);
    }
  } else if (selection.type == "Text") {
    alert("Doesn't work for selected text only");
  }
}

function parseNumber(str) {
  str = str.replace(/,/g, '');
  var sign = 1;
  if (str.length > 0 && str[0] == '(') {
    sign = -1;
    str = str.substr(1);
    if (str.length > 0 && str[str.length - 1] == ')') {
      str = str.substr(0, str.length - 1);
    }
  }
  var number = parseFloat(str);
  return isNaN(number) ? null : (number * sign);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Got a request: " + JSON.stringify(request));
    var callback = null;
    if (request.cmd == 'replace') {
      var denominator = parseNumber(request.denominator);
      if (denominator == null) {
        console.log("The denominator is not a number: " + request.denominator);
        return;
      }
      chrome.storage.local.set({
          '__denom__': request.denominator,
      });
      callback = function(text) {
        var oldText = text;
        number = parseNumber(text);
        if (number == null) {
        return text;
        }
        newText = (number / denominator).toFixed(2);
        chrome.storage.local.set({
            [newText]: oldText,
        });
        return newText;
      };
    } else if (request.cmd == 'restore') {
      callback = function(newText) {
        chrome.storage.local.get(newText, function(result) {
          if (result.hasOwnProperty(newText)) {
            console.log("Get [" + result[newText] + "] from the local storage for key: [" + newText + "].");
            return result[newText];
          }
          return newText;
        });
      };
    }
    processSeletion(callback);
  }
);
