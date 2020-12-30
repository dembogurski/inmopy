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
    drawB();
    drawC();
    drawD();  
    drawE();
    drawF();
    drawG();
    drawH();
    drawI();
    drawJ();
    drawV();
    drawW();
    drawZ();
    drawCanastos();
     
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
    var p2 = new fabric.Rect({ 
          left: 170,
          top: 8,
          fill: 'maroon',
          width: 8,
          height: 90,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p3 = new fabric.Rect({ 
          left: 0,
          top: 90,
          fill: 'maroon',
          width: 100,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p4 = new fabric.Rect({ 
          left: 142,
          top: 90,
          fill: 'maroon',
          width: 30,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p5 = new fabric.Rect({ 
          left: 92,
          top: 8,
          fill: 'maroon',
          width: 8,
          height: 50,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p6 = new fabric.Rect({ 
          left: 0,
          top: 8,
          fill: 'maroon',
          width: 8,
          height: 90,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    paredes.push(p1,p2,p3,p4,p5,p6);
     
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
          width: 1540,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p2 = new fabric.Rect({ 
          left: 8,
          top: 170,
          fill: 'maroon',
          width: 8,
          height: 592,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p3 = new fabric.Rect({ 
          left: 16,
          top: 170,
          fill: 'maroon',
          width: 90,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p4 = new fabric.Rect({ 
          left: 170,
          top: 170,
          fill: 'maroon',
          width: 8,
          height: 592,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p5 = new fabric.Rect({ 
          left: 16,
          top: 660,
          fill: 'maroon',
          width: 90,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p6 = new fabric.Rect({ 
          left: 150,
          top: 170,
          fill: 'maroon',
          width: 20,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p7 = new fabric.Rect({ 
          left: 150,
          top: 660,
          fill: 'maroon',
          width: 20,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var paredMedio = new fabric.Rect({ 
          left: 900,
          top: 420,
          fill: 'white',
          width: 12,
          height: 120,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var cocina = new fabric.Text("Cocina", {
        fontSize: 14,
        left: 76,
        top: 700
    });
    var deposito = new fabric.Text("Deposito", {
        fontSize: 14,
        left: 76,
        top: 500,
        angle: -90
    });
    paredes2.push(p1 );
     
    var paredEste = new fabric.Group(paredes2, {      
       left: 10,
       top: 754 
    });
    canvas.add(paredEste); 
    canvas.add(p2);
    canvas.add(p3);
    canvas.add(p4);
    canvas.add(p5);
    canvas.add(p6);
    canvas.add(p7);
    canvas.add(cocina);
    canvas.add(deposito);
    canvas.add(paredMedio);
    
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
    var vidriera1 = new fabric.Rect({ 
          left: 30,
          top: 200,
          fill: 'white',
          width: 2,
          height: 542,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var vidriera2 = new fabric.Rect({ 
          left: 0,
          top: 200,
          fill: 'white',
          width: 30,
          height: 2,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var pared1 = new fabric.Rect({ 
          left: -32,
          top: 200,
          fill: 'gray',
          width: 31,
          height: 6,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var pared2 = new fabric.Rect({ 
          left: -32,
          top: 200,
          fill: 'gray',
          width: 4,
          height: 542,
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
    var exib = new fabric.Text("Are de Exhibicion", {
        fontSize: 13,
        left: -6,
        top: 510,
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
    
    var lineEmpaque1 = new fabric.Rect({ 
          left: -120,
          top: 200,
          fill: 'gray',
          width: 88,
          height: 1,
          angle: 0,
          stroke : 'black',
          strokeWidth : 0.5
    });
    var lineEmpaque2 = new fabric.Rect({ 
          left: -180,
          top: 260,
          fill: 'gray',
          width: 148,
          height: 1,
          angle: 0,
          stroke : 'black',
          strokeWidth : 0.5
    });
    var lineEmpaque3 = new fabric.Rect({ 
          left: -181,
          top: 262,
          fill: 'gray',
          width: 88,
          height: 1,
          angle: -45,
          stroke : 'black',
          strokeWidth : 0.5
    });
     var lineEmpaque4 = new fabric.Rect({ 
          left: -120,
          top: 200,
          fill: 'gray',
          width: 1,
          height: 279,
          angle: 0,
          stroke : 'black',
          strokeWidth : 0.5
    });
    var lineEmpaque5 = new fabric.Rect({ 
          left: -180,
          top: 260,
          fill: 'gray',
          width: 1,
          height: 220,
          angle: 0,
          stroke : 'black',
          strokeWidth : 0.5
    });
    var lineEmpaque6 = new fabric.Rect({ 
          left: -180,
          top: 380,
          fill: 'gray',
          width: 60,
          height: 1,
          angle: 0,
          stroke : 'black',
          strokeWidth : 0.5
    });
    var lineEmpaque7 = new fabric.Rect({ 
          left: -180,
          top: 440,
          fill: 'gray',
          width: 60,
          height: 1,
          angle: 0,
          stroke : 'black',
          strokeWidth : 0.5
    });
    var paredCaja1 = new fabric.Rect({ 
          left: -180,
          top: 480,
          fill: 'gray',
          width: 76,
          height: 2,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var paredCaja2 = new fabric.Rect({ 
          left: -180,
          top: 480,
          fill: 'gray',
          width: 76,
          height: 2,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var paredCaja3 = new fabric.Rect({ 
          left: -70,
          top: 480,
          fill: 'gray',
          width: 40,
          height: 2,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var paredCaja4 = new fabric.Rect({ 
          left: -180,
          top: 480,
          fill: 'gray',
          width: 2,
          height: 100,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var paredCaja5 = new fabric.Rect({ 
          left: -180,
          top: 580,
          fill: 'gray',
          width: 148,
          height: 2,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var paredGerente1 = new fabric.Rect({ 
          left: -180,
          top: 580,
          fill: 'gray',
          width: 2,
          height: 10,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var paredGerente2 = new fabric.Rect({ 
          left: -180,
          top: 632,
          fill: 'gray',
          width: 2,
          height: 110,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    paredes3.push(p1,p2,acceso,exib,puerta1,puerta2,pared1,pared2,vidriera1,vidriera2,lineEmpaque1,lineEmpaque2,lineEmpaque3,lineEmpaque4,lineEmpaque5,lineEmpaque6,lineEmpaque7,paredCaja1,paredCaja2 ,paredCaja3,paredCaja4,paredCaja5,paredGerente1,paredGerente2 );
    var paredFrente = new fabric.Group(paredes3, {      
       left: 1320,
       top:12
    });
    canvas.add(paredFrente);
};

//##################### A #####################
drawA = function(){
    letra = "A";        
    var hierrosA = new Array();
     
    for(var i = 32;i > 0 ;i--){
        
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
        
        hierrosA.push(rect);
        /*rect.on('mousedown', function(e) {       
          var r = $(this);
          console.log('selected a rectangle ' +r.attr("id"));
        });*/
        var text = new fabric.Text(letra+i, {
           fontSize: 12,
           left: left + 73 - (i * 30),
           top: 4
        });
        hierrosA.push(text);
        hierrosA.push(circle);
   }
   
    var A = new fabric.Group(hierrosA, {
      id:'A',
      left: 200,
      top: 20 
    });
     
    addOnDbleClickEnvent(A);
    canvas.add(A); 
};

//##################### B #####################
drawB = function(){
   
  var hierrosB = new Array();
     
    for(var i = 17;i > 0 ;i--){
        
        var circle = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left - 5,
            top: 86 + (i * 30)
        });        
        
        var rect = new fabric.Rect({
          id:"B"+i,
          left: left,
          top: 86 + (i * 30) ,
          fill: 'orange',
          width: 100,
          height: 5,
          angle: 40,
          stroke : 'black',
          strokeWidth : 1
        });
        
        hierrosB.push(rect);
        
        var text = new fabric.Text("B"+i, {
           fontSize: 12,
           left: left - 26,
           top: 83 + (i * 30)
        });
        hierrosB.push(text);
        hierrosB.push(circle);
   }
   
    var B = new fabric.Group(hierrosB, {
      id:'B',
      left: 180,
      top: 170 
    });
     
    addOnDbleClickEnvent(B);
    canvas.add(B); 
};

//##################### C #####################
drawC = function(){

    var bandejasC = new Array();
    for(var i = 11;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:"C"+i,
          left: left  - (i * 80),
          top: 600,
          fill: 'lightgray',
          width: 79,
          height: 50,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasC.push(rect);
         
        var text = new fabric.Text("C"+i, {
           fontSize: 14,
           left: left +27 - (i * 80),
           top: 615
        });
        bandejasC.push(text);
   }
   var C = new fabric.Group(bandejasC, {
      id:'C',
      left: 290,
      top: 700 
    });
    
    addOnDbleClickEnvent(C);
    canvas.add(C);    
};


//##################### D #####################
drawD = function  (){
var bandejasD = new Array();
    for(var i = 4;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:"D"+i,
          left: left  - (i * 31),
          top: 600,
          fill: '#ccae62',
          width: 30,
          height: 25,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasD.push(rect);
         
        var text = new fabric.Text("D"+i, {
           fontSize: 12,
           left: left  +8 - (i * 31),
           top: 607
        });
        bandejasD.push(text);
   }
   var D = new fabric.Group(bandejasD, {
      id:'D',
      left: 694,
      top: 510 
    });
    
    addOnDbleClickEnvent(D);
    canvas.add(D);    
};

//##################### E #####################
drawE = function  (){
letra = "E";    
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
      left: 650,
      top: 510 
    });
    
    addOnDbleClickEnvent(E);
    canvas.add(E);    
};


//##################### F #####################
drawF = function  (){
letra = "F";    
var bandejasF = new Array();
    for(var i = 13;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:letra+i,
          left: left  - (i * 15),
          top: 600,
          fill: '#ccae62',
          width: 15,
          height: 25,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasF.push(rect);
         
        var text = new fabric.Text(letra+i, {
           fontSize: 9,
           left: left + 2  - (i * 15),
           top: 607
        });
        bandejasF.push(text);
   }
   var F = new fabric.Group(bandejasF, {
      id:letra,
      left: 650,
      top: 480 
    });
    
    addOnDbleClickEnvent(F);
    canvas.add(F);    
};

//##################### G #####################
drawG = function  (){
letra = "G";    
var bandejasG = new Array();
    for(var i = 2;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:letra+i,
          left: left  - (i * 60),
          top: 600,
          fill: '#576574',
          width: 60,
          height: 40,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasG.push(rect);
         
        var text = new fabric.Text(letra+i, {
           fontSize: 14,
           left: left + 20  - (i * 60),
           top: 610,
           fill:'white'
        });
        bandejasG.push(text);
   }
   var G = new fabric.Group(bandejasG, {
      id:letra,
      left: 550,
      top: 270 
    });
    
    addOnDbleClickEnvent(G);
    canvas.add(G);    
};
//##################### H #####################
drawH = function  (){
letra = "H";    
var bandejasH = new Array();
    for(var i = 1;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:letra+i,
          left: left  - (i * 40),
          top: 600,
          fill: '#576574',
          width: 120,
          height: 40,
          angle: -90,
          stroke : 'black',
          strokeWidth : 1 
        });
        
        bandejasH.push(rect);
         
        var text = new fabric.Text(letra, {
           fontSize: 14,
           left: left  +14  - (i * 40),
           top: 546,
           angle: -90,
           fill:'white'
        });
        bandejasH.push(text);
   }
   var H = new fabric.Group(bandejasH, {
      id:letra,
      left: 340,
      top: 480 
    });
    
    addOnDbleClickEnvent(H);
    canvas.add(H);    
};

//##################### I #####################
drawI = function  (){
letra = "I";    
var bandejasI = new Array();
    for(var i = 1;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:letra+i,
          left: left  - (i * 40),
          top: 600,
          fill: '#576574',
          width: 120,
          height: 40,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1            
        });
        
        bandejasI.push(rect);
         
        var text = new fabric.Text(letra, {
           fontSize: 14,
           left: left  +58  - (i * 40),
           top: 610, 
           fill:'white'
        });
        bandejasI.push(text);
   }
   var I = new fabric.Group(bandejasI, {
      id:letra,
      left: 780,
      top: 580 
    });
    
    addOnDbleClickEnvent(I);
    canvas.add(I);    
};

//##################### J #####################
drawJ = function  (){
letra = "J";    
var portaRollosJ = new Array();
    for(var i = 1;i > 0 ;i--){
        
        var circle1 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 40),
            top: 594
          });
        portaRollosJ.push(circle1);
        var circle2 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 40),
            top: 700
          });
           portaRollosJ.push(circle2);
        var rect = new fabric.Rect({
          id:letra+i,
          left: left  - (i * 40),
          top: 600,
          fill: 'orange',
          width: 8,
          height: 100,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1           
        });
        
        portaRollosJ.push(rect);
         
        var text = new fabric.Text(letra, {
           fontSize: 16,
           left: +42,
           top: 654,
           angle: -90,
           fill:'black'
        });
        portaRollosJ.push(text);
   }
   var J = new fabric.Group(portaRollosJ, {
      id:letra,
      left: 580,
      top: 400 
    });
    
    addOnDbleClickEnvent(J);
    canvas.add(J);    
};

//##################### V #####################
drawV = function  (){
letra = "V";    
var bandejasV = new Array();
    for(var i = 1;i <= 1 ;i++){
        var rect = new fabric.Rect({
          id:letra+i,
          left: 0  ,
          top: 400 + (i * 50),
          fill: '#95a5a6',
          width: 200,
          height: 40,
          angle: -90,
          stroke : 'black',
          strokeWidth : 1 
        });
        
        bandejasV.push(rect);
         
        var text = new fabric.Text(letra, {
           fontSize: 14,
           left: 14    ,
           top: 384 + (i * 50),
           angle: -90,
           fill:'white'
        });
        bandejasV.push(text);
   }
   var V = new fabric.Group(bandejasV, {
      id:letra,
      left: 80,
      top: 200
    });
    
    addOnDbleClickEnvent(V);
    canvas.add(V);    
};

//##################### W #####################
drawW = function  (){
letra = "W";    
var bandejasW = new Array();
    for(var i = 1;i <= 1 ;i++){
        var rect = new fabric.Rect({
          id:letra+i,
          left: 0  ,
          top: 400 + (i * 50),
          fill: '#95a5a6',
          width: 250,
          height: 40,
          angle: -90,
          stroke : 'black',
          strokeWidth : 1 
        });
        
        bandejasW.push(rect);
         
        var text = new fabric.Text(letra, {
           fontSize: 14,
           left: 14    ,
           top: 384 + (i * 50),
           angle: -90,
           fill:'white'
        });
        bandejasW.push(text);
   }
   var W = new fabric.Group(bandejasW, {
      id:letra,
      left: 20,
      top: 200 
    });
    
    addOnDbleClickEnvent(W);
    canvas.add(W);    
};

//##################### Z #####################
drawZ = function  (){
letra = "Z";    
var portaRollosZ = new Array();
    for(var i = 1;i > 0 ;i--){
        
        var circle1 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 40),
            top: 594
          });
         
        var circle2 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 40),
            top: 700
          });
        var circle3 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 54),
            top: 594
        });  
         var circle4 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 54),
            top: 700
          });
        var rect = new fabric.Rect({
          id:letra+i,
          left: left  - (i * 40),
          top: 600,
          fill: 'orange',
          width: 8,
          height: 100,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1           
        });
        var rect2 = new fabric.Rect({
          id:letra+i,
          left: left  - (i * 54),
          top: 600,
          fill: 'orange',
          width: 8,
          height: 100,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1           
        });
        portaRollosZ.push(rect,rect2,circle1,circle2,circle3,circle4);
         
        var text = new fabric.Text(letra, {
           fontSize: 16,
           left: +48,
           top: 654,
           angle: -90,
           fill:'black'
        });
        portaRollosZ.push(text);
   }
   var Z = new fabric.Group(portaRollosZ, {
      id:letra,
      left: 350,
      top: 320 
    });
    
    addOnDbleClickEnvent(Z);
    canvas.add(Z);    
};

//##################### AA #####################
drawCanastos = function  (){
    canasto("AA",910,585,0,canvas ); 
    canasto("AB",920,520,-90,canvas ); 
    canasto("AC",920,480,-90,canvas ); 
    canasto("AD",1100,470,-90,canvas ); 
    canasto("AE",600,580,-90,canvas );
    canasto("AF",600,630,-90,canvas );
    canasto("AG",320,680,-90,canvas );
};



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