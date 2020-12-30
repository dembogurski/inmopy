var map;
var markers = [];

function configurar() {
    $.ajaxSetup({
        beforeSend: function() {
            $('div#bc_loader').show();
        },
        complete: function(html) {
            $('div#bc_loader').hide();
        }
    });
    $("input#fecha_nac").mask("99/99/9999");
    checkGeo();
    $("#tabs").tabs();
}
var clientes = [];
var bc_callBuscarClienteTimeOut;

function bc_callBuscarCliente() {
    if (bc_callBuscarClienteTimeOut != undefined) {
        clearTimeout(bc_callBuscarClienteTimeOut);
    }
    bc_callBuscarClienteTimeOut = setTimeout('bc_buscarCliente()', 700);
}
// Busqueda por palabra clave
function bc_buscarCliente() {
    var hit = $("input#bc_buscar").val();

    var param = { "action": "buscar_clientes", "hit": hit,usuario:getNick() };
    $.post("clientes/BuscarClientes.class.php", param, function(data) {
        if (Object.keys(data).length > 0) {
            clientes = data;
            bc_generarLista();
        } else {
            clientes = [];
            $("ul#bc_lista_clientes").empty();
        }
    }, "json");

}
// Lista de coincidecias del buscador
function bc_generarLista() {
    $("ul#bc_lista_clientes").empty();
    if (Object.keys(clientes).length > 0) {
        clientes.forEach(function(data, i) {
            $("<li/>", {
                "text": data.nombre,
                "id": data.ci_ruc,
                "onclick": "bc_seleccionar(" + i + ")"
            }).appendTo("ul#bc_lista_clientes");
        });
        $("ul#bc_lista_clientes").show();
    }
}

