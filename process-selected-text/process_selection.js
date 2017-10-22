function processDom(root, node_id, callback) {
  // console.log("processing root with " + root.children.length + " children.");
  if (root.children.length == 0 && root.textContent != null && root.textContent != '') {
    // console.log("Processing root text: [" + root.textContent + "]");
    callback(root, node_id++);
  }
  for (var i = 0; i < root.children.length; ++i) {
    child = root.children[i];
    if (child.nodeType == Node.TEXT_NODE) {
      // console.log("Processing child text: [" + child.textContent + "]");
      callback(child, node_id++);
    } else {
      node_id = processDom(child, node_id, callback);
    }
  }
  return node_id;
}

function processSeletion(callback) {
  selection = window.getSelection();
  // console.log(selection.toString());
  var node_id = Date.now();
  if (selection.rangeCount) {
    for (var i = 0; i < selection.rangeCount; ++i) {
      root = selection.getRangeAt(i).commonAncestorContainer
      node_id = processDom(root, node_id, callback);
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
      callback = function(textNode, node_id) {
        if (textNode.getAttribute('node_id') != null) {
          console.log("Skip an already processed node: " + textNode.textContent);
          return;
        }
        var oldText = textNode.textContent;
        number = parseNumber(oldText);
        if (number == null) {
          return;
        }
        newText = (number / denominator).toFixed(3);
        textNode.textContent = newText;
        textNode.setAttribute('node_id', node_id);
        chrome.storage.local.set({
            [node_id]: oldText,
        });
      };
    } else if (request.cmd == 'restore') {
      callback = function(textNode, node_id) {
        node_id = textNode.getAttribute('node_id');
        if (node_id == null) {
          return;
        }
        chrome.storage.local.get(node_id, function(result) {
          if (result.hasOwnProperty(node_id)) {
            // console.log("Get [" + result[newText] + "] from the local storage for key: [" + newText + "].");
            textNode.textContent = result[node_id];
          }
        });
        textNode.removeAttribute('node_id');
        chrome.storage.local.remove(node_id);
      };
    }
    processSeletion(callback);
  }
);
