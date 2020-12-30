

var action ="";
var master_acc = 1;
var array ;

function configurar(){
      
    $("select > option:nth-child(even)").css("background","#F0F0F5"); // Color Zebra para los Selects
    $(".cta_nivel1").click(function(){
        $(".gavetaAbierta").removeClass("gavetaAbierta");
        $(this).addClass("gavetaAbierta");
        getPlanCuenta($(this).attr("data-cta_num"));
    });
    getPlanCuenta(1); //Activo
    $("#cuenta").change(function(){
        var cuenta = $(this).val(); 
        $("#nivel").val(cuenta.length);
    });
    $("#editable_form  .cta_input").change(function(){
         checkForm();
    });
    
}

function getPlanCuenta(cuenta_master){
    $.ajax({
        type: "POST",
        url: "finanzas/PlanCuentas.class.php",
        data: {action: "getPlanCuenta", cuenta_master: cuenta_master,usuario:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#cuentas").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            array = new Array();
            master_acc = cuenta_master;
            var current_level = 0;
            
            var plan = $('<ul></ul>');  
            for (var i in data) { 
                var cuenta = data[i].cuenta;                
                var nombre_cuenta = data[i].nombre_cuenta;
                var moneda = data[i].moneda;   
                var padre = data[i].padre;
                var nivel = data[i].nivel;
                var saldo = parseFloat(data[i].saldo).format(2, 3, '.', ',') ;
                var saldoMS = parseFloat(data[i].saldoMS).format(2, 3, '.', ',') ;
                var suc = data[i].suc;
                var estado = data[i].estado;
                var tipo = data[i].tipo;
                var asentable = data[i].asentable;
                //var dots = cuenta.match(/\./g).length;
                
                var bolder = "";
               
                if(nivel !== current_level){
                    bolder = " title_acc";
                } 
                 var li = $('<li/>').addClass("level_"+nivel+""+bolder+" padre_"+padre+"")
                        .attr('data-moneda', moneda )
                        .attr('data-cuenta', cuenta )
                        .attr('data-padre', padre )
                        .attr('data-nivel', nivel )
                        .attr('data-saldo', saldo )
                        .attr('data-saldoMS', saldoMS )
                        .attr('data-suc', suc )
                        .attr('data-estado', estado )
                        .attr('data-nombre', nombre_cuenta )
                        .attr('data-tipo', tipo )
                        .attr('data-asentable', asentable )
                        .text(cuenta+" - "+nombre_cuenta)
                        .appendTo(plan);  
            }
               
            $("#cuentas").html(plan);
            
            $("ul li").click(function(){
                var $this = $(this);
                $(".cuenta_selected").removeClass("cuenta_selected");
                $(this).addClass("cuenta_selected");
                var cuenta = $this.attr("data-cuenta");
                var nombre = $this.attr("data-nombre");
                var moneda = $this.attr("data-moneda");
                var nivel = $this.attr("data-nivel");
                var saldo = $this.attr("data-saldoMS");
                var estado = $this.attr("data-estado");
                var suc = $this.attr("data-suc");
                var tipo = $this.attr("data-tipo");
                var asentable = $this.attr("data-asentable");
                
                $("#cuenta").val(cuenta);
                $("#nombre").val(nombre);
                $("#cta_moneda").val(moneda);
                $("#nivel").val(nivel);
                $("#saldo").val(saldo);
                $("#cta_suc").val(suc);
                $("#cta_tipo").val(tipo);
                $("#cta_asentable").val(asentable);
                $("#cta_estado").val(estado); 
            });
            $("#nuevo").prop("disabled",false); 
            $("#modificar").prop("disabled",false); 
            $("#aceptar").prop("disabled",true);
            $("#editable_form .cta_input:not(select)").removeClass("editable").val("");
        }
    }); 
}
function checkForm(){
    var cuenta = $("#cuenta").val();
    var nombre = $("#nombre").val();
    if(cuenta.length > 1 &&  nombre.length > 5){        
        $("#aceptar").prop("disabled",false);
    }else{
        $("#msg").html("Rellene los campos requeridos");
        $("#aceptar").prop("disabled",true);
    }
    
}
function modificar(){
    var cuenta = $("#cuenta").val();
    if(cuenta != ""){
        $(".cta_input").prop("disabled",false);
        $(".cta_input:not(#cuenta)").prop("readonly",false);
        $("#editable_form  .cta_input:not(select)").addClass("editable");
        $("#nuevo").prop("disabled",true);
        action = "modificar";    
    }
}

function nuevaCuenta(){
    var cuenta = $("#cuenta").val();
    $(".cta_input").prop("disabled",false);
    $(".cta_input").prop("readonly",false);
    $("#editable_form .cta_input:not(select)").removeClass("editable");
    $("#modificar").prop("disabled",true);
    $(".cta_input").val("");
    $("#cta_suc").val("*");
    action = "registrar";
    
    var padre =  $(".cuenta_selected").attr("data-padre");
    var ultima = $(".padre_"+padre).last().attr("data-cuenta");
    var nivel = $(".padre_"+padre).last().attr("data-nivel");
    
    var diff = ultima.length - padre.length;
    
    var term = ultima.substring(padre.length,ultima.length  );
    
    var sig = pad( parseInt(term) + 1,diff); 
    
    console.log("term "+term+"  diff "+diff+"   sig "+sig); 
    
    var nueva_cuenta = padre+sig;
    $("#cuenta").val(nueva_cuenta);
    $("#nivel").val(nivel);
}

function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

function aceptar(){
    var cuenta = $("#cuenta").val();
    var nombre = $("#nombre").val();
    var moneda = $("#cta_moneda").val();
    var nivel  = $("#nivel").val();
    var suc  = $("#cta_suc").val();
    var estado = $("#cta_estado").val();  
    var tipo  = $("#cta_tipo").val();
    var asentable  = $("#cta_asentable").val();
    if(action === "modificar" || action === "registrar"){
        $.ajax({
            type: "POST",
            url: "finanzas/PlanCuentas.class.php",
            data: {action: "actualizarORegistrar", accion:action, suc: suc, usuario: getNick(),cuenta:cuenta,nombre:nombre,moneda:moneda,nivel:nivel,tipo:tipo,asentable:asentable,estado:estado},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if(data.mensaje === "Ok"){
                   $("#msg").html("Ok"); 
                   getPlanCuenta(master_acc);
                }else{
                    $("#msg").html("Error al "+action+" cuenta:  "   );   
                }
            },
            error: function(e) {                 
                $("#msg").html("Error al "+action+" cuenta:  " + e  );   
                errorMsg("Error al "+action+" cuenta:  " + e,10000);
            }
        });         
    }else{ 
        errorMsg("Elija una opcion Modificar o Registrar uno nuevo",10000);
    } 
}
 