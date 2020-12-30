var timer = 0;
var left = 100;
var canvas;

var letra = "";

$(function(){
    canvas = new fabric.Canvas('plano');
    
    paredOeste();
    paredEste(); 
    paredesFrontales();
    cajaGerent();
    drawA();
    drawB();
    drawC();
    drawD();
    drawE();
    drawF();
    F2();
    drawG();
    G2();
    drawH();
    H2();
    drawI();
    drawJ();
    drawK();
    drawL();
    drawM();
    drawN();
    drawO();
    drawP();
    drawQ();
    drawR();
    drawU();
    drawT();
    drawCanastos();
    drawV();
    drawW();
});

paredOeste = function(){
    var paredes = new Array();
    var p1 = new fabric.Rect({ 
          left: 220,
          top: 0,
          fill: 'maroon',
          width: 1650,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p2 = new fabric.Rect({ 
          left: 315,
          top: 8,
          fill: 'maroon',
          width: 8,
          height: 90,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p3 = new fabric.Rect({ 
          left: 210,
          top: 90,
          fill: 'maroon',
          width: 50,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p4 = new fabric.Rect({ 
          left: 220,
          top: 8,
          fill: 'maroon',
          width: 8,
          height: 752,
          angle: 10,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p5 = new fabric.Rect({ 
          left: 290,
          top: 90,
          fill: 'maroon',
          width: 30,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });

    paredes.push(p1,p2,p3,p4,p5);
     
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
          width: 1750,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p2 = new fabric.Rect({ 
          left: 120,
          top: 170,
          fill: 'maroon',
          width: 30,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p3 = new fabric.Rect({ 
          left: 210,
          top: 170,
          fill: 'maroon',
          width: 30,
          height: 8,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p4 = new fabric.Rect({ 
          left: 235,
          top: 170,
          fill: 'maroon',
          width: 8,
          height: 592,
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
    canvas.add(p1);
    canvas.add(p2);
    canvas.add(p3);
    canvas.add(p4);
};

paredesFrontales = function(){
    var paredes3 = new Array();
    var p1 = new fabric.Rect({ 
          left: 80,
          top: 0,
          fill: 'maroon',
          width: 4,
          height: 300,
          angle: 3,
          stroke : 'maroon',
          strokeWidth : 1
    });
    var p2 = new fabric.Rect({ 
          left: 55,
          top: 410,
          fill: 'maroon',
          width: 4,
          height: 340,
          angle: 3,
          stroke : 'maroon',
          strokeWidth : 1
    });
    var puerta1 = new fabric.Rect({ 
          left: 27,
          top: 300,
          fill: 'white',
          width: 42,
          height: 2,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });
    var puerta2 = new fabric.Rect({ 
          left: 18,
          top: 410,
          fill: 'white',
          width: 42,
          height: 2,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });
    var acceso = new fabric.Text("Acceso", {
        fontSize: 20,
        left: 20,
        top: 350,
        angle: 0
    });
    paredes3.push(p1,p2,puerta1,puerta2,acceso);
    var paredFrente = new fabric.Group(paredes3, {      
       left: 1720,
       top:10
    });
    canvas.add(paredFrente);
};

cajaGerent = function(){
    var paredes3 = new Array();
    var p1 = new fabric.Rect({ 
          left: -10,
          top: 0,
          fill: 'gray',
          width: 3,
          height: 89,
          angle: 0,
          stroke : 'gray',
          strokeWidth : 1
    });
    var p2 = new fabric.Rect({ 
          left: 60,
          top: 0,
          fill: 'gray',
          width: 3,
          height: 88,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });
    var p3 = new fabric.Rect({ 
          left: 98,
          top: 30,
          fill: 'gray',
          width: 3,
          height: 58,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });
    var p4 = new fabric.Rect({ 
          left: 220,
          top: 85,
          fill: 'gray',
          width: 3,
          height: 80,
          angle: 90,
          stroke : 'black',
          strokeWidth : 1
    });
    var lineEmpaque1 = new fabric.Rect({ 
          left: 15,
          top: 85,
          fill: 'gray',
          width: 88,
          height: 3,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
    });
    var empaque = new fabric.Text("Empaque", {
        fontSize: 20,
        left: 110,
        top: 40,
        angle: 0
    });
    var gerencia = new fabric.Text("Gerente", {
        fontSize: 15,
        left: 0,
        top: 40,
        angle: 0
    });
    paredes3.push(p1,p2,p3,p4,lineEmpaque1,empaque,gerencia);
    var paredFrente = new fabric.Group(paredes3, {      
       left: 1550,
       top:10
    });
    canvas.add(paredFrente);
};

//##################### A #####################
drawA = function(){
    letra = "A";        
    var hierrosA = new Array();
     
    for(var i = 41;i > 0 ;i--){
        
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
      left: 250,
      top: 20 
    });
     
    addOnDbleClickEnvent(A);
    canvas.add(A); 
};

//##################### B #####################
drawB = function(){
   
  var hierrosB = new Array();
     
    for(var i = 14;i > 0 ;i--){
        
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
          angle: -30,
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
      left: 250,
      top: 190 
    });
     
    addOnDbleClickEnvent(B);
    canvas.add(B); 
};

//##################### C #####################
drawC = function(){
    var bandejasC = new Array();
    for(var i = 12;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:"C"+i,
          left: left  - (i * 80),
          top: 600,
          fill: 'lightgray',
          width: 80,
          height: 40,
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
      left: 285,
      top: 710 
    });
    
    addOnDbleClickEnvent(C);
    canvas.add(C);    
};

//##################### D #####################
drawD = function(){
    var bandejasD = new Array();
    for(var i = 6;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:"D"+i,
          left: left  - (i * 70),
          top: 600,
          fill: 'lightgray',
          width: 70,
          height: 50,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasD.push(rect);

        var text = new fabric.Text("D"+i, {
           fontSize: 14,
           left: left +27 - (i * 70),
           top: 615
        });
        bandejasD.push(text);
   }
  var D = new fabric.Group(bandejasD, {
      id:'D',
      left: 1250,
      top: 700 
    });
    addOnDbleClickEnvent(D);
    canvas.add(D);    
};

//##################### E #####################
drawE = function  (){
letra = "E";    
var portaRollosE = new Array();
    for(var i = 1;i > 0 ;i--){
        
        var circle1 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 40),
            top: 594
          });
        portaRollosE.push(circle1);
        var circle2 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 40),
            top: 700
          });
           portaRollosE.push(circle2);
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
        
        portaRollosE.push(rect);
         
        var text = new fabric.Text(letra, {
           fontSize: 16,
           left: +30,
           top: 654,
           angle: -90,
           fill:'black'
        });
        portaRollosE.push(text);
   }
   var E = new fabric.Group(portaRollosE, {
      id:letra,
      left: 1700,
      top: 550
    });
    
    addOnDbleClickEnvent(E);
    canvas.add(E);    
};

//##################### F #####################
drawF = function(){

    var bandejasF = new Array();
    for(var i = 5;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:"F"+i,
          left: left  - (i * 70),
          top: 600,
          fill: 'lightgray',
          width: 80,
          height: 30,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasF.push(rect);

        var text = new fabric.Text("F"+i, {
           fontSize: 14,
           left: left +27 - (i * 70),
           top: 615
        });
        bandejasF.push(text);
   }
  var F = new fabric.Group(bandejasF, {
      id:'F',
      left: 530,
      top: 440
    });
    addOnDbleClickEnvent(F);
    canvas.add(F);    
};

//################### F- PARTE DE ABAJO #####################
F2 = function(){

    var bandejasF2 = new Array();
    for(var i = 5;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:"F"+i,
          left: left  - (i * 70),
          top: 600,
          fill: 'lightgray',
          width: 80,
          height: 30,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasF2.push(rect);

        var text = new fabric.Text("F"+i, {
           fontSize: 14,
           left: left +27 - (i * 70),
           top: 615
        });
        bandejasF2.push(text);
   }
  var F2 = new fabric.Group(bandejasF2, {
      id:'F',
      left: 530,
      top: 470
    });
    addOnDbleClickEnvent(F2);
    canvas.add(F2);    
};

//##################### G #####################
drawG = function(){
    var bandejasG = new Array();
    for(var i = 4;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:"G"+i,
          left: left  - (i * 70),
          top: 600,
          fill: 'lightgray',
          width: 80,
          height: 30,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasG.push(rect);

        var text = new fabric.Text("G"+i, {
           fontSize: 14,
           left: left +27 - (i * 70),
           top: 615
        });
        bandejasG.push(text);
   }
  var G = new fabric.Group(bandejasG, {
      id:'G',
      left: 1017,
      top: 440
    });
    addOnDbleClickEnvent(G);
    canvas.add(G);    
};

// ############# G2 PARTE DE ABAJO #####################
G2 = function(){

    var bandejasG2 = new Array();
    for(var i = 4;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:"G"+i,
          left: left  - (i * 70),
          top: 600,
          fill: 'lightgray',
          width: 80,
          height: 30,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasG2.push(rect);

        var text = new fabric.Text("G"+i, {
           fontSize: 14,
           left: left +25 - (i * 70),
           top: 615
        });
        bandejasG2.push(text);
   }
  var G2 = new fabric.Group(bandejasG2, {
      id:'G',
      left: 1017,
      top: 470
    });
    addOnDbleClickEnvent(G2);
    canvas.add(G2);    
};

//##################### H #####################
drawH = function(){

    var bandejasH = new Array();
    for(var i = 6;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:"H"+i,
          left: left  - (i * 70),
          top: 600,
          fill: 'lightgray',
          width: 80,
          height: 30,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasH.push(rect);

        var text = new fabric.Text("H"+i, {
           fontSize: 14,
           left: left +27 - (i * 70),
           top: 615
        });
        bandejasH.push(text);
   }
  var H = new fabric.Group(bandejasH, {
      id:'H',
      left: 720,
      top: 200 
    });
    addOnDbleClickEnvent(H);
    canvas.add(H);    
};

//################### H2 PARTE DE ABAJO #####################
H2 = function(){

    var bandejasH2 = new Array();
    for(var i = 6;i > 0 ;i--){
        var rect = new fabric.Rect({
          id:"H"+i,
          left: left  - (i * 70),
          top: 600,
          fill: 'lightgray',
          width: 80,
          height: 30,
          angle: 0,
          stroke : 'black',
          strokeWidth : 1
        });
        
        bandejasH2.push(rect);

        var text = new fabric.Text("H"+i, {
           fontSize: 14,
           left: left +27 - (i * 70),
           top: 615
        });
        bandejasH2.push(text);
   }
  var H2 = new fabric.Group(bandejasH2, {
      id:'H',
      left: 720,
      top: 230
    });
    addOnDbleClickEnvent(H2);
    canvas.add(H2);    
};

//##################### I #####################
drawI = function(){
    mesas2D("I",1,550, 280, 90,   120,40,canvas);
};

//##################### J #####################
drawJ = function(){
    mesas2D("J",1,529, 450, 0,   100,40,canvas);
};

//##################### K #####################
 drawK = function(){
     mesas2D("K",1,580, 210, 0,   80,40,canvas);
 };

//##################### L #####################
 drawL = function(){
      mesas2D("L",1,720, 210, 0,   120,40,canvas);
  };

//##################### M #####################
drawM = function(){
    mesas2D("M",1,1270, 210, 0,   120,40,canvas);
};

//##################### N #####################
drawN = function(){
    mesas2D("N",2,900, 570, 0,   150,50,canvas);
};

//##################### O #####################
drawO = function(){
    mesas2D("O",1,1010, 450, 0,   120,40,canvas);
};

//##################### P #####################
drawP = function(){
    mesas2D("P",1,1430, 450, 0,   120,40,canvas);
};

//##################### Q #####################
drawQ = function  (){
letra = "Q";    
var portaRollosQ = new Array();
    for(var i = 1;i > 0 ;i--){
        
        var circle1 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 40),
            top: 594
          });
        portaRollosQ.push(circle1);
        var circle2 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 40),
            top: 700
          });
           portaRollosQ.push(circle2);
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
        
        portaRollosQ.push(rect);
         
        var text = new fabric.Text(letra, {
           fontSize: 16,
           left: +30,
           top: 654,
           angle: -90,
           fill:'black'
        });
        portaRollosQ.push(text);
   }
   var Q = new fabric.Group(portaRollosQ, {
      id:letra,
      left: 450,
      top: 550
    });
    
    addOnDbleClickEnvent(Q);
    canvas.add(Q);    
};