// Llenar formulario
function bc_seleccionar(target) {
    var dataTarget = clientes[target];
    $("table#bc_cliente tbody .cb_datos").each(function() {
        switch ($(this).prop("tagName")) {
            case "INPUT":
            case "SELECT":
            case "TEXTAREA":
                $(this).val(dataTarget[$(this).attr("id")]);
                $(this).data("org", dataTarget[$(this).attr("id")])
                break;
            case "TD":
                $(this).text(dataTarget[$(this).attr("id")]);
                $(this).data("org", dataTarget[$(this).attr("id")])
                break;
        }
    });
    quienRegistroA();
    $("ul#bc_lista_clientes").hide();
    if (clientes[target].geoloc.length < 10) {// Si no tiene Geo busco la actual
       // getLocation();
    }else{
       //checkGeo();
       //verMapa(); 
    }   
    
    bc_verificarCambios();
    if(dataTarget.ci_ruc === "80005190-4"){
       $("#nombre").prop("readonly",true);
    }else{
       $("#nombre").prop("readonly",false);  
    }
    $("#contactos_tab").fadeIn();
    getContactos();
}
// Quien Registro
function quienRegistroA(){
    var param = {
        "action":"quienRegistroA",
        "CodCli":$("#cod_cli").val()
    };
    $.post("clientes/BuscarClientes.class.php", param, function(data) {
        $("#registradoPor").empty();
        if (Object.keys(data).length > 0) {
            $("#registradoPor").text(
                function(){
                    var datos = '';
                    $.each(data,function(key,value){
                        if($.trim(value) != ''){
                            datos += (data.length==0)?(key+': '+value):', '+(key+': '+value)
                        }
                    });
                    return datos;
                }
            );
        } else {
        }
    }, "json");
}
// Compruba cambios y errores
function bc_verificarCambios() {
    $("div#cb_msj").empty();
    $("div#cb_msj").removeClass();

    $("table#bc_cliente tbody .cb_datos").each(function() {
        // Colorea datos diferentes a los originales
        var changed = false;
        switch ($(this).prop("tagName")) {
            case "INPUT":
            case "SELECT":
            case "TEXTAREA":
                if ($(this).val() != $(this).data("org")) {
                    changed = true;
                }

                break;
            case "TD":
                if ($(this).text() != $(this).data("org")) {
                    changed = true;
                }
                break;
        }
        if (changed) {
            if (!$(this).hasClass("cb_changed")) {
                $(this).addClass("cb_changed");
            }
        } else {
            if ($(this).hasClass("cb_changed")) {
                $(this).removeClass("cb_changed");
            }
        }

        // Comprobar parametros
        switch ($(this).prop("id")) {
            case "ci_ruc":
            case "tipo_doc":
                $("input#ci_ruc").removeClass("st_error");
                var tipoDoc = $("select#tipo_doc option:selected").val();
                // Digito verificador
                if (tipoDoc === 'C.I.') {
                    var RUC = ($("input#ci_ruc").val()).trim().split("-");
                    $.post("clientes/BuscarClientes.class.php", { "action": "checkearRUC", "ruc": RUC[0], "tipo_doc": tipoDoc }, function(data) {
                        if (Object.keys(data).length > 0 && RUC.length > 1) {
                            if (data.DV != RUC[1]) {
                                $("div#cb_msj").html("El Digito Verificador del RUC debe ser:  " + data.DV);
                                $("div#cb_msj").addClass("error");
                                $("input#ci_ruc").addClass("st_error");
                            }
                        }
                        chkError();
                    }, "json").fail(function() {
                        chkError();
                    });
                }
                break;
            case "fecha_nac":
                // Valida Fecha
                $("input#fecha_nac").removeClass("st_error");
                if ($("input#fecha_nac").val().trim().length > 0) {
                    var parms = $("input#fecha_nac").val().trim().split(/\//);
                    var yyyy = parseInt(parms[2], 10);
                    var mm = parseInt(parms[1], 10);
                    var dd = parseInt(parms[0], 10);

                    var date = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
                    var chdd = (date.getDate() < 10) ? "0" + date.getDate().toString() : date.getDate().toString();
                    var chmm = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString();

                    chDate = $("input#fecha_nac").val().trim();
                    chVerifDate = chdd + '/' + chmm + '/' + date.getFullYear();

                    if (chDate !== chVerifDate) {
                        $("div#cb_msj").html("Fecha invalida:  " + chDate);
                        $("div#cb_msj").addClass("error");
                        $("input#fecha_nac").addClass("st_error");                        
                    }
                    chkError();
                }
                break;
                
        }
    });
}
// Muesta lista de sugerencias
function bc_mostrarlista() {
    if (Object.keys(clientes).length > 0) {
        if ($("ul#bc_lista_clientes").is(":visible")) {
            $("ul#bc_lista_clientes").hide();
        } else {
            $("ul#bc_lista_clientes").show();
        }
    }
}
var d ;
// Guarda los cambios en la base de datos
function bc_actualizarDatos() {
    bc_verificarCambios();
    $("div#cb_msj").removeClass();
    $("div#cb_msj").empty();
    var updateTicket = {};
    var data = {
        "action": "actualizarCliente",
        "cod_cli": $("input#cod_cli").val(),
        "suc": getSuc(),
        "usuario": getNick() 
    };
    if ($(".cb_changed").length > 0) {
        $(".cb_changed").each(function() {
            data[$(this).attr("id")] = $(this).val();
            switch($(this).attr("id")){                
                case 'ci_ruc':
                  updateTicket['ruc_cli'] = $(this).val();
                  break;
                case 'nombre':
                  updateTicket['cliente'] = $(this).val();
                  break;
                case 'tipo_doc':
                  updateTicket['tipo_doc_cli'] = $(this).val();
                  break;
                case 'cat':
                  updateTicket['cat'] = $(this).val();
                  break;
              } 
        });

        $.post("clientes/BuscarClientes.class.php", data, function(data) {   
            if (data.status == "Ok") {
                $(".cb_changed").each(function() {
                    $(this).data("org", $(this).val());
                    $(this).removeClass("cb_changed");
                    $("div#cb_msj").html(data.msj);
                    $("div#cb_msj").addClass(data.status);
                });
                 
                if(Object.keys(updateTicket).length > 0){
                    updateTicket['cod_cli'] = $("input#cod_cli").val();
                    $.post("clientes/BuscarClientes.class.php", {"action":"actualizarTickets","datos":JSON.stringify(updateTicket)}, function(data) {
                        $("div#cb_msj").append("<br>"+data);
                    }, "text");
                }  
            } else {
                $("div#cb_msj").html(data.msj);
                $("div#cb_msj").addClass(data.status);
                console.log(data.msj);
            }
        }, "json").fail(function() {
            $("div#cb_msj").html("Error de comunicacion!!!...");
            $("div#cb_msj").addClass("error");
            console.log("Error de comunicacion!!!...");
        });
    }

}
// Bloquea o libera el boton de actualización dependiendo si en los parametros hay error
function chkError() {
    if ($("*.cb_datos.st_error").length > 0) {
        $("button#bc_actualizarDatos").attr("disabled", "disabled");
    } else {
        $("button#bc_actualizarDatos").removeAttr("disabled");
    }
}
var scriptLoaded = false;
function checkGeo(){
     var longitude = $("#geoloc").val().split(",")[1];    
     if(longitude != undefined && !scriptLoaded ){
       loadGoogleScript();       
     }
}

function verMapa(){
    checkGeo();
    var proto = window.location.protocol;
    var ip =  window.location.href.substring(7,100).substring( 0,  window.location.href.substring(7,100). indexOf("inmopy/Main.class.php") - 1   );
    
    if(proto == "http:"){    
        var c = confirm("Para ver el Mapa debe navegar en modo Seguro, debera volver a ingreser su Usuario y contrase�a\nHaga clic en Avanzado confirmar Excepcion de Seguridad");
        if(c){
            console.log(ip);
            if(ip == "190.128.150.70:2222"){
                ip = "190.128.150.70:2443";     
            }
            window.location.href = "https://"+ip+"/inmopy";
        }        
    }else{
    
        var latitude = $("#GlblLocNum").val().split(",")[0];
        var longitude = $("#GlblLocNum").val().split(",")[1];
    
        if(longitude != undefined ){

            //$("#map").slideDown();

            var myCenter=new google.maps.LatLng(latitude,  longitude);
            var marker=new google.maps.Marker({
                position:myCenter
            });


            var mapProp = {
              center:myCenter,
              zoom: 8
            };
            /*,
              draggable: true,  
              scrollwheel: true*/
            var map=new google.maps.Map(document.getElementById("map"),mapProp);
            marker.setMap(map);
            markers.push(marker);

            map.addListener('dblclick', function(e) {            
                placeMarkerAndPanTo(e.latLng, map);
            });

        }else{
            if($("#CardCode").val()!=""){
               getLocation();
               setTimeout("checkGeo();",500);
               setTimeout("verMapa();",1000);            
            }
            //$("#map").slideUp();
        } 
    }
}

function getLocation() {
    if(!scriptLoaded){
        loadGoogleScript();
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setLocation);
    } else {
        errorMsg("Geolocalizacion no soportada por este navegador.",20000);
    }
}
function setLocation(position){
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    $("#GlblLocNum").val(lat+","+lon);
}
 
