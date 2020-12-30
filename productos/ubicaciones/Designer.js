

function canasto(letra,izq,arriba,angulo,canvas  ){
    var c = new Array();     
        var rect = new fabric.Rect({
          id:letra+"1",
          left: -8   ,
          top: 5,
          fill: '#e15f41',
          width: 30,
          height: 30,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1 
        }); 
        
        var text = new fabric.Text(letra, {
           fontSize: 14,
           left: -3  ,
           top: 12,
           angle: 0,
           fill:'white'
        });
        c.push(rect,text);
    
   var grupo = new fabric.Group(c, {
      id:letra,
      left: izq,
      top: arriba ,
      angle: angulo
    });
    
    addOnDbleClickEnvent(grupo,"Canasto");
    canvas.add(grupo);    
};

function paredVidrio(left,top,height,angle,canvas){
    var pared = new Array();
     var v1 = new fabric.Rect({ 
          left: left-4,
          top: top,
          fill: 'gray',
          width: 1,
          height: height,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });
     var vidrio = new fabric.Rect({ 
          left: left,
          top: top,
          fill: 'gray',
          width: 3,
          height: height,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });
    var v2 = new fabric.Rect({ 
          left: left+6,
          top: top,
          fill: 'gray',
          width: 1,
          height: height,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });
    pared.push(v1,vidrio,v2);
    var grupo = new fabric.Group(pared, {
      id:"pared_vidrio",
      left: left,
      top: top ,
      angle: angle
    });
    canvas.add(grupo);
}

function bandejas2D(letra,columnas,left, top, angle,  band_width,band_height,canvas){

    var band = new Array();
    for(var i = columnas;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:letra+i,
          left: left  - (i * band_width),
          top: 0,
          fill: 'lightgray',
          width: band_width,
          height: band_height,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        band.push(rect);
        var tamletra = (letra+""+i).length;
        var text = new fabric.Text(letra+i, {
           fontSize: 14,
           left:left  - (i * band_width) + ( band_width / 2) - (tamletra * 2) ,
           top: band_height / 2 - 5
        });
        band.push(text);
   }
   var grupo = new fabric.Group(band, {
      id:letra,
      left: left,
      top: top,
      angle:angle
    });
    
    addOnDbleClickEnvent(grupo);
    canvas.add(grupo);    
};

function mesas2D(letra,columnas,left, top, angle,  band_width,band_height,canvas){
     
var mesa = new Array();
    for(var i = columnas;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:letra+i,
          left: left  - (i * band_width),
          top: 0,
          fill: '#576574',
          width: band_width,
          height: band_height,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        mesa.push(rect);
        var tamletra = (letra+""+i).length; 
        var text = new fabric.Text(letra+i, {
           fontSize: 14,
           left:left  - (i * band_width) + ( band_width / 2) - (tamletra * 2) ,
           top: band_height / 2 - 5,
           fill:'white'
        });
        mesa.push(text);
   }
   var grupo = new fabric.Group(mesa, {
      id:letra,
      top: top,
      angle:angle
    });
    
    addOnDbleClickEnvent(grupo);
    canvas.add(grupo);    
 
}

