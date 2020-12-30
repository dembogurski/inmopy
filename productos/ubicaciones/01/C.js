var canvas;
var svg;
var colorFondo = '#95a5a6';
//var objetos =[];
 
$(function(){
    canvas = new fabric.Canvas('plano');
       
    var estante = 'C';
    // C
    var top = 20; 
    var left = 0;
    
    var alto = 50;
    var ancho = 120;
    var y = 0;
    var nombre_estante = new fabric.Text("ESTANTE "+estante, {
        id:'NombreEstante',
        fontSize: 32,
        left: 40,
        top: 10 
   });
     canvas.add(nombre_estante);   
     for(var i = 5;i > 0 ;i--){  
        for(var j = 11;j > 0 ;j--){             
            var band = new Array();
            
            var rect = new fabric.Rect({
              id:"fondo_"+estante+"_"+i+"_"+j, 
              left: left + (j * ancho) -200,
              top: top + (i * alto),
              fill: colorFondo,
              width: ancho-1,
              height: alto - 1,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
             
            band.push(rect); 
              
            var pol = new fabric.Polygon([
                {x: -2 , y: 0 },
                {x: 112 , y: 0 },
                {x: 114 , y: 10 },
                {x: -5 , y: 10 } ], { 
                  id:"polig_"+estante+"_"+i+"_"+j, 
                  angle: 0,
                  fill: 'white',              
                  stroke: 'black',
                  strokeWidth: 1,
                  left: left + (j * ancho) -200,
                  top: top + 40 + (i * alto) 
                }
            );
            
            band.push(pol);
             
            var text = new fabric.Text(estante+"."+i+"."+j, {
               id:"texto_"+estante+"_"+i+"_"+j, 
               fontSize: 10,
               left: left + (ancho / 2)- 5 + (j * ancho) -200,
               top: top + alto - 10 + (i * alto),
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
                   var id = $(this).attr("id");   console.log("ID:  "+id);
                   selectCuadrante(id); 
              }
            }); 
            canvas.add(g);
            var timeoutTriggered = false;

            function stopDragging(element) {
              element.lockMovementX = true;
              element.lockMovementY = true;
            }

            function onMoving(e) {
              if (!timeoutTriggered) {
                setTimeout(function() {
                  stopDragging(e.target);
                }, 500);
                timeoutTriggered = true;
              }
            }
            canvas.on({
              'object:moving': onMoving
            });
        }
        y +=alto;
    } 
     canvas.on('selection:created', function () {
        cuadrantesSeleccionados();
     }); 
     canvas.on('selection:cleared', function () {
        liberarCuadrantes();
     });
});

