$(document).ready(function() {
  $( "#suruklenen" ).draggable();
  
  $( "#konulan_kutu" ).droppable({
    drop: function( event, ui ) {
      $(this).addClass("ui-state-highlight").find( "p" ).html( "Dropped!" );
      }
    });
});