function raya2D(letra,cant_rayas,left, top, angle, width, height,separacion,canvas){
    var rayas = new Array();
    for(var i = cant_rayas;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:letra+i,
          left: left  - (i * separacion),
          top: 0,
          fill: 'black',
          width:  width,
          height:  height,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        rayas.push(rect); 
   }
   var grupo = new fabric.Group(rayas, {
      id:letra,
      top: top,
      angle:angle
    });
   canvas.add(grupo);    
}

 function EstanteBandejas3D( estante,filas,columnas,top,left,alto,ancho,canvas,direction,colorFondo ){
      
    var y = 0;    
    var nombre_estante = new fabric.Text("ESTANTE "+estante, {
        id:'NombreEstante',
        fontSize: 32,
        left: 40,
        top: 10 
   });
     canvas.add(nombre_estante);   
     for(var i = filas;i > 0 ;i--){  
        var cols = 0;
        for(var j = columnas;j > 0 ;j--){             
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
            
            var pos_left = left + (j * ancho) -80; //if direction == "right"
            if(direction == "left"){
                pos_left = left  + ( ancho * cols  )      ;
            }
            
            
            var g = new fabric.Group(band, {
              id:""+estante+"_"+i+"_"+j,
              left: pos_left,
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
                   var id = $(this).attr("id");   
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
            cols++;
        }
        y +=alto;
    } 
     canvas.on('selection:created', function () {
        cuadrantesSeleccionados();
     }); 
     canvas.on('selection:cleared', function () {
        liberarCuadrantes();
     });
}
//alto = 100; ancho = 280; '
function mesaCorte3D(letra,top,left,filas,columnas,colorFondo,alto, ancho,canvas){
      
    var y = 0;
    var mesa = new fabric.Text("MESA DE CORTE "+letra, {
        id:'NombreEstante',
        fontSize: 32,
        left: 40,
        top: 10 
   });
     canvas.add(mesa);   
     for(var i = filas;i > 0 ;i--){  
        for(var j = columnas;j > 0 ;j--){             
            var band = new Array();
            
            var rect = new fabric.Rect({
              id:"fondo_"+letra+"_"+i+"_"+j, 
              left: left  + (j * ancho) -200,
              top: top + (i * alto),
              fill: colorFondo,
              width: ancho - 10,
              height: alto - 1,
              angle: 0,
              stroke : 'black',
              strokeWidth : 4
            });
            
             var foot1 = new fabric.Rect({
              id:"foot_"+letra+"_"+i+"_"+j, 
              left: left  + (j * ancho) -200,
              top: top + (i * alto),
              fill: "black",
              width: 4,
              height: 140,
              angle: 0,
              stroke : 'black',
              strokeWidth : 4
            });
             var foot2 = new fabric.Rect({
              id:"foot_"+letra+"_"+i+"_"+j, 
              left: left + ancho  + (j * ancho) -210,
              top: top + (i * alto),
              fill: "black",
              width: 4,
              height: 140,
              angle: 0,
              stroke : 'black',
              strokeWidth : 4
            });
            band.push(rect,foot1,foot2); 
            
            var codigo = new fabric.Rect({
              id:"codigo_"+letra+"_"+i+"_"+j, 
              left: left + (ancho / 2)   + (j * ancho) -220,
              top: top + alto - 12 + (i * alto),
              fill: "white",
              width: 40,
              height: 14,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
             
            
             band.push(codigo);
             
            var text = new fabric.Text(letra+"."+i+"."+j, {
               id:"texto_"+letra+"_"+i+"_"+j, 
               fontSize: 10,
               left: left + (ancho / 2)   + (j * ancho) -210,
               top: top + alto - 10 + (i * alto),
            });
            band.push(text);
            var g = new fabric.Group(band, {
              id:""+letra+"_"+i+"_"+j,
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
} 
function canasto2D(letra,izq,arriba,angulo,canvas  ){
    var c = new Array();     
        var rect = new fabric.Rect({
          id:letra+"1",
          left: -8   ,
          top: 5,
          fill: '#e15f41',
          width: 30,
          height: 30,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1 
        }); 
        
        var text = new fabric.Text(letra, {
           fontSize: 14,
           left: -3  ,
           top: 12,
           angle: 0,
           fill:'white'
        });
        c.push(rect,text);
    
   var grupo = new fabric.Group(c, {
      id:letra,
      left: izq,
      top: arriba ,
      angle: angulo
    });
    
    addOnDbleClickEnvent(grupo);
    canvas.add(grupo);    
};
function canasto3D(letra,top,left,filas,columnas,colorFondo,alto, ancho,canvas){
      
    var y = 0;
    var mesa = new fabric.Text("CANASTO "+letra, {
        id:'NombreEstante',
        fontSize: 32,
        left: 40,
        top: 10 
   });
     canvas.add(mesa);   
     for(var i = filas;i > 0 ;i--){  
        for(var j = columnas;j > 0 ;j--){             
            var band = new Array();
            
            var rect = new fabric.Rect({
              id:"fondo_"+letra+"_"+i+"_"+j, 
              left: left  + (j * ancho) -200,
              top: top + (i * alto),
              fill: colorFondo,
              width: ancho - 10,
              height: alto - 1,
              angle: 0,
              stroke : 'black',
              strokeWidth : 4
            });
            
             var foot1 = new fabric.Rect({
              id:"foot_"+letra+"_"+i+"_"+j, 
              left: left  + (j * ancho) -200,
              top: top + (i * alto),
              fill: "black",
              width: 4,
              height: 140,
              angle: 0,
              stroke : 'black',
              strokeWidth : 4
            });
             var foot2 = new fabric.Rect({
              id:"foot_"+letra+"_"+i+"_"+j, 
              left: left + ancho  + (j * ancho) -210,
              top: top + (i * alto),
              fill: "black",
              width: 4,
              height: 140,
              angle: 0,
              stroke : 'black',
              strokeWidth : 4
            });
            band.push(rect,foot1,foot2); 
            
            var codigo = new fabric.Rect({
              id:"codigo_"+letra+"_"+i+"_"+j, 
              left: left + (ancho / 2)   + (j * ancho) -220,
              top: top + alto - 12 + (i * alto),
              fill: "white",
              width: 40,
              height: 14,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
             
            
             band.push(codigo);
             
            var text = new fabric.Text(letra+"."+i+"."+j, {
               id:"texto_"+letra+"_"+i+"_"+j, 
               fontSize: 10,
               left: left + (ancho / 2)   + (j * ancho) -210,
               top: top + alto - 10 + (i * alto),
            });
            band.push(text);
            var g = new fabric.Group(band, {
              id:""+letra+"_"+i+"_"+j,
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
};
