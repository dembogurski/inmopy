var canvas;
var svg;
var colorFondo = '#e15f41';
//var objetos =[];
 
$(function(){
    canvas = new fabric.Canvas('plano');    
    
    var estante = $("#canasto").val();   
    var i = 1;
    var j = 1;
    // AA
    var top = 30; 
    var left = 100;
    
    var alto = 200;
    var ancho = 360;
    var y = 0;
    var x = 6;
    var nombre_estante = new fabric.Text("CANASTO "+estante, {
        id:'NombreEstante',
        fontSize: 32,
        left: 40,
        top: 10 
   });
     canvas.add(nombre_estante);   
           
            var band = new Array();
            
            var rect = new fabric.Rect({
              id:"fondo_"+estante+"_"+i+"_"+j, 
              left: 0,
              top: 0,
              fill: colorFondo,
              width: ancho ,
              height: alto ,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
            
            var bar1 = new fabric.Rect({
              id:"bar_"+estante+"_"+i+"_"+j,     
              left: 0,
              top: -56,
              fill: "white",
              width: ancho ,
              height: 4 ,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
            var bar2 = new fabric.Rect({   
              id:"bar_"+estante+"_"+i+"_"+j,     
              left: 0,
              top: -4,
              fill: "white",
              width: ancho ,
              height: 4 ,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
            
             band.push(rect,bar1,bar2); 
            
            for(var k = 0; k < 5; k++){
                var bar = new fabric.Rect({ 
                  id:"bar_"+estante+"_"+i+"_"+j,   
                  left: 0,
                  top: -46 + (k * 8),
                  fill: "white",
                  width: ancho ,
                  height: 2 ,
                  angle: 0,
                  stroke : 'black',
                  strokeWidth : 1
                });  
                band.push(bar); 
            }
            var foot1 = new fabric.Rect({   
              id:"foot_"+estante+"_"+i+"_"+j,   
              left: -4,
              top: -58,
              fill: "white",
              width: 8 ,
              height: alto + 100 ,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
            var foot2 = new fabric.Rect({   
              id:"foot_"+estante+"_"+i+"_"+j,     
              left: ancho ,
              top: -58,
              fill: "white",
              width: 8 ,
              height: alto + 100 ,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
            band.push(foot1,foot2); 
            
            
            
            var rueda1 = new fabric.Circle({
                id:"rueda_"+estante+"_"+i+"_"+j, 
                radius: 8,
                fill: 'black',
                top: alto + 44 ,
                left: 0, 
            });
            var rueda2 = new fabric.Circle({
                id:"rueda_"+estante+"_"+i+"_"+j, 
                radius: 8,
                fill: 'black',
                top: alto + 44 ,
                left: ancho + 4, 
            });
             band.push(rueda1,rueda2);  
             
            var buje1 = new fabric.Circle({
                id:"buje_"+estante+"_"+i+"_"+j, 
                radius: 4,
                fill: 'gray',
                top: alto + 48 ,
                left: 4,
            });
           var buje2 = new fabric.Circle({
                id:"buje_"+estante+"_"+i+"_"+j, 
                radius: 4,
                fill: 'gray',
                top: alto + 48 ,
                left: ancho + 8,
            });
            
            var pol1 = new fabric.Polygon([
                {x: x , y: 0 },
                {x: x +14 , y: 0 },
                {x: x +20 , y: 10 },
                {x: x +12 , y: 10 } ], { 
                  id:"polig_"+estante+"_"+i+"_"+j, 
                  angle: 0,
                  fill: 'gray',              
                  stroke: 'black',
                  strokeWidth: 1,
                  top: alto + 40,
                  left: -8, 
                }
            );
            var pol2 = new fabric.Polygon([
                {x: x , y: 0 },
                {x: x +14 , y: 0 },
                {x: x +20 , y: 10 },
                {x: x +12 , y: 10 } ], { 
                  id:"polig_"+estante+"_"+i+"_"+j, 
                  angle: 0,
                  fill: 'gray',              
                  stroke: 'black',
                  strokeWidth: 1,
                  top: alto + 40,
                  left: ancho -4, 
                }
            );
             band.push(pol1,pol2);  
             band.push(buje1,buje2);              
            
            
            
            var text = new fabric.Text(estante+"."+i+"."+j, {
               id:"texto_"+estante+"_"+i+"_"+j, 
               fontSize: 16,
               left: 150,
               top: 86  ,
               fill: "white"
            });
            band.push(text);
            var g = new fabric.Group(band, {
              id:""+estante+"_"+i+"_"+j,
              left: left + (j * ancho) -80,
              top: top + 30 + y,
              cornerSize: 6,
              borderColor: 'gray',
              cornerColor: 'orange', 
              transparentCorners: false
            }); 
             
            var timer = 0;
            g.on('mouseup', function() {
              var d = new Date();
              timer = d.getTime();
            });
            g.on('mousedown', function(e) {  
              var d = new Date();
              if ((d.getTime() - timer) < 300) {
                   var id = $(this).attr("id"); console.log("ID:  "+id);
                   selectCuadrante(id); 
              }
            }); 
            canvas.add(g);
         
        y +=alto;
      
     canvas.on('selection:created', function () {
        cuadrantesSeleccionados();
     }); 
     canvas.on('selection:cleared', function () {
        liberarCuadrantes();
     });
});

