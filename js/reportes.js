$(document).ready(function(){
  var paper_size = $("#paper_size").val();  //Este input debe contener el tamaño del papel y listo

  var marginTop = 10;
  var marginBottom = 10;
  var marginLeft= 12;
  var marginRight = 12;
  
  if(paper_size == 9){
     marginTop = 4;
     marginBottom = 0;
     marginLeft= 6;
     marginRight = 6;
  }
  
  if(typeof( jsPrintSetup ) == "object") {  
        jsPrintSetup.setOption('marginTop', marginTop);
        jsPrintSetup.setOption('marginBottom', marginBottom);
        jsPrintSetup.setOption('marginLeft', marginLeft);
        jsPrintSetup.setOption('marginRight', marginRight);
        // set page header
        jsPrintSetup.setOption('headerStrLeft', '');
        jsPrintSetup.setOption('headerStrCenter', '');
        jsPrintSetup.setOption('headerStrRight', '');// &PT
        // set empty page footer
        jsPrintSetup.setOption('footerStrLeft', '');
        jsPrintSetup.setOption('footerStrCenter', '');
        jsPrintSetup.setOption('footerStrRight', '');
        jsPrintSetup.setOption("paperData",paper_size);
        // Suppress print dialog
        //jsPrintSetup.setSilentPrint(true);
        // Do Print
        //jsPrintSetup.print();
        // Restore print dialog
        jsPrintSetup.setSilentPrint(false);
  }         
    
 
  
});


