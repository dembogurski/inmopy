


function configurar(){
    $(".clicable").click(function(){ 
             var rem = $(this).parent().attr("id").substring(4,20);
             cargarNotaRemision(rem);
    }); 
    inicializarCursores("clicable"); 
    if (touch) { 
        $(".remision_abierta").height("40px");
    }
  $(".tipo").click(function(){
        var tipo = $("input[name='tipo']:checked").val();
        console.log(tipo);
        genericLoad("remisiones/RemisionesAbiertas.class.php?tipo="+tipo); 
         
    });    
}

function delRemito(nro_remito){
   var c = confirm("Confirme ¿Eliminar esta nota de Remision?"); 
   if(c){
        $("#eliminar_"+nro_remito).html("<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
        $.post( "Ajax.class.php",{ action: "eliminarNotaRemision",nro_remito:nro_remito}, function( data ) {
              genericLoad("remisiones/RemisionesAbiertas.class.php");
        });
   }   
}

 