/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var permitidos = ["ariel", "douglas", "Andrea", "rosario"];
function configurar(){
    var usuario = $("#usuario").val();    
    var in_array = permitidos.indexOf(usuario);
    if(in_array > -1){
        $("#usuario").prop("readonly",false);
    }else{
        $("#usuario").prop("readonly",true);
    }    
}

function imprimirCredencial(){
    
    var usuario = $("#usuario").val();
    var password = $("#password").val();
    var cargo = $("#cargo").val();
    var nombre = $("#nombre").val();
    
    var md5 = $("#md5").val();
    var sha = $("#sha").val(); 
    var pw = sha+""+password+""+md5;
       
    var url = "usuarios/Credencial.class.php?usuario="+usuario+"&nombre="+nombre+"&cargo="+cargo+"";
    window.open(url,"_blank","menubar=yes,scrollbars=yes,width=400,height=500");
}
function checkAll(){
    var usuario = $("#usuario").val();
     
    var cargo = $("#cargo").val();
    var nombre = $("#nombre").val();
    
    if(usuario.length > 2  && cargo.length > 3 && nombre.length > 3){
       $("#generar").removeAttr("disabled");
    }else{
       $("#generar").attr("disabled",true); 
    }
} 

