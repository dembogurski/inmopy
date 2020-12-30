
var cons = false;

function consolidar(){
if(!cons){
    $("[class^='bale']").each(function(){  
      var clase = $(this).attr("class").split(" ")[0];     
      var pieza = $(this).attr("data-piece");  
      if(pieza ==  "1"){
        var cantidad = $("."+clase).length;
        $(this).attr("rowspan",cantidad);

      }else{
         $(this).remove();
      }

    });

    
    unificar('descrip_');
    unificar('color0_');
    unificar('color_cod_'); 
    unificar('um_')
  }
  cons = true;
}

function unificar(clase){
var clase_anterior = "";
    var cantidad = 0;
    $("[class^='"+clase+"']").each(function(){  
       var clase = $(this).attr("class").split(" ")[0];  
       if(clase != clase_anterior){
           cantidad = $("."+clase).length;
           $(this).attr("rowspan",cantidad);
       }else{
           $(this).remove();
       }
       clase_anterior = clase;
         
    });     
}
