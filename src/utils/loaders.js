function loadJSON(file, id, async) {
  var request = new XMLHttpRequest();
  request.overrideMimeType('application/json');
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      //jsonObjSetter( JSON.parse(request.responseText) );
      localStorage.setItem(id, request.responseText);
    }
  };
  request.open('GET', file, async);
  request.send();
};