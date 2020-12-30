self.addEventListener("message", function(e) {
  var data = e.data;
  data['action']="listarLotes";
  var xhttp = new XMLHttpRequest();
  xhttp.responseType = 'json';
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      postMessage({"DocEntry":data.select_docentry,"data":this.response});
    }
  };
  var url = Object.keys(data).map(function(k) {
    return k + '=' + data[k]
  }).join('&');
  
  xhttp.open("GET", ("stockXProveedor.php?" + url), true);
  xhttp.send();
}, false);