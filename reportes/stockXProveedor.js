var listarCompras = function(){
  var param = {
    "action" : "listarDeCompras",
    "desde" : $("input#desde").val(),
    "hasta" : $("input#hasta").val(),
    "select_sector" : $("select#select_sector").val(),
    "select_articulos" : $("select#select_articulos").val(),
    "select_proveedor" : $("select#select_proveedor").val(),
    "select_sector" : $("select#select_sector").val()
    
  };
  
  $.get("reportes/stockXProveedor.php",param, function(data){
    $("div.listaDeCompras").html(data);    
  },'html');
}

var seleccionarTodos = function(target){
  if(target.is(":checked")){
    $("input.listaVerificacion").prop("checked",true);
    $("tr[onclick^=seleccionarLinea]").addClass("selected");
  }else{
    $("input.listaVerificacion").prop("checked",false);
    $("tr[onclick^=seleccionarLinea]").removeClass("selected");
  }
  modLista();
}

var modLista = function(){
  var ids = '';
  $("input.listaVerificacion").each(function(){
    if($(this).is(":checked")){
      ids += (ids.length>0)?','+$(this).data("docentry"):$(this).data("docentry");
      
    }
  });
  if(ids.length > 0){
    $("input[onclick^=sendForm]").prop("disabled",false);
    $("input#select_docentry").val(ids);
  }else{
    $("input[onclick^=sendForm]").prop("disabled",true);
  }
}

var seleccionarLinea = function(target){
  var estado = target.find("input.listaVerificacion").is(":checked");
  $(target.find("input.listaVerificacion")).prop("checked",!estado);
  console.log(estado+', '+target.find("input.listaVerificacion").data("docentry"));
  if(!estado){
    target.addClass("selected");
  }else{
    target.removeClass("selected");
  }
  modLista();
}