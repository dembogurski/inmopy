var openForm = false;
var cant_proveedores = 0;
var fila_proveedores = 0;
var escribiendo = false;


function configurar(){
    $('#proveedores').DataTable( {
        "language": {
            "lengthMenu": "Mostrar _MENU_ filas por pagina",
            "zeroRecords": "Ningun resultado - lo siento",
            "info": "Mostrando pagina _PAGE_ de _PAGES_",
            "infoEmpty": "Ningun registro disponible",
            "infoFiltered": "(filtrado de un total de _MAX_ registros)",
            "search":"Buscar",
	    "paginate": {
             "previous": "Anterior",
             "next": "Siguiente"
            }
        },
        responsive: true,
		"lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
		"pageLength": 20,
        dom: 'l<"toolbar">frtip',
        initComplete: function(){
           $("div.toolbar").html('<button type="button" id="add_button_proveedores" onclick="addUI()">Nuevo Registro</button>');           
        },
        "autoWidth": false
    } );
     
    
    window.addEventListener('resize', function(event){
        if(openForm){
           centerForm();
        }
    });   
    
}  
 

function editUI(pk){
    $.ajax({
        type: "POST",
        url: "proveedores/Proveedores.class.php",
        data: {action: "editUI" , pk: pk,  usuario: getNick()},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $(".form").html("");
             $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito === "success") {                          
                var form = objeto.responseText;                  
                centerForm(); 
                $(".form").html(form);
                $("#msg").html("");     
                changePais();
                showMobileTab();
                
                $("#tabs").tabs();
                
                getContactos();
            }else{
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        },
        error: function () {
           $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });   
}

function addUI(){
    $.ajax({
        type: "POST",
        url: "proveedores/Proveedores.class.php",
        data: {action: "addUI" ,  usuario: getNick()},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $(".form").html("");
             $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito === "success") {                          
                var form = objeto.responseText;                  
                centerForm(); 
                $(".form").html(form);
                $("#msg").html(""); 
                $("#form_pais").val("PY"); 
                changePais();
            }else{
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        },
        error: function () {
           $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });   
}
function changePais(){
    $("#form_pais").change(function(){
        var p = $(this).val();
        if(p === "PY"){
           $("#form_cta_cont").val("21111");
           $("#form_form_tipo").val("Local");           
        }else{
           $("#form_cta_cont").val("21112"); 
           $("#form_form_tipo").val("Extranjero");
        }
    });
}

function centerForm(){
   var w = $(document).width();
   var h = $(document).height();
   $(".form").width(w);
   $(".form").height(h);   
   $(".form").fadeIn();
   openForm = true;   
}

function addData(form){
   var data = {}; 
   
   var table = form.substring(4,60);      
   $("#"+form+" [id^='form_']").each(function(){
     
     var pk = $(this).hasClass("PRI");
     var column_name = $(this).attr("id").substring(5,60);
     var val = $(this).val(); 
     var req = $(this).attr("required");
      
     if(req === "required" && val === ""){
         $(this).addClass("required");     
     }else{
         $(this).removeClass("required");     
     }
     
     if($(this).attr("id") === "form_fecha_nac" && val === ""){
          val = "2000-01-01";
     }
     data[column_name]=val;
     
  });   
  if($(".required").length === 0 ){
    var master = {                  
          data:data         
    };
    $.ajax({
          type: "POST",
          url: "proveedores/Proveedores.class.php",
          data: {action: "addData" , master: master,  usuario: getNick()},        
          async: true,
          dataType: "json",
          beforeSend: function () {
              $("#msg_proveedores").addClass("error");
              $("#"+form+" input[id="+table+"_save_button]").prop("disabled",true);
              $("#msg_proveedores").html("Insertando... <img src='img/loading_fast.gif'  >");
          },
          success: function (data) {   

              if(data.mensaje === "Ok"){ 
                  $("#msg_proveedores").html(data.mensaje);
                  $("#"+form+" input[id="+table+"_close_button]").fadeIn();
              }else{
                  $("#"+form+" input[id="+table+"_save_button]").prop("disabled",false);
                  $("#msg_proveedores").html(data.mensaje+" Rellene los campos requeridos y vuelva a intentarlo si el problema persiste contacte con el Administrador del sistema.");
              }           
          },
          error: function (err) { 
            $("#msg_proveedores").addClass("error");
            $("#"+form+" input[id="+table+"_save_button]").prop("disabled",false);
            $("#msg_proveedores").html('Error al Registrar: Rellene los campos requeridos y vuelva a intentarlo.<a href="javascript:showTechnicalError()">Mas info</a>\n\
            <div class="technical_info">'+err.responseText+'</div>');         
          }
      });  
     }else{
      $("#msg_proveedores").addClass("error");  
      $("#msg_proveedores").html("Rellene los campos requeridos...");
    }
}
function showTechnicalError(){
    $(".technical_info").fadeToggle();
}

