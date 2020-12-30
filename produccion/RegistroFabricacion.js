function configurar(){
   $(".fecha").mask("99-99-9999");
   $(".fecha").datepicker({ dateFormat: 'dd-mm-yy' });   
   $("#cant_prod").change(function(){
       var v = parseInt($(this).val());
       if(v > 0){
           $("#registrar").prop("disabled",false);
       }else{
           $("#registrar").prop("disabled",true);
       }
       
   });
}

function buscarArticulos(){
    var criteria = $("#buscar").val();
    $.ajax({
        type: "POST",
        url: "produccion/RegistroFabricacion.class.php",
        data: {"action": "getArticulos", criteria: criteria},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#articulo").html("<option class='cargando'><img src='../img/loading_bar.gif'>Buscando...</option>");
            $("#articulo").before(" <img class='cargando' src='img/loading_fast.gif' style='margin-botom:-3px'> ");
        },
        success: function (data) { 
            $(".cargando").remove();
            for (var i in data) { 
                var ItemCode =  (data[i].codigo).toUpperCase();
                var ItemName =  data[i].descrip;
                $("#articulo").append("<option  data-name='"+ItemName+"' value='"+ItemCode+"'>"+ItemCode+" - "+ItemName+"</option>");
            }
            $("select > option:nth-child(even)").css("background","#F0F0F5"); // Color Zebra para los Selects
             
        }
    });
}

function registrar(){
    var fecha = validDate( $("#fecha_prod").val() ).fecha;
    var usuario = $("#usuario").val();
    var codigo = $("#articulo").val();
    var nombre = $("#articulo :selected").attr("data-name");
    var cant_prod = parseInt($("#cant_prod").val());
    var obs = $("#obs").val();
    if( fecha == "NaN-NaN-NaN" ){
        errorMsg("Ingrese la fecha de produccion es obligatoria",16000);
        return;
    }
    if( codigo == null ){
        errorMsg("Busque un articulo de fabricacion TX*",16000);
        return;
    }
    if( usuario.length < 3 ){
        errorMsg("Debe elegir un Operario",16000);
        return;
    }
    if( isNaN(cant_prod)  ){
        errorMsg("Debe ingresar un numero como cantidad producida",16000);
        return;
    }
    $.ajax({
        type: "POST",
        url: "produccion/RegistroFabricacion.class.php",
        data: {"action": "registrarProduccion",user:getNick(),suc:getSuc(), fecha_prod: fecha,usuario:usuario,codigo:codigo,nombre:nombre,cant_prod:cant_prod,obs:obs},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            var status = data.estado; 
            $("#msg").html(status); 
            if(status == "Ok"){
                $("#cant_prod").val("");
                $("#registrar").prop("disabled",true);
                listarRegistroDelDia();
            }
        }
    });
}

function listarRegistroDelDia(){
    var fecha = validDate( $("#fecha_prod").val() ).fecha;
    $.ajax({
        type: "POST",
        url: "produccion/RegistroFabricacion.class.php",
        data: {"action": "listarRegistroDelDia",  fecha_prod: fecha},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            $(".fila_reg").remove();
            for (var i in data) { 
                var id = data[i].id_reg;
                var fecha_reg = data[i].fecha_reg; 
                var usuario_reg = data[i].usuario_reg;
                var usuario_prod = data[i].usuario_prod;
                var fecha_prod = data[i].fecha_prod;
                var codigo = data[i].codigo;
                var articulo = data[i].articulo;
                var cant_prod = data[i].cant_prod;
                var obs = data[i].obs;
                $("#registro").append("<tr class='fila_reg'> \n\
                        <td class='itemc'>"+id+"</td> \n\
                        <td class='itemc'>"+fecha_reg+"</td>\n\
                        <td class='itemc'>"+usuario_reg+"</td>\n\
                        <td class='itemc'>"+fecha_prod+"</td>\n\\n\
                        <td class='itemc'>"+usuario_prod+"</td>\n\
                        <td class='itemc'>"+codigo+"</td>\n\
                        <td class='item'>"+articulo+"</td>\n\
                        <td class='itemc'>"+cant_prod+"</td>\n\
                        <td class='itemc'>"+obs+"</td>\n\
                </tr>");
            }   
            $("#msg").html("");              
        }
    });
}

 