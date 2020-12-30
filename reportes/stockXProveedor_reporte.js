var w;
var params = {};
$(function(){
    if (typeof(Storage) !== "undefined") sessionStorage.clear();
    $("input.mainParams").each(function(){
      params[$(this).prop("id")] = $(this).val();
    });
    startWorker();
});
/**
 * Buscar datos por compra
 */
function startWorker() {
    var total = $("tr.DocEntry").length;
    var target = $("tr.DocEntry:not(.inProcess,.processed)").get(0);
    var DocEntry = $(target).attr("id");
    var invoice = $($("tr#"+DocEntry+" td").get(1)).text();
  
    var progreso = $("tr.processed").length;
    var porsentajeProgreso = Math.round((progreso*100)/total);
    $("div#barra_progreso").css("width",porsentajeProgreso+"%");
    $("span#progreso_info").text("Obteniendo datos, Invoice:"+invoice+", progreso: "+porsentajeProgreso+"%");
    $("img#reporte_loader").show();
    if(typeof(Worker) !== "undefined" && DocEntry !== "undefined") {
        if(typeof(w) == "undefined") {
            $(target).addClass('inProcess');
            w = new Worker("stockXProveedorWorker.js");
            params['select_docentry']=DocEntry.split('_')[1]
            //console.log(params);
            w.postMessage(params);
        }
        w.onmessage = function(event) {
            var de = event.data.DocEntry;
            $("tr#DocEntry_" + de).removeClass('inProcess');
            if (typeof(Storage) !== "undefined") {
                var respuesta = event.data.data;
                if(typeof(respuesta) !== "undefined" && respuesta !== null){
                    if(respuesta.length > 0){
                        var tmp = sessionStorage.getItem('lotes');
                        tmp = (tmp === null) ? [] : JSON.parse(tmp);
                        respuesta.forEach(function(value, i){
                            tmp.push(value);
                        });
                        sessionStorage.setItem('lotes', JSON.stringify(tmp));
                    }
                    filtrar();
                    colores();
                }
            }
            $(target).addClass('processed');
            stopWorker();
        };
    } else {
        console.log("Este navegador no soporta la funcion Worker actualice a una version mas nueva!!");
    }
}

function stopWorker() { 
    w.terminate();
    w = undefined;
    if(w == undefined && $("tr.DocEntry:not(.inProcess,.processed)").length > 0){
      startWorker();
    }else{
      $("div#barra_progreso").css("width","100%");
      $("span#progreso_info").text("100%");
      $("img#reporte_loader").hide();
    }
}

// Reportes
function filtrar(){
  var filtros = [];
  $("input.filtroReporte:checked").each(function(){
    filtros.push($(this).data("target"));
  });
  reporteX(filtros);
}

function verificarFiltro(){
  var fs = $("select#filtroStock option:selected").val();
  $("input#filtroVal02").prop("disabled",true);
  if(fs == "entre"){
    $("input#filtroVal02").prop("disabled",false);
  }
  filtrar();
}

function reporteX(filtro){
  var reporte = [];
  var datos = JSON.parse(sessionStorage.getItem('lotes'));
  var fStockSigno = $("select#filtroStock option:selected").val();
  var fVal01 = $("input#filtroVal01").val();
  var fVal02 = $("input#filtroVal02").val();
  var fColor = $("select#filtroColor option:selected").text();
  

  if(datos === null){
    //alert("No hay datos que procesar");
  }else{
    datos.forEach(function(valor,i){
      var filtroStock = (fStockSigno == 'entre')? (parseFloat(valor.Stock)+' >= '+fVal01+' && '+parseFloat(valor.Stock)+' <= '+fVal02) : (parseFloat(valor.Stock)+fStockSigno+fVal01);
      
      fS = eval(filtroStock);
      if((fS && valor.Color == fColor) || (fS && fColor == 'Todos')){
        if(reporte.length == 0){
          reporte[0] = {};
          for(i in filtro){
            reporte[0][filtro[i]] = valor[filtro[i]];
          }
          reporte[0].Stock = parseFloat(valor.Stock);
        }else{
          var param = {};
          for(i in filtro){
            param[filtro[i]] = valor[filtro[i]];
          }
          var index = existe(reporte, param);
          //console.log(index);
          if(index > -1){
            reporte[index].Stock += parseFloat(valor.Stock);
          }else{
            var elemento = {};
            for(i in filtro){
              elemento[filtro[i]] = valor[filtro[i]];
            }
            elemento.Stock = parseFloat(valor.Stock);
            reporte.push(elemento);
          }    
        }
      }
    });
    dibujarTabla(reporte);
  }
}

function dibujarTabla(reporte){
    $("table#repRes").remove();
    var tabla = $("<table/>",{"id":"repRes"});
    var first = true;
    var total = 0;
    var columnas = 0;
    if(reporte.length > 0){
        reporte.forEach(function(valor,i){
            var tr = $("<tr/>");
            var trh = $("<tr/>");
            $.each(valor,function(key, value){
                if(first){
                   $("<td/>",{"text":key}).appendTo(trh);
                   columnas ++;
                }
                if(key == 'Stock'){
                    total += value;
                    $("<td/>",{"align":"right","text":(value).toFixed(2)}).appendTo(tr);
                }else{
                    $("<td/>",{"text":value}).appendTo(tr);
                }
            });
            if(first){
                trh.appendTo(tabla);
                first = false;
            }
            tr.appendTo(tabla);
        });
    }
    var trf = $("<tr/>");
    $("<td/>",{"colspan":columnas-1}).appendTo(trf);
    $("<td/>",{"align":"right","text":total.toFixed(2)}).appendTo(trf);
    trf.appendTo(tabla);

    $("td.reporte_lista").append(tabla);
}
 function colores(){
  $("select#filtroColor option.dataSync").remove();
  var datos = JSON.parse(sessionStorage.getItem('lotes'));
  if(datos !== null){
    var colores = [];
    datos.forEach(function(valor,i){
      if(colores.indexOf(valor.Color) == -1){
        colores.push(valor.Color);
      }
    });
    colores = colores.sort();
    if(colores.length > 0){
      for(color in colores){
        //console.log(colores[color])
        $("<option/>",{"class":"dataSync","text":colores[color]}).appendTo("select#filtroColor");
      }
    }
  }
}

/**
 * Verifica la  extencia de uno o varios elemento en un array
 * @param arr (array)
 * @param search (Object)
*/
function existe(arr, search){
  var existe = -1;
  var verif = Object.keys(search).length;  
  arr.forEach(function(valor, i){
    var ocurrencias = 0;
    for(t in search){
      if(search[t] === valor[t]){
        ocurrencias += 1;
      }
    }
    if(ocurrencias == verif){
      existe = i;
    }
  });
  return existe;
}