function updateData(form){
  var update_data = {};
  var primary_keys = {};  
  var table = form.substring(5,60);   
  $("#"+form+" [id^='form_']").each(function(){
       
     var pk = $(this).hasClass("PRI");
     var column_name = $(this).attr("id").substring(5,60);
     var val = $(this).val();
     var req = $(this).attr("required");
     
     if(column_name === "fecha_nac" && val === ""){
         val = "2001-01-01";
     }
      
     if(req === "required" && val === ""){
         $(this).addClass("required");     
     }else{
         $(this).removeClass("required");     
     }
     if(pk){
         primary_keys[column_name]=val;
     }else{
         update_data[column_name]=val;
     }  
  });
  if($(".required").length == 0 ){
        var master ={                  
              primary_keys:primary_keys,
              update_data:update_data
        };
        $.ajax({
              type: "POST",
              url: "proveedores/Proveedores.class.php",
              data: {action: "updateData" , master: master,  usuario: getNick()},        
              async: true,
              dataType: "json",
              beforeSend: function () {
                  $("#"+form+" input[id="+table+"_update_button]").prop("disabled",true);
                  $("#msg_proveedores").html("Actualizando... <img src='img/loading_fast.gif'  >");
              },
              success: function (data) {                
                  if(data.mensaje === "Ok"){ 
                      $("#msg_proveedores").html(data.mensaje);
                      $("#"+form+" input[id="+table+"_close_button]").fadeIn();
                  }else{
                      $("#"+form+" input[id="+table+"_update_button]").prop("disabled",false);
                      $("#msg_proveedores").html(data.mensaje+' intente nuevamente si el problema persiste contacte con el Administrador del sistema.<a href="javascript:showTechnicalError()">Mas info</a><div class="technical_info">'+data.query+'</div>');
                  }           
              },
              error: function (err) { 
                $("#msg_proveedores").addClass("error");
                $("#msg_proveedores").html('Error al Registrar: Verifique los datos y vuelva a intentarlo.<a href="javascript:showTechnicalError()">Mas info</a>\n\
                <div class="technical_info">'+err.responseText+'</div>');         
              }
        }); 
  }else{
    $("#msg_proveedores").addClass("error");  
    $("#msg_proveedores").html("Rellene los campos requeridos...");
  }
}

function closeForm(){
    $(".form").html("");
    $(".form").fadeOut();
    openForm = false;
    genericLoad("proveedores/Proveedores.class.php");
}
 

/**
 * Limpia la lista de Proveedores
 * @returns {nada}
 */
function limpiarLista(){    
    $(".tr_cli_data").each(function () {   
       $(this).remove();
    }); 
    $(".cli_data_foot").remove();
}

/**
 * 
 * @param {type} obj
 * @returns json 
 */