//##################### R #####################
drawR = function  (){
letra = "R";    
var portaRollosR = new Array();
    for(var i = 1;i > 0 ;i--){
        
        var circle1 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 40),
            top: 594
          });
        portaRollosR.push(circle1);
        var circle2 = new fabric.Circle({radius:3,
            fill: 'gray',
            stroke: 'black',
            strokeWidth: 3,
            left: left  - (i * 40),
            top: 700
          });
           portaRollosR.push(circle2);
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
        
        portaRollosR.push(rect);
         
        var text = new fabric.Text(letra, {
           fontSize: 16,
           left: +30,
           top: 654,
           angle: -90,
           fill:'black'
        });
        portaRollosR.push(text);
   }
   var R = new fabric.Group(portaRollosR, {
      id:letra,
      left: 1300,
      top: 550
    });
    
    addOnDbleClickEnvent(R);
    canvas.add(R);    
};

//##################### U #####################
drawU = function(){
  canasto2D("U",250,40,0,canvas );
};
//##################### T ####################
drawT = function(){
  canasto2D("T",1730,210,0,canvas );
};
//######################CANASTOS##################
drawCanastos = function  (){
    canasto("S",1330,210,0,canvas ); 
};

//##################### V #####################
drawV = function(){
    bandejas2D("V",5,60, 600, -80,   72,40,canvas);
};

//##################### W #####################
drawW = function(){
    mesas2D("W",1,350, 390, 90,   120,40,canvas);
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