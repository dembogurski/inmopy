
var nro_factura = 0;

var control_press = false;

$(document).ready(function() {/*     
    $("#marginTop").val(m_top);
    $("#intervaloVal").val(interval);
    $("#marginLeft").val(m_left);
    $("#marginRight").val(m_right);/*
    $("#marco").css("marginTop", m_top + "mm");
    $("#intervalo").css("height", interval + 'mm');
    $("#marco").css("margin-left", m_left + "mm");
    $("#marco").css("margin-right", m_right + "mm");*/
    /*
    $(".config").mouseleave(function() {
        closeConf()
    });    
    $(".config").mouseenter(function() {
        verConf()
    });

    jQuery(document).bind("keyup keydown", function(e) {
        if (e.ctrlKey || e.keyCode == 80) {
            control_press = true;
            closeConf();
            setTimeout(function(){control_press = false;},8000);
        }
    });
    */
  var papar_size = 9; // A4
  
  if(typeof( jsPrintSetup ) == "object") {  
    jsPrintSetup.setOption('marginTop', 0);
    jsPrintSetup.setOption('marginBottom', 0);
    jsPrintSetup.setOption('marginLeft', 0);
    jsPrintSetup.setOption('marginRight', 0);
    // set page header
    jsPrintSetup.setOption('headerStrLeft', '');
    jsPrintSetup.setOption('headerStrCenter', '');
    jsPrintSetup.setOption('headerStrRight', '');// &PT
    // set empty page footer
    jsPrintSetup.setOption('footerStrLeft', '');
    jsPrintSetup.setOption('footerStrCenter', '');
    jsPrintSetup.setOption('footerStrRight', '');
    jsPrintSetup.setOption("paperData",papar_size);
    // Suppress print dialog
    //jsPrintSetup.setSilentPrint(true);
    // Do Print
    jsPrintSetup.print();
    // Restore print dialog
    jsPrintSetup.setSilentPrint(false);
  }      
     
  self.print(); 
    
});

function quitarPreciosUnitarios(){
    var ch = $("#p_unit").is(":checked");
    if(ch){
        $(".incluir").html("-");
    }else{
        $(".incluir").each(function(){
           var v = $(this).attr("data-val");
           $(this).html(v);
        });        
    }
}

/**
 * Deprecated Ya no se cambian los nombres
 * @returns {undefined}
 */
function igualarNombres() {
    // Desabilitado por Motivos de Seguridad
    /*var nombre = $("#primer_nombre").val();   
     $("#segundo_nombre").val(nombre);
     var ci = $("#primer_ci").val();
     $("#segundo_ci").val(ci);*/
}

function verConf() {
    if(!control_press){
       $(".config").fadeIn("fast");
    }
}
function closeConf() { 
    $(".config").fadeOut("fast"); 
}

function saveMargins(key, value) {
    var usuario = $("#usuario").val();
    $.post("../Ajax.class.php", {action: "saveMargins", key: key, value: value,usuario:usuario});
}
function setIntervalo(sign) {    
    if (sign == "+") {
        interval +=1;
        $("#intervalo").css("height", interval +'mm');
        saveMargins("factura_interval_dup", interval);

    } else {
        interval -=1;
        $("#intervalo").css("height", interval + 'mm');
        saveMargins("factura_interval_dup", interval);
    }
    $("#intervaloVal").val(interval);
}

function setAltura(sign) {    
    if (sign == "+") {
        m_top +=1;
        $("#marco").css("marginTop", m_top + "mm");
        saveMargins("factura_margen_sup", m_top);
    } else {
        m_top -=1;
        $("#marco").css("marginTop", m_top + "mm");
        saveMargins("factura_margen_sup", m_top);
    }
    $("#marginTop").val(m_top);
}

function setMargen(sign, leftRight) {
    if(leftRight == 'Left'){
        if(sign == '-'){
            m_left -= 1;            
        }else{
            m_left += 1;
        }
        $("#marco").css("margin-left", m_left + "mm");
        saveMargins("factura_margen_izq", m_left);
        $("#marginLeft").val(m_left);
    }else{
         if(sign == '-'){
            m_right -= 1;            
        }else{
            m_right += 1;
        }
        $("#marco").css("margin-right", m_right + "mm");
        saveMargins("factura_margen_der", m_right);
        $("#marginRight").val(m_right);
    }
}

function change(Obj){
    var target = Obj.attr("id");
    var valor = Obj.val();
    if(isNaN(valor)){
        alert("Valor invalido");
    }else{
        switch(target){
            case "marginTop":
            $("#marco").css("marginTop", valor + "mm");
            saveMargins("factura_margen_sup", valor);
            break;
            case "intervaloVal":
            $("#intervalo").css("height", valor + "mm");
            saveMargins("factura_interval_dup", valor);
            break;
            case "marginLeft":
            $("#marco").css("margin-left", valor + "mm");
            saveMargins("factura_margen_izq", valor);
            break;
            case "marginRight":
            $("#marco").css("margin-right", valor + "mm");
            saveMargins("factura_margen_der", valor);
            break;
        }
    }
}

function loadParams(Obj){
    var user = Obj.find("option:selected").val();
    $.post("../Ajax.class.php", {action: "getUsersParams", user:user},function(data){
        m_top = parseInt(data.factura_margen_sup)||50;
        m_bottom = parseInt(data.factura_margen_inf)||0;
        m_left = parseInt(data.factura_margen_izq)||5;
        m_right = parseInt(data.factura_margen_der)||5;
        interval = parseInt(data.factura_interval_dup)||54;  

        $("#marco").css("marginTop", m_top + "mm");
        $("#intervalo").css("height", interval + 'mm');
        $("#marco").css("margin-left", m_left + "mm");
        $("#marco").css("margin-right", m_right + "mm");
        
        $("#marginTop").val(m_top);
        $("#intervaloVal").val(interval);
        $("#marginLeft").val(m_left);
        $("#marginRight").val(m_right);
    },'json');
}


function guardarTodo(){
    saveMargins("factura_margen_sup", m_top);
    saveMargins("factura_interval_dup", interval);
    saveMargins("factura_margen_izq", m_left);
    saveMargins("factura_margen_der", m_right);
}