function buscarProveedor(obj){  
    buscando = true; 
    cant_proveedores = 0;
    fila_proveedores = 0;
    var q = $(obj).val()+"%";
    var campo = "nombre";  
      
    if($(obj).attr("id") == "ruc_proveedor"){
        campo = "ci_ruc";
    }
    $("#msg").html("<img src='img/activity.gif' width='46px' height='8px' >"); 
    
    $(document).off("keydown");
    
    $.ajax({
        type: "POST",
        url: "proveedores/Proveedores.class.php",
        data: {"action":"buscarProveedor","campo":campo,"criterio":q,"limit":30}, 
        async:true,
        dataType: "json",
        beforeSend: function(){
            $("#msg").html("<img src='img/activity.gif' width='46px' height='8px' >"); 
        },
        success: function(data){   
               if(data.length > 0){
                   if(data.length > 1){
                        limpiarLista(); // Borro los anteriores
                      
                        var cont = 0;
                        for(var i in data){
                           cont++;
                           var CardCode = data[i].CardCode;
                           var CardName = data[i].CardName;
                           var ruc = data[i].RUC;
                           var moneda = data[i].Currency;  
                           var pais = data[i].pais;  
                           $("#lista_proveedores") .append("<tr class='tr_cli_data fila_proveedores_"+i+"' data-moneda='"+moneda+"' data-pais='"+pais+"' ><td class='item'><span class='codigo'  >"+CardCode+"</span></td>   <td class='item'><span class='ruc'>"+ruc+"</span> </td><td  class='item'><span class='proveedor'>"+CardName+"</span></td>  </tr>");                                                      
                        } 
                        cant_proveedores = cont;
                        $("#lista_proveedores").append("<tr class='cli_data_foot'><td   style='text-align:center' colspan='4'>  <input type='button' value='Cerrar' onclick='cerrar()' > </td></tr>"); 
                        $("#msg").html(""+cont+" resultados"); 
                        $("#msg").toggleClass("info"); 
                        $( "#ui_proveedores" ).fadeIn("fast");
                        
                        $(".tr_cli_data").click(function(){                            
                            seleccionarProveedor(this); 
                        });
                        $(".tr_cli_data").css("background","white");
                        inicializarCursores("item");  // Indico para que muestre la flechita al pasar por encima
                        selectRow(fila_proveedores);                       
                        setHotKeysListaProveedor(); 
                        setTimeout("buscando = false;",500); 
                       
                   }else{ // Un unico resultado
                       //$( clientes ).dialog( "close" );
                       $( "#ui_proveedores" ).fadeOut("fast");
                       var codigo = data[0].CardCode;
                       var proveedor = data[0].CardName;
                       var ruc = data[0].RUC;
                       var moneda = data[0].Currency;
                       var pais = data[0].pais;
                       
                       
                       $("#ruc_proveedor").val(ruc);
                       $("#codigo_proveedor").val(codigo);
                       $("#nombre_proveedor").val(proveedor);
                       $("#moneda").val(moneda);
                        
                        $("#pais option").filter(function() {
                            return this.text == pais; 
                        }).attr('selected', true);
                       
                       if(pais != "PY"){
                           $("#proveedor").val("Internacional");
                       }else{
                           $("#proveedor").val("Nacional");
                       }
                         
                       
                       $("#msg").html(""); 
                       mostrar();  // mostrar
                       //$("#nombre_cliente").attr("readonly","true");
                   }                    
               }else{
                  limpiarLista(); 
                  $("#msg").toggleClass("error"); 
                  $("#codigo_proveedor").val("");
                  $("#msg").html("Sin resultados"); 
                  $("#lista_proveedores").append("<tr class='cli_data_foot'><td style='text-align:center' colspan='4'> <input type='button' value='Nuevo' onclick='nuevoCliente()' > <input type='button' value='Cerrar' onclick='cerrar()' > </td></tr>"); 
                  $( "#ui_proveedores" ).fadeIn("fast");
                  // Desabilitar boton generar factura
                  
               }
               
        },
        error: function(e){ 
           $("#msg").addClass("error");
           $("#msg").html("Error en la comunicacion con el servidor:  "+ e);
        }
    });   
        
    
}
function cambiarTipoDoc(){
    var td = $("#form_tipo_doc").val();
    $(".tipo_doc").html(td+":");
}
function setHotKeysListaProveedor() {

    $(document).keydown(function(e) {
        
        var tecla = e.keyCode;   
        if (tecla == 38) {
            (fila_proveedores == 0) ? fila_proveedores = cant_proveedores - 1 : fila_proveedores--;
            selectRow(fila_proveedores);
        }
        if (tecla == 40) {
            (fila_proveedores == cant_proveedores -1) ? fila_proveedores = 0 : fila_proveedores++;
            selectRow(fila_proveedores);
        }
        if (tecla != 38 && tecla != 40 && tecla != 13) {
            escribiendo = true;
        }
        if (tecla == 13) {
           if(!escribiendo){ 
              seleccionarProveedor(".fila_proveedores_"+fila_proveedores); 
           }else{
              setTimeout("escribiendo = false;",1000);
           }
        }
        if (tecla == 116) { // F5
            e.preventDefault(); 
        }           
    });

}
function addContacto(){
   var c_id = $("#c_id").val();
   var cod_prov = $("#form_cod_prov").val();
   var nombre = $("#c_nombre").val();
   var doc = $("#c_doc").val();
   var tel = $("#c_tel").val();
   $.ajax({
        type: "POST",
        url: "proveedores/Proveedores.class.php",
        data: {action: "addContacto" ,c_id:c_id, cod_ent: cod_prov,  usuario: getNick(),nombre:nombre,doc:doc,tel:tel},
        async: true,
        dataType: "html",
        beforeSend: function () {            
             $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito === "success") {                          
                var result = objeto.responseText;                                 
                $("#msg").html(result); 
                getContactos();
            }else{
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        },
        error: function () {
           $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });       
}
function getContactos(){
    $(".new_contact").val("");
    var cod_prov = $("#form_cod_prov").val();
    $.ajax({
        type: "POST",
        url: "proveedores/Proveedores.class.php",
        data: {action: "getContactos", cod_ent: cod_prov},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $(".contact_row").remove();
        },
        success: function (data) {   
            for(var i in data){
                var id = data[i].id;
                var nombre = data[i].nombre;
                var doc = data[i].doc;
                var tel = data[i].tel;
                $("#contactos").append("<tr class='contact_row'><td class='item'>"+id+"</td><td class='item'>"+nombre+"</td><td class='item'>"+doc+"</td><td class='item'>"+tel+"</td><td class='itemc'><img src='img/trash_mini.png' style='cursor:pointer' onclick=delContacto('"+id+"')></td></tr>")
            }             
        },
        error: function (e) {                 
            $("#msg").html("Error obtener contactos:  " + e);   
            errorMsg("Error obtener contactos:  " + e, 10000);
        }
    }); 
}
function delContacto(id){
    var cod_prov = $("#form_cod_prov").val();
    $.post("proveedores/Proveedores.class.php", { action: "delContacto", cod_ent: cod_prov,id:id} , function(data) {
       getContactos()
    });
}

