$(function(){
   periodos();
});
function periodos(){
   $("div.listaPeriodosInventario table tbody").empty();
   $.get("reportes/Inventario.php",{"action":"periodos","suc":$("#select_suc").val()},function(data){
      if(data.length > 0){
         data.forEach(function(element){
            var tr = $("<tr/>",{"onclick":"seleccionarPeriodo($(this))"});
           
            $.each(element,function(key,val){
              
               switch(key){
                  case 'usuario':
                  case 'suc':
                  case 'mInicio':
                  case 'mFin':
                  case 'estado':
                   console.log(val);
                     $("<td/>",{"class":key,"text":val}).appendTo(tr);
                     break;
               }
            });
            tr.appendTo($("div.listaPeriodosInventario table tbody"));
         });         
      }
   },'json');
}
function seleccionarPeriodo(target){
   $("#desde").val($(target.find(".mInicio")).text());
   $("#hasta").val($(target.find(".mFin")).text());
   $("#select_suc").val($(target.find(".suc")).text());
   $("#inv_usu").val($(target.find(".usuario")).text());
}