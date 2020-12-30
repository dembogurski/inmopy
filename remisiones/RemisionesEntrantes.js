
function configurar(){
    $(".clicable").click(function(){ 
             var rem = $(this).parent().attr("id").substring(4,20);
             cargarNotaRemisionEnProceso(rem);
    }); 
    inicializarCursores("clicable"); 
    if (touch) { 
        $(".remision_abierta").height("40px");
    }
}


