var timer = 0;
var left = 100;
var canvas;

var letra = "";

$(function(){
    canvas = new fabric.Canvas('plano');
    
    paredOeste();
    paredEste(); 
    paredesFrontales();
    drawA();
    drawAH();
    AI();
    drawAF();
    drawAG();
    drawB();
    drawC();
    drawD();
    drawE();
    drawF();
    drawG();
    drawH();
    drawI();
    drawJ();
    drawk();
    drawL();
    drawM();
    drawN();
    drawO();
    drawP();
    drawQ();
    drawR();
    drawS();
    drawU();
    drawT();
    drawV();
    drawW();
    drawX();
    drawY();
    drawZ();
    escaleras();
    drawCanastos();   
});

paredOeste = function(){
    var paredes = new Array();
    var p1 = new fabric.Rect({ 
          left: 0,
          top: 0,
          fill: 'maroon',
          width: 1430,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p2 = new fabric.Rect({ 
          left: 730,
          top: 8,
          fill: 'maroon',
          width: 8,
          height: 90,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p3 = new fabric.Rect({ 
          left: 640,
          top: 90,
          fill: 'maroon',
          width: 50,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p4 = new fabric.Rect({ 
          left: 640,
          top: 8,
          fill: 'maroon',
          width: 8,
          height: 90,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var paredFrente = new fabric.Rect({ 
          left: 1430,
          top: 0,
          fill: 'maroon',
          width: 300,
          height: 4,
          angle: 90,
          stroke : 'maroon',
          strokeWidth : 1
    });
    var paredFrente2 = new fabric.Rect({ 
          left: 1430,
          top: 400,
          fill: 'maroon',
          width: 350,
          height: 4,
          angle: 90,
          stroke : 'maroon',
          strokeWidth : 1
    });
    var entrada1 = new fabric.Rect({ 
          left: 1400,
          top: 300,
          fill: 'maroon',
          width: 50,
          height: 4,
          angle: 0,
          stroke : 'maroon',
          strokeWidth : 1
    });
    var entrada2 = new fabric.Rect({ 
          left: 1400,
          top: 400,
          fill: 'maroon',
          width: 50,
          height: 4,
          angle: 0,
          stroke : 'maroon',
          strokeWidth : 1
    });
    paredes.push(p1,p2,p3,p4,paredFrente,paredFrente2, entrada1, entrada2);
     
    var paredOeste = new fabric.Group(paredes, {      
       left: 10,
       top: 4 
    });
    canvas.add(paredOeste); 
};

paredEste = function(){
    var paredes2 = new Array();
    var p1 = new fabric.Rect({ 
          left: 0,
          top: 0,
          fill: 'maroon',
          width: 1430,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p2 = new fabric.Rect({ 
          left: 8,
          top: 5,
          fill: 'maroon',
          width: 8,
          height: 753,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
   
    paredes2.push(p1);
     
    var paredEste = new fabric.Group(paredes2, {      
       left: 10,
       top: 754 
    });
    canvas.add(paredEste); 
    canvas.add(p2);
    
};

paredesFrontales = function(){
    var paredes3 = new Array();
    
    var pared1 = new fabric.Rect({ 
          left: 2,
          top: 700,
          fill: 'gray',
          width: 4,
          height: 87,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });

    var pared2 = new fabric.Rect({ 
          left: 2,
          top: 250,
          fill: 'gray',
          width: 4,
          height: 400,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    
    var lineEmpaque1 = new fabric.Rect({ 
          left: -85,
          top: 784,
          fill: 'gray',
          width: 88,
          height: 3,
          angle: 0,
          stroke : 'black',
          strokeWidth : 0.5
    });
     var lineEmpaque4 = new fabric.Rect({ 
          left: -90,
          top: 249,
          fill: 'gray',
          width: 3,
          height: 540,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });

    var lineEmpaque5 = new fabric.Rect({ 
          left: -35,
          top: 249,
          fill: 'gray',
          width: 1,
          height: 400,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });
   
    var paredCaja2 = new fabric.Rect({ 
          left: -60,
          top: 700,
          fill: 'gray',
          width: 60,
          height: 3,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var paredGerente2 = new fabric.Rect({ 
          left: 3,
          top: 650,
          fill: 'gray',
          width: 3,
          height: 35,
          angle: 90,
          stroke : 'gray',
          strokeWidth : 1
    });
    var acceso = new fabric.Text("Acceso", {
        fontSize: 20,
        left: 140,
        top: 250,
        angle: 0
    });
    var caja = new fabric.Text("Caja", {
        fontSize: 20,
        left: -25,
        top: 760,
        angle: -90
    });
  
    paredes3.push(pared1,pared2,lineEmpaque1,lineEmpaque4,lineEmpaque5,paredCaja2,paredGerente2,acceso,caja);
    var paredFrente = new fabric.Group(paredes3, {      
       left: 1440,
       angle: 90,
       top: 100
    });
    canvas.add(paredFrente);
};
//##################### A #####################
drawA = function(){
 bandejas2D("A",1,1430, 430, 90, 300,40,canvas);
};
//##################### AH #####################
drawAH = function(){
 bandejas2D("AH",1,1200, 15, 0, 100,20,canvas);
};
AI = function  (){
letra = "AI";    
var bandejasE = new Array();
    for(var i = 1;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:letra+i,
          left: left  - (i * 31),
          top: 600,
          fill: '#ffda79',
          width: 40,
          height: 25,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasE.push(rect);
         
        var text = new fabric.Text(letra+i, {
           fontSize: 12,
           left: left  +14 - (i * 31),
           top: 607
        });
        bandejasE.push(text);
   }
   var E = new fabric.Group(bandejasE, {
      id:letra,
      left: 1000,
      top: 320 
    });
    
    addOnDbleClickEnvent(E);
    canvas.add(E);    
};
//##################### AF #####################
drawAF = function(){
 bandejas2D("AF",1,1040, 160, 0, 80,30,canvas);
};
//##################### AG #####################
drawAG = function(){
 bandejas2D("AG",1,1100, 20, 90, 70,30,canvas);
};
//##################### B #####################
drawB = function(){
  bandejas2D("B",2,1050,690, 0,   72,50,canvas);
};
//##################### C #####################
drawC = function(){
  bandejas2D("C",4,700,700, 0,   72,50,canvas);
};
//##################### D #####################
drawD = function(){
  bandejas2D("D",1,700,590, 90,   90,40,canvas);
};
//##################### E #####################
drawE = function(){
  bandejas2D("E",2,700,120, 90,   90,40,canvas);
};
//##################### F #####################
drawF = function(){
  bandejas2D("F",2,740, 110, 0,   80,50,canvas);
};
//##################### G #####################
drawG = function(){
  bandejas2D("G",2,750, 300, 0,   80,50,canvas);
};
//##################### H #####################
drawH = function(){
  bandejas2D("H",3,750, 350, 0,   120,50,canvas);
};
//##################### I #####################
drawI = function(){
 mesas2D("I",1,1350, 300, 90, 120,40,canvas);
};
//##################### J #####################
drawJ = function(){
 mesas2D("J",1,980, 535, 0, 150,50,canvas);
};
//##################### K #####################
drawk = function(){
  bandejas2D("k",3,390,700, 0,   72,50,canvas);
};
//##################### L #####################
drawL = function(){
  bandejas2D("L",2,180,700, 0,   72,50,canvas);
};
//##################### M #####################
drawM = function(){
   
  var hierrosM = new Array();
     
    for(var i = 20;i > 0 ;i--){
        
        var circle = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left - 5,
            top: 86 + (i * 30)
        });        
        
        var rect = new fabric.Rect({
          id:"M"+i,
          left: left,
          top: 86 + (i * 30) ,
          fill: 'orange',
          width: 100,
          height: 5,
          angle: 40,
          stroke : 'black',
          strokeWidth : 1
        });
        
        hierrosM.push(rect);
        
        var text = new fabric.Text("M"+i, {
           fontSize: 12,
           left: left - 26,
           top: 83 + (i * 30)
        });
        hierrosM.push(text);
        hierrosM.push(circle);
   }
   
    var M = new fabric.Group(hierrosM, {
      id:'M',
      left: 20,
      top: 100
    });
     
    addOnDbleClickEnvent(M);
    canvas.add(M); 
};
//##################### M #####################
drawN = function(){
    letra = "N";        
    var hierrosN = new Array();
     
    for(var i = 16;i > 0 ;i--){
        
        var circle = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left + 77 - (i * 30),
            top: 17
          });
        
        
        var rect = new fabric.Rect({
          id:letra+i,
          left: left - (i * 30),
          top: 86,
          fill: 'orange',
          width: 100,
          height: 5,
          angle: -40,
          stroke : 'black',
          strokeWidth : 1
        });
        
        hierrosN.push(rect);
        /*rect.on('mousedown', function(e) {       
          var r = $(this);
          console.log('selected a rectangle ' +r.attr("id"));
        });*/
        var text = new fabric.Text(letra+i, {
           fontSize: 12,
           left: left + 73 - (i * 30),
           top: 4
        });
        hierrosN.push(text);
        hierrosN.push(circle);
   }
   
    var N = new fabric.Group(hierrosN, {
      id:'N',
      left: 100,
      top: 20 
    });
     
    addOnDbleClickEnvent(N);
    canvas.add(N); 
};
//##################### O #####################
drawO = function(){
  bandejas2D("O",1,250, 500, 90, 80,40,canvas);
};
//##################### P #####################
drawP = function(){
  bandejas2D("P",4,270, 540, 0,   72,40,canvas);
};
//##################### Q #####################
drawQ = function(){
 bandejas2D("Q",4,270, 500, 0,   72,40,canvas);
};
//##################### R #####################
drawR = function(){
    bandejas2D("R",4,260, 250, 0,   72,40,canvas);
};
//##################### S #####################
drawS = function(){
    bandejas2D("S",4,260, 210, 0,   72,40,canvas);
};
//##################### T #####################
drawT = function(){
 mesas2D("T",1,648, 250, 0, 100,40,canvas);
};
//##################### U #####################
drawU = function(){
 mesas2D("U",1,770, 130, 90, 120,40,canvas);
};
//##################### V #####################
drawV = function(){
 mesas2D("V",1,700, 490, 90, 100,30,canvas);
};
//##################### W #####################
drawW = function(){
 mesas2D("W",1,330, 230, 90, 120,40,canvas);
};
//##################### X #####################
drawX = function(){
 mesas2D("X",1,1430, 200, 0, 70,20,canvas);
};
//##################### Y #####################
drawY = function(){
 bandejas2D("Y",1,650, 310, 0, 70,20,canvas);
};
//##################### Z #####################
drawZ = function(){
 mesas2D("Z",1,750, 580, 90, 100,30,canvas);
};

function escaleras(){
    raya2D("EscalerasA_",5,725, 340, 0, 0.3,92,14,canvas);
    raya2D("EscalerasB_",5,725, 450, 0, 0.3,92,14,canvas); 
}

//##################### AA #####################
drawCanastos = function  (){
    canasto("AA",920,300,0,canvas ); 
    canasto("AB",750,570,-90,canvas ); 
    canasto("AC",800,250,-90,canvas ); 
    canasto("AD",340,750,-90,canvas ); 
    canasto("AE",130,750,-90,canvas );
    // canasto("AF",600,630,-90,canvas );
    // canasto("AG",320,680,-90,canvas );
};
//##################### AH #####################

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


/*
    C.on('mouseup', function() {
      var d = new Date();
      timer = d.getTime();
    });
    C.on('mousedown', function(e) {       
         
        var d = new Date();
        if ((d.getTime() - timer) < 300) {
            var id = $(this).attr("id");
            cargarEstante(id);
        }
        //console.log('selected a rectangle ' +r.attr("id"));
    });*/