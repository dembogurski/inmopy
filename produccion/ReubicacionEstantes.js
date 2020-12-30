 
 
function configurar(){
   $(".dea").focus(function(){
       $(this).select();
   });   
   $("#fila_de0").change(function(){
      var de = $(this).val();
      $("#fila_de1").val(de);
      $("#fila_a1").val(de);      
   });
   $("#fila_de1").change(function(){
      var hasta = $(this).val();       
      $("#fila_a1").val(hasta);      
   });
   
   
}

function mover(funcion){
    $.ajax({
        type: "POST",
        url: "produccion/ReubicacionEstantes.class.php",
        data: {"action": funcion, "usuario": getNick(), "suc": getSuc()},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#result").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);  
                $("#result").html( result); 
            }
        },
        error: function () {
            $("#result").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
