var canvas;
var svg;
var colorFondo = '#F8EFBA';
//var objetos =[];
 
$(function(){
    canvas = new fabric.Canvas('plano');
       
    var estante = 'A';
   
    var top = 40; 
    var left = 120;
    
    var alto = 180;
    var ancho = 40;
    var y = 0;
    var x = 6;
    var cant = 32;
    
    var nombre_estante = new fabric.Text("PORTA ROLLOS "+estante, {
       id:'NombreEstante',
       fontSize: 32,
       left: 40,
       top: 10 
   });
     canvas.add(nombre_estante);   
     for(var i = 1;i > 0 ;i--){  
        for(var j = cant;j > 0 ;j--){             
            var band = new Array();
             
            for(var k = 0;k<6;k++){
                var randcolor = '#'+Math.floor(Math.random()*16777215).toString(16);
                var rollo = new fabric.Circle({
                    id:"rollo_"+k+"_"+estante+"_"+i+"_"+j, 
                    radius: 12,
                    fill: "darkgray",
                    top: top + 180 + (k * 30),
                    left: left + ((32 * ancho) - (j * ancho))+ 2  
                });
            
            band.push(rollo); 
           }
            
            
            var rect = new fabric.Rect({
              id:"fondo_"+estante+"_"+i+"_"+j, 
              left: left + ((32 * ancho) - (j * ancho)) +10,
              top: top + (i * alto),
              fill: colorFondo,
              width: ancho-32,
              height: alto - 1,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
             
            band.push(rect); 
            
            var rueda = new fabric.Circle({
                id:"rueda_"+estante+"_"+i+"_"+j, 
                radius: 8,
                fill: 'black',
                top: top + (alto * 2) + 1,
                left: left + ((32 * ancho) - (j * ancho)) +20, 
            });
            band.push(rueda);  
            var buje = new fabric.Circle({
                id:"buje_"+estante+"_"+i+"_"+j, 
                radius: 4,
                fill: 'gray',
                top: top + (alto * 2) + 5,
                left: left + ((32 * ancho) - (j * ancho)) +24, 
            });
           
            
            var pol = new fabric.Polygon([
                {x: x , y: 0 },
                {x: x +14 , y: 0 },
                {x: x +20 , y: 10 },
                {x: x +12 , y: 10 } ], { 
                  id:"polig_"+estante+"_"+i+"_"+j, 
                  angle: 0,
                  fill: 'gray',              
                  stroke: 'black',
                  strokeWidth: 1,
                  top: top + (alto * 2) ,
                  left: left + ((32 * ancho) - (j * ancho)) + 10, 
                }
            );
            
             band.push(pol); 
             band.push(buje); 
             
            var text = new fabric.Text(estante+"."+i+"."+j, {
               id:"texto_"+estante+"_"+i+"_"+j, 
               fontSize: 10,
               left: left + ((32 * ancho) - (j * ancho))  +10,
               top: top + 160 ,
               angle: -45,
            });
            
            console.log(" left +  (j * ancho)  "+left+" "+j * ancho);
            
            band.push(text);
            var g = new fabric.Group(band, {
              id:""+estante+"_"+i+"_"+j,
              left: left + ((32 * ancho) - (j * ancho)) -80,
              top: top + 10 ,
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
                   var id = $(this).attr("id"); 
                   selectCuadrante(id); 
              }
            }); 
            canvas.add(g);
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


