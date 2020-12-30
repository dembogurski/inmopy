/**
 * Cockie Setter
 * @param {type} cname
 * @param {type} cvalue
 * @param {type} exdays
 * @returns {undefined}
 */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
/**
 * Funcion que obtiene los datos de usuario
 * 
 *   de la cookie y los carga en un Objeto json
 * 
 * @param {String} cookieName
 * @returns {Object} 
 */
function getCookie(cookieName) {
    var cookies = document.cookie.split(';');
    var cookie = "";
    var usu = new Object();

    for (var i in cookies) {
        cookie = cookies[i].split('=');
        if (cookie[0].trim() === cookieName) {
            usu.usuario = cookie[0];
            usu.sesion = cookie[1];
        }
        if (cookie[0].trim() === "expira_" + cookieName) {
            usu.expira = parseInt(cookie[1]);
        }
        if (cookie[0].trim() === "logInTime_" + cookieName) {
            usu.tiempoInicio = cookie[1];
        }
        if (cookie[0].trim() === "suc_" + cookieName) {
            usu.suc = cookie[1];
        }        
    }
    return usu;
}

function getNick(){
    return $("#nick").html();
}
function getSuc(){
    return getCookie(getNick()).suc;
}

function getOS(){
    var OSName="Unknown OS";
    if (navigator.appVersion.indexOf("Win")!==-1) OSName="Windows";
    if (navigator.appVersion.indexOf("Mac")!==-1) OSName="MacOS";
    if (navigator.appVersion.indexOf("X11")!==-1) OSName="UNIX";
    if (navigator.appVersion.indexOf("Linux")!==-1) OSName="Linux";
    return OSName;
}

function load(url,parameters,callback){
        var callback = callback||function(){};
        parameters.touch = touch;
        
        $.ajax({
            type: "POST",
            url: url,
            data: parameters,
            async:true,
            dataType: "html",
            beforeSend: function(objeto){ 
                hideMenu();
                $("#work_area").html("<img id='loading' src='img/loading.gif'>");
            },
            complete: function(objeto, exito){
                if(exito==="success"){ 
                    $("#work_area").html(objeto.responseText  );  
                    callback();
                }
            }
        }); 
    
}

function genericLoad(link){    
    load(link,{usuario:getNick(),session:(getCookie(getNick()).sesion),suc:getSuc()}, function(){ configurar(); });  
}

jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
};

/**
 * Funcion pare generar Factura de Venta
 * @param {String} link
 */
 
  
// Compras


function comprasEnProseso(link){   
    load(link,{usuario:getNick(),session:(getCookie(getNick()).sesion),suc:getSuc(),estado:"En Proceso"});
}

function entradaMercaderias(link){   
    load(link,{usuario:getNick(),session:(getCookie(getNick()).sesion),suc:getSuc()},function(){ preconfigurar(); });
}
function descargaYRecepcion(link){   
    load(link,{usuario:getNick(),session:(getCookie(getNick()).sesion),suc:getSuc(),estado:"En Transito"},function(){ preconfigurar(); });
}

function fraccionamientoLogico(link){
    load(link,{usuario:getNick(),session:(getCookie(getNick()).sesion),suc:getSuc(),estado:"Cerrada"},function(){ configure(); });
}
function notasPedidoAbiertas(link){ // No funciona con genericLoad xq clientes tiene tb un metodo configurar
    load(link,{usuario:getNick(),session:(getCookie(getNick()).sesion),suc:getSuc()},function(){ configurarNP(); });
} 
 
function cargarReserva(reserva){
    var usuario = getNick(); 
    var session = getCookie(usuario).sesion;    
    load("reservas/CargarReserva.class.php",{usuario:usuario,session:session,reserva:reserva}, function(){ $("#area_carga").fadeIn("fast",function(){ $("#lote").focus(); preconfigurar(); });   } );
}

