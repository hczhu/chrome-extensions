items = document.evaluate('//li[@ng-repeat="option in options"]', document, null, XPathResult.ANY_TYPE, null);
nodes=[];
itr = items.iterateNext();
while (itr) {
    nodes.push(itr);
    itr=items.iterateNext();
}
for (let i = 0; i<nodes.length; ++i) {
    if (nodes[i].children[1].textContent == "No") {
        nodes[i].children[0].checked.click();
    }
}
