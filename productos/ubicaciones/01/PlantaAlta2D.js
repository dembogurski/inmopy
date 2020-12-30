var timer = 0;
var left = 100;
var canvas;

var letra = "";

$(function(){
    canvas = new fabric.Canvas('plano');
    
    paredOeste();
    paredEste(); 
    paredesFrontales();
    
    drawN();
    drawL();
    drawM();
    drawK();
    drawU();
    drawT();
    drawY();
    drawX();
    drawP();
    drawQ();
    drawR();
    drawS();
    drawCanastos();
    escaleras();
     
});
paredOeste = function(){
    var paredes = new Array();
    var p1 = new fabric.Rect({ 
          left: 0,
          top: 0,
          fill: 'maroon',
          width: 1540,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    
    var vidrio1 = new fabric.Rect({ 
          left: 690,
          top: 12,
          fill: '#c8d6e5',
          width: 6,
          height: 300,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
  
    var p5 = new fabric.Rect({ 
          left: 12,
          top: 90,
          fill: 'black',
          width: 4,
          height: 90,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p6 = new fabric.Rect({ 
          left: 10,
          top: 8,
          fill: 'maroon',
          width: 8,
          height: 90,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var muro1 = new fabric.Rect({  left: 600, top: 314,  fill: 'maroon', width: 8, height: 140,angle: 0, stroke : 'gray',strokeWidth : 1 });
    var muro2 = new fabric.Rect({  left: 1000, top: 314,  fill: 'maroon', width: 8, height: 140,angle: 0, stroke : 'gray',strokeWidth : 1 });
    
    paredes.push(p1 );
     
    var paredOeste = new fabric.Group(paredes, {      
       left: 10,
       top: 4 
    });
    canvas.add(paredOeste); 
    canvas.add(p5,p6,muro1,muro2); 
    paredVidrio(690,12,300,0,canvas);
    paredVidrio(608,455,394,-90,canvas);
    paredVidrio(998,212,100,0,canvas);
    paredVidrio(998,224,362,-90,canvas);
    //canvas.add(vidrio1); 
};

paredEste = function(){
    var paredes2 = new Array();
    var p1 = new fabric.Rect({ 
          left: 0,
          top: 0,
          fill: 'maroon',
          width: 1540,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p2 = new fabric.Rect({ 
          left: 10,
          top: 180,
          fill: 'maroon',
          width: 8,
          height: 400,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p3 = new fabric.Rect({ 
          left: 12,
          top: 580,
          fill: 'black',
          width: 4,
          height: 90,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p4 = new fabric.Rect({ 
          left: 10,
          top: 664,
          fill: 'maroon',
          width: 8,
          height: 90,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
      
    
    paredes2.push(p1 );
     
    var paredEste = new fabric.Group(paredes2, {      
       left: 10,
       top: 754 
    });
    canvas.add(paredEste); 
    canvas.add(p2, p3,p4);
    //canvas.add(p3);
    //canvas.add(p4);
    //canvas.add(p5);
     
  
    
};

paredesFrontales = function(){
    var paredes3 = new Array();
    var p1 = new fabric.Rect({ 
          left: 0,
          top: 0,
          fill: 'gray',
          width: 3,
          height: 60,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p2 = new fabric.Rect({ 
          left: 0,
          top: 140,
          fill: 'gray',
          width: 3,
          height: 62,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var pared1 = new fabric.Rect({ 
          left: 60,
          top: 200,
          fill: 'maroon',
          width: 8,
          height: 542,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var pared2 = new fabric.Rect({ 
          left: 0,
          top: 200,
          fill: 'maroon',
          width: 60,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
     
    var acceso = new fabric.Text("Acceso", {
        fontSize: 15,
        left: 20,
        top: 124,
        angle: -90
    });
     
    var puerta1 = new fabric.Rect({ 
          left: -39,
          top: 60,
          fill: 'white',
          width: 42,
          height: 2,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });
    var puerta2 = new fabric.Rect({ 
          left: -39,
          top: 140,
          fill: 'white',
          width: 42,
          height: 2,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });
    
     
     
    paredes3.push(p1,p2,acceso,  puerta1,puerta2,   pared1,pared2   );
    var paredFrente = new fabric.Group(paredes3, {      
       left: 1320,
       top:12
    });
    canvas.add(paredFrente);
};


drawN = function(){
    bandejas2D("N",7,1418, 235, 90,   72,40,canvas);
};
drawL = function(){
    bandejas2D("L",6,20, 600, -90,   72,40,canvas);
};
drawM = function(){
    bandejas2D("M",18,50, 710, 0,   72,40,canvas);
};
drawK = function(){
    bandejas2D("K",8,40, 20, 0,   72,40,canvas);
};
drawU = function(){
    mesas2D("U",1,1400, 550, -90,   200,40,canvas);
};
drawT = function(){
    mesas2D("T",1,1200, 520, -90,   100,30,canvas);
};
drawY = function(){
    mesas2D("Y",1,980, 590, 0,   100,30,canvas);
};
drawX = function(){
    mesas2D("X",1,1080, 590, 0,   100,30,canvas);
};
drawP = function(){
    mesas2D("P",2,400, 550, 0,   140,50,canvas);
};
drawQ = function(){
    mesas2D("Q",2,400, 350, 0,   140,60,canvas);
    mesas2D("Q",2,400, 410, 0,   140,60,canvas);
};
drawR = function(){
    mesas2D("R",2,400, 180, 0,   145,50,canvas);
};
drawS = function(){
    //mesas2D("S",2,400, 350, 0,   140,60,canvas);
    mesas2D("S",2,810, 570, 0,   140,30,canvas);
    mesas2D("S",2,810, 600, 0,   140,30,canvas);
};
function drawCanastos(){
    canasto("O",1010,424,0,canvas );   
};

function escaleras(){
    raya2D("EscalerasD_",5,678, 370, -90, 0.3,92,14,canvas);
    raya2D("RayaHorizontal_",1,712, 370, -90, 0.3,220,14,canvas);
    raya2D("RayaVertical1_",1,714, 313, 0, 0.3,130,14,canvas);
    raya2D("RayaVertical2_",1,921, 313, 0, 0.3,130,14,canvas);
    raya2D("EscalerasHoriz1_",4,770, 370, 0, 0.3,72,14,canvas);
    raya2D("EscalerasHoriz2_",4,906, 370, 0, 0.3,72,14,canvas);
    //raya2D(letra,cant_rayas,left, top, angle, width, height,separacion,canvas){
   
  
    raya2D("EscalerasA_",5,978, 370, -90, 0.3,92,14,canvas); 
}

function addOnDbleClickEnvent(agroup,type){
    if(type === undefined){
        type = "Estante";
    }
    agroup.on('mouseup', function(e) {
      var d = new Date();
      timer = d.getTime();
      e.target.lockMovementX = true;
      e.target.lockMovementY = true;
    });
    agroup.on('mousedown', function(e) {       
        e.target.lockMovementX = true;
        e.target.lockMovementY = true;
        var d = new Date();
        if ((d.getTime() - timer) < 300) {
            var id = $(this).attr("id");
            cargarEstante(id,type);
        }
        //console.log('selected a rectangle ' +r.attr("id"));
    });    
}

function cargarEstante(id,type){
    var suc = $("#suc").val();
    var usuario = $("#usuario").val();
    var params = "width=1024,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    var url = "Estantes.class.php?action=cargar"+type+"&suc="+suc+"&usuario="+usuario+"&estante="+id+"";    
    window.open(url,"Estante "+id+"  Suc: "+suc,params);
}