// Metodo para cargar una Nota de Credito
function cargarNotaCredito(nro_nota,factura,clase){
    var usuario = getNick(); 
    var session = getCookie(usuario).sesion;    
    load("notas_credito/CargarNotaCredito.class.php",{usuario:usuario,session:session,nro_nota:nro_nota,factura:factura}, function(){ 
        $("#area_carga").fadeIn("slow",function(){ 
            if(clase === "Articulo"){
               buscarDetallesFacturaXArticulo(factura,nro_nota,false,clase);                
            }else{
               buscarDetallesFacturaXServicio(factura,nro_nota,false,clase);
            }
            flag = true;  
        });   
    } );
}
  
 

function cargarNotaRemision(nro_remito){   
    var session = getCookie(getNick()).sesion;    
    load("remisiones/CargarNotaRemision.class.php",{usuario:getNick(),session:session,nro_remito:nro_remito}, function(){ 
        preConfigurar(); 
        $("#area_carga").fadeIn("fast",function(){  
            $("#lote").focus(); 
        });   
    } );
}
function cargarNotaRemisionEnProceso(nro_remito){ 
    var session = getCookie(getNick()).sesion;    
    load("remisiones/CargarNotaRemisionEnProceso.class.php",{usuario:getNick(),session:session,nro_remito:nro_remito}, function(){ $("#area_carga").fadeIn("slow",function(){  }); preConfigurar();   } );
}

 
/**
 * Funcion perfilAndPassword
 * @link {type} no lo se
 */ 
function perfilAndPassword(link){
    var usuario = getNick(); 
    var session = getCookie(usuario).sesion;    
    load(link,{action:"miPerfil",usuario:usuario,session:session});
}
function credencial(link){
    var usuario = getNick(); 
    var session = getCookie(usuario).sesion;    
    load(link,{action:"showform",usuario:usuario,session:session});
}



/**
 * Funncion para mostrar la flecha en una tabla cuando el mouse se encuentra encima de un td
 * @param {type} clase
 * @returns {undefined}
 */

function inicializarCursores(clase){
    $("."+clase).mouseover(function(){
        $(".cursor").remove(); // Se saco a todos los que tienen
        $(this).append("<img class='cursor' src='img/l_arrow.png' width='18px' height='10px'>");
    }).mouseleave(function(){
        $(this).children('.cursor').remove();
    });   
}
/**
 * Verifica si es un RUC valido 
 * @param {String} ruc el numero de ruc entre 5 y 18 caracteres antes el guion, un solo caracter depues del guion
 * @returns {Boolean} su es un RUC correcto devuelve true
 */
function validRUC(ruc) {
    var pattern = /^[0-9]{5,10}-{1}[0-9]{1}$/;
    return(pattern.test(ruc));
}
/**
 * 
 * @param {String} date formato dd/mm/yyyy
 * @param {String} spChar (Opcional) separador '/' por defecto
 * @returns {Boolean} verdadero si la fecha es correcta
 */
function validDate(date) {
    var separador = '/';
    var date = date.replace(/\s/g,"").replace(/\D/g,"/");
    var fecha = date.split(separador); 
    var dia,anio = 0;
    (parseInt(fecha[0])>1000)?dia = parseInt(fecha[2]):dia = parseInt(fecha[0]);
    var mes = parseInt(fecha[1]);
    (parseInt(fecha[2])>1000)?anio = parseInt(fecha[2]):anio = parseInt(fecha[0]);
    var flag = true;
    
    if(fecha.length!==3){flag = false; }
    if(isNaN(dia)||isNaN(mes)||isNaN(anio)){flag = false; }
    if (mes > 12 || (dia > 31 || dia < 1)) {
        flag = false; 
    } else if (mes === 2) {
        if (dia > 28) {
            if (!((anio % 4 === 0 && anio % 100 !== 0) || (anio % 400 === 0))) {
                flag = false;
            }
        }
    }
    if ((mes === (4 || 6 || 9 || 11)) && (dia > 30 || dia < 1)) {
        flag = false; 
    }
    if(mes<10)mes = "0"+mes.toString();
    if(dia<10)dia = "0"+dia.toString();
    return {"estado":flag,"fecha":anio+'-'+mes+'-'+dia};
}

