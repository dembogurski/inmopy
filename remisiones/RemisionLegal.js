 
var nro_remito = 0;

var control_press = false;

$(document).ready(function() {
 
  
});
 
 
 
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