function addMovil(){
   var c_id = $("#m_id").val();
   var cod_prov = $("#form_cod_prov").val();
   var rua = $("#rua").val();
   var chapa = $("#chapa").val();
   var marca = $("#marca").val();
   $.ajax({
        type: "POST",
        url: "proveedores/Proveedores.class.php",
        data: {action: "addMovil" ,c_id:c_id, cod_ent: cod_prov,  usuario: getNick(),rua:rua,chapa:chapa,marca:marca},
        async: true,
        dataType: "html",
        beforeSend: function () {            
             $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito === "success") {                          
                var result = objeto.responseText;                                 
                $("#msg").html(result); 
                getMoviles();
            }else{
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        },
        error: function () {
           $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });       
 }
function getMoviles(){
   $(".new_movil").val("");
    var cod_prov = $("#form_cod_prov").val();
    $.ajax({
        type: "POST",
        url: "proveedores/Proveedores.class.php",
        data: {action: "getMoviles", cod_ent: cod_prov},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $(".movil_row").remove();
        },
        success: function (data) {   
            for(var i in data){
                var id = data[i].id;
                var rua = data[i].rua;
                var chapa = data[i].chapa;
                var marca = data[i].marca;
                $("#moviles").append("<tr class='movil_row'><td class='item'>"+id+"</td><td class='item'>"+rua+"</td><td class='item'>"+chapa+"</td><td class='item'>"+marca+"</td><td class='itemc'><img src='img/trash_mini.png' style='cursor:pointer' onclick=delMovil('"+id+"')></td></tr>")
            }             
        },
        error: function (e) {                 
            $("#msg").html("Error obtener moviles:  " + e);   
            errorMsg("Error obtener moviles:  " + e, 10000);
        }
    });     
} 

function delMovil(id){
    var cod_prov = $("#form_cod_prov").val();
    $.post("proveedores/Proveedores.class.php", { action: "delMovil", cod_ent: cod_prov,id:id} , function(data) {
       getMoviles()
    });
}
function showMobileTab(){
    if($("#form_ocupacion").val()=="Transportadora"){        
        $(".moviles").fadeIn();
        $(".moviles").trigger("click");
    }else{
        $(".moviles").fadeOut();
    }
}

function selectRow(row) {
    $(".cliente_selected").removeClass("cliente_selected");
    $(".fila_proveedores_" + row).addClass("cliente_selected");
    $(".cursor").remove();
    $($(".fila_proveedores_" + row + " td").get(2)).append("<img class='cursor' src='img/l_arrow.png' width='18px' height='10px'>");
    escribiendo = false;   
}

