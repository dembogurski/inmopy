/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function configurar(){
    inicializarCursores("item"); 
    
    $(".grupo").click(function(){
        $(this).removeClass("grupo");
        $(this).addClass("selected");
        $(".grupo").slideUp("slow");
        var grupo = $(this).attr("id");
        mostrarPermisos(grupo);
        $("#mostrar").fadeIn();
    });
}

function mostrarGrupos(){
   $(".selected").addClass("grupo");
   $(".selected").removeClass("selected"); 
   $(".grupo").slideDown("fast"); 
   $("#mostrar").fadeOut();
   removerPermisos();
}

function removerPermisos(){
    $(".fila_permiso").each(function () {   
       $(this).remove();
    });
}

function guardarTrustee(id_permiso,grupo){
   
  var permiso = id_permiso.toString(); 
  
  var replaced_id =   permiso.replace(/\./g, '_');
    
  var v = $("#ver_"+replaced_id).is(":checked");  
  var e = $("#ejecutar_"+replaced_id).is(":checked");  
  var m = $("#modificar_"+replaced_id).is(":checked");
  
  v===false?v='-':v='v';
  e===false?e='-':e='e';
  m===false?m='-':m='m';
  
  var trustee = v+""+e+""+m;
  
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action":"aplicarPermisoAGrupo","grupo":grupo,"id_permiso":permiso,"trustee":trustee}, 
        async:true,
        dataType: "html",
        beforeSend: function(){
            $("#msg_permisos").html("<img src='img/loading.gif' width='22px' height='22px' >");
            $("#msg_"+replaced_id).html("<img src='img/loading.gif'  width='16px' height='16px' >");
        }, 
        complete: function(objeto, exito){
            if(exito=="success"){                          
               $("#msg_permisos").html("<label class='info'> Los permisos han sido aplicados con exito...</label>");  
               $("#msg_"+replaced_id).html("<img src='img/ok.png' width='16px' height='16px' >");
            }
        }
    });
    
    var array = id_permiso.split(".");
     
    var arrastre = "";
    if(array.length > 0 ){
        for(var i = 0; i < array.length-1;i++){            
            arrastre += array[i]+".";
        }
        if(array.length == 2 ){
            arrastre = "";
        }
        infoMsg("Asegurese que esten habilitados los siguientes Permisos: "+array[0]+"  "+ arrastre+"",5000);
    }
}
function mostrarPermisos(grupo){ 
       var array_sids = new Array();
       var nombre = $("#"+grupo).children().next().html();
       $("#span_grupo").html(nombre);
        removerPermisos();
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {action:"getPermisosXGrupo",grupo:grupo},
            async:true,
            dataType: "json",
            beforeSend: function(objeto){                  
                $("#msg_permisos").html("<img src='img/loading.gif'>");
            },
            success: function(data){ 
              $("#msg_permisos").html(""); 
              for(var i in data){
                
                var id = data[i].id;
                var permiso = data[i].permiso;
                var trustee = data[i].trustee;
                if(trustee == null){trustee = '---';}
                
                var regex = new RegExp(/\./g);
                var count = id.toString().split(/./g).length - 3;
                var espacios = "";
                for(var j= 0;j <= count;j++){
                    espacios +="...";
                } 
                
                var sid = id.toString().split(".")[0]; //Short id                
                array_sids.push(sid);
                
                var v = trustee.substring(0,1);
                var e = trustee.substring(1,2);
                var m = trustee.substring(2,3);
                var ver = '';
                var ejecutar = '';
                var modificar = '';
                if(v == "v"){     ver = 'checked';   }
                if(e == "e"){     ejecutar = 'checked';   }
                if(m == "m"){     modificar = 'checked';   }
                
                var replaced_id =   id.replace(/\./g, '_');
                                    
                $("#tabla_permisos") .append("<tr class='fila_permiso sid_"+sid+"' style='background-color: white'><td class='item' style='padding-left: 4px'>"+espacios+""+id+" </td>  <td class='item selectable'>"+espacios+" "+permiso+"  </td>\n\
                <td  class='itemc'> \n\
                <label for='ver_"+replaced_id+"'>Ver </label><input type='checkbox' id='ver_"+replaced_id+"' "+ver+">&nbsp;&nbsp;<label for='ejecutar_"+replaced_id+"'>Ejecutar</label> <input type='checkbox' id='ejecutar_"+replaced_id+"' "+ejecutar+"> &nbsp;&nbsp; <label for='modificar_"+replaced_id+"'>Modificar</label> <input type='checkbox' id='modificar_"+replaced_id+"' "+modificar+">\n\
                <span style='width:30%;display:inline-block;text-align:right'><input type='button' onclick=guardarTrustee('"+id+"',"+grupo+") style='font-size:10px' value='Aplicar'></span><span id='msg_"+replaced_id+"'</span></td>   \n\
                </tr>");                                                      
              } 
              $("#filters").html("<label>Filtrar:&nbsp;</label>");
              array_sids = jQuery.unique( array_sids );
               
              for(var i = 0; i < array_sids.length;i++){
                  var s = array_sids[i];
                  $("#filters").append("<label for='"+s+"'>"+s+"</label><input class='filter' id='filter_"+s+"' type='radio' name='filter' value='"+s+"'> &nbsp;&nbsp;&nbsp; ");
              }
              $(".filter").click(function(){  
                  var s =  $(this).val(); 
                  
                  $(".fila_permiso:not(.sid_"+s+")").slideUp("fast");
                  $(".sid_"+s).slideDown("fast");
              });         
             $("#contenedor_permisos").fadeIn();  
             $(".selectable").click(function(){     
                $(this).parent().find("input[type=checkbox]").trigger('click'); 
             });
            }
        });    
}