/**
 * Verifica si un texto contien caracteres validos segun criterios establecidos
 * texto, caracter latino, &
 * @param {String} source Texto a verificar
 * @param {type} length (Opcional) Longitud minima del texto
 * @returns {Boolean} si el valido true
 */
function validString(source,length){
    var len = length || 3;   
    //Vocales con acento y las enies
    var lChar = /[\u00C1-\u00E1-\u00C9-\u00E9-\u00CD-\u00ED-\u00D3-\u00F3-\u00DA-\u00FA &]/g;
    var filter = source.replace(/\w/g,"").replace(/\s/g,"").replace(lChar,"");
    var flag = true;
    
    if(source.trim().length<len){
        flag = false;
    }    
    if(filter.length>0){
        flag = false;
    }    
    return flag;
}   

/**
 * Verifica si un texto contiene caracteres validos de un telefono
 *  numeros y guion (-)
 * @param {String} source Texto a verificar
 * @param {type} length (Opcional) Longitud minima del texto
 * @returns {Boolean} si el valido true
 */

function validPhone(source,length){
    var len = length || 6;
    //var filter = source.replace(/\d/g,"").replace(/\s/g,"").replace(/[-]{2}/,"");
    var filter = source.replace(/\d/g,"").replace(/\s/g,"").replace(/[-]{0,2}/,"");
      
    var flag = true;
    
    if(source.trim().length<len){
        flag = false;
    }
    if(filter.length>0){
        flag = false;
    }
    return flag;
}
/**
 * Valida que una direccion tenga formato y caracteres correctos
 * @param {String} source e-mail
 * @returns {Boolean}
 */
function validMail(source){
    var patt = /^[a-zA-Z0-9\_\.]{3,}@{1}[a-z0-9\_\.]{3,}\.[a-z0-9]{2,3}$/;
    return patt.test(source);
}
 
function onlyNumbers(e) {
     //e.preventDefault();
     var tecla = new Number();
     if (window.event) {
         tecla = e.keyCode;
     } else if (e.which) {
         tecla = e.which;
     } else {
         return true;
     }
     if (tecla === "13") {
         this.select();
     }
     //console.log(e.keyCode+"  "+ e.which);
     if ((tecla >= "97") && (tecla <= "122")) {
         return false;
     }
 }
 
/**
 * Redondeo de decimales 0.00
 * @param {float} numero
 * @returns {float} numero redondeado a dos decimales
 */
function redondear(numero){
  return (Math.ceil((numero-parseInt(numero))*100)/100)+parseInt(numero);  
}

/**
 * Formateador de Numeros
 * @param {int} n  cantidad de decimales
 * @param {int} x  posicion del separador de miles
 * @param {char} separador de miles  "."
 * @param {char} indicador de decimales ","
 * @returns {Number.prototype.format@call;toFixed|Number.prototype.format.num}
 */
Number.prototype.format = function(n, x, s, c) {           
    var s_ = s || ".";   
    var c_ = c || ",";   
    
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c_ ? num.replace('.', c_) : num).replace(new RegExp(re, 'g'), '$&' + (s_ || ','));
};

/**
 * Dado un valor devuelve otro en funcion del % 50 Ej.:  14521 --> 14500,  14532 --> 14550    
 * Resolucion 347 SEDECO
 * @param {float} valor
 * @param {string} moneda 
 * @returns {redondear.valor_redondeado}  
 */
  
function redondearMoneda(valor,moneda){
    var multiplo =50;
    var umbral = 25;
    if(moneda !== "G$"){
      multiplo = 0.05; 
      umbral = 0.025;
    }
    
    var resto = valor % multiplo;    
    var valor_redondear = 0;
    if(resto >= umbral ){
        valor_redondear = parseFloat(multiplo - resto);          
    }else{
        valor_redondear = resto * -1;        
    }  
    var valor_redondeado =  parseFloat(valor) + parseFloat(valor_redondear);     
    return valor_redondeado; 
}

/**
 * Ayuda a la Memoria del Programador
 */
function ayuda(){
    console.log("Enable Firefox Touch detection:  about:config set to 1 variable named dom.w3c_touch_events.enabled");
    return "Fin.";
}