function placeMarkerAndPanTo(latLng, map) {    
    removeMarkers(null);
    var marker = new google.maps.Marker({
      position: latLng,
      map: map
    });
    var lat = marker.position.lat();
    var lon = marker.position.lng();
    $("#GlblLocNum").val(lat+","+lon);    
    map.panTo(latLng);
    map.setZoom(8);
    markers.push(marker);
    bc_verificarCambios();
}

function removeMarkers(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
}
function loadGoogleScript() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAI7rYqbkqVmU7hjoAvfRDSGh28biwzp00&zoom=8&size=500x600&callback=verMapa';
    document.body.appendChild(script);
    console.log('loadGoogleScript');
    scriptLoaded = true;
}

function setAnchorTitle(){
    $('option[title!=""]').each(function() { 
        var a = $(this); 
        a.hover(
            function() {
                showAnchorTitle(a, a.data('title'));
            },
            function() {
                hideAnchorTitle();
            }
        ).data('title', a.attr('title')).removeAttr('title');
    }); 
     
}
function showAnchorTitle(element, text) { 
    var offset = element.offset(); 
    var izq = offset.left -300;
    $('#anchorTitle').css({
        'top'  : (offset.top + element.outerHeight() + 4) + 'px',
        'left' : izq + 'px'
    }).html(text).show(); 
} 
function hideAnchorTitle() {
    $('#anchorTitle').hide();
}


function addContacto(){
   var c_id = $("#c_id").val();
   var cod_cli = $("#cod_cli").val();
   var nombre = $("#c_nombre").val();
   var doc = $("#c_doc").val();
   var tel = $("#c_tel").val();
   $.ajax({
        type: "POST",
        url: "proveedores/Proveedores.class.php",
        data: {action: "addContacto" ,c_id:c_id, cod_ent: cod_cli,  usuario: getNick(),nombre:nombre,doc:doc,tel:tel},
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
    var cod_cli = $("#cod_cli").val();
    $.ajax({
        type: "POST",
        url: "proveedores/Proveedores.class.php",
        data: {action: "getContactos", cod_ent: cod_cli},
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
    var cod_cli = $("#cod_cli").val();
    $.post("proveedores/Proveedores.class.php", { action: "delContacto", cod_ent: cod_cli,id:id} , function(data) {
       getContactos()
    });
}