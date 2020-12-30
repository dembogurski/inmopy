var canvas;
var svg;
var colorFondo = '#95a5a6';
//var objetos =[];
 
$(function(){
    canvas = new fabric.Canvas('plano');
    EstanteBandejas3D( "O",5,1,50,120,50,120,canvas,"left",colorFondo );
});


