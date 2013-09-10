//****** http://jqueryui.com/droppable/#photo-manager ESİNLENİLMİŞTİR *****
//****** item ın draggable özelliginin duruma göre enable ya da disable olması
//****** http://forum.jquery.com/topic/jquery-ui-how-do-i-re-enable-draggable
//****** adresinden alınmıstır.


$(function() {

  var $gallery = $( "#gallery" );// takım logolarının durduğu kısım
  var $player_img = $( "#player_img" );// carousel de player img ların durduğu kısım

  var $trash_left = $("#trash_left");// soldaki trash
  var $trash_right = $("#trash_right");// sağdaki trash
  
  var loadNew = false;
  

  getTeamLogo();//gallerye takım logolarını koyuyoruz. asagidaki function i cagiriyoruz.
  $('#mycarousel').jcarousel({itemLoadCallback: putDefaultImage});// burada alttaki function i cagiriyorum.
  $("#player_img").css("overflow","visible")// yoksa altta player name ler gözükmüyor.

  function putDefaultImage(carousel){//en basta carousel e default image koyuyorum.
    var carousel_length = 35;
    for (i = 0; i < carousel_length; i++) {
      carousel.add(i+1, $('<img src="/images/players/default.png" width="75" height="70" />'));
    }       
    carousel.size(carousel_length);// carousele o kadar kutu koyuyor
  }


  function serviceRequest(method, data, callback){
    $.post("/api/" + method, JSON.stringify(data)).done(function(data){
      callback(JSON.parse(data).data);
    });
  }

  var teamId;

  function getTeamLogo() {

    serviceRequest("GetTeams", {"leagueId": 1, "seasonId": 9064}, function(teamData){  
      _.each(teamData, function(value, i){
        var xd = $("<li class=\"ui-widget-content ui-corner-tr\" id=\"" + teamData[i][0] + "\"><h5 class=\"ui-widget-header\">Logo</h5></li>").appendTo("#gallery");          
        

        $('<img src="/images/teams/' + teamData[i][0] + '.png" />').click(function(){  
          console.log("trash_left_count: " + trash_left_count);
                    
          $("#mycarousel .jcarousel-clip").hide();
          $("#LoadingImage").show();
          
          $(".faded").fadeTo(400, 1);
          $(".faded").removeClass("faded");

          $(this).addClass("faded");
          $(this).fadeTo(400, 0.3);// tikladigimi soldurdum.

          teamId = teamData[i][0];
          console.log(teamId + " is selected.");
          
          loadNew = true;
          $('#mycarousel').jcarousel({itemLoadCallback: getPlayersOfTeam});// burada alttaki function i cagiriyorum.

          function getPlayersOfTeam(carousel) {//player imagelarını carousel in icine koyuyoruz.
            if(!loadNew) return;
            loadNew = false;
            serviceRequest("GetTeamPlayers", {"leagueId": 1, "seasonId": 9064, "teamId": teamId}, function(playersData){  
              
              _.each(playersData, function(val, i){ 
                //if(i < 10){
                  carousel.add(i+1, $('<img src="/images/players/' + val[0] + '.jpg" style="width:55px; height:70px; margin-left:10px;" data-player_position=' + val[3] + ' data-playername=' + val[1] + ' /><h5 class=\"ui-widget-header\">' + val[1] + '</h5>'));  
                //}
              });

              $(".jcarousel-item").each(function(){
                var position  = $(this).find("img").data("player_position");
          
                $(this).removeClass("goalkeeper");
                $(this).removeClass("defense");
                $(this).removeClass("midfield");
                $(this).removeClass("forward");


                if(position === 1){
                  $(this).addClass("goalkeeper");
                }
                else if(position === 2){
                  $(this).addClass("defense");
                }
                else if(position === 3){
                  $(this).addClass("midfield");
                }
                else if(position === 4){
                  $(this).addClass("forward");
                }
              });

              $("#LoadingImage").hide();
              $("#mycarousel .jcarousel-clip").show();


              carousel.size(playersData.length + 1);// carousele o kadar kutu koyuyor.

              /*$("#deneme-button").click(function(){
                console.log("deniyorum a basıldı :)"); 
                $(player_img).empty(); 

                _.each(playersData, function(value, i){

                    carousel.add(i+1, $('<img src="/images/players/' + playersData[i][0] + '.jpg" style="width:55px; height:70px; margin-left:10px;"/>'));   
                });   
              });*/

             });

          }// end of getPlayersOfTeam function. 
         

        }).appendTo($(xd));  


        

      });     

    });  
  }
 // allah stackover flow dan razı olsun: http://stackoverflow.com/questions/5811909/jquery-carousel-with-drag-and-drop.
  $("li", $player_img).draggable({
    appendTo: "body",
    cancel: "a.ui-icon",
    revert: "invalid",
    helper: "clone",
    cursor: "move"
});

  // let the trashes be droppable, accepting the gallery items
  $trash_left.droppable({
    accept: "#player_img > li",
    activeClass: "ui-state-highlight",
    drop: function( event, ui ) {
      $(ui.draggable).draggable("disable");
      processPlayerImage( ui.draggable , $trash_left, 3);
    }
  });

  $trash_right.droppable({
    accept: "#player_img > li",
    activeClass: "ui-state-highlight",
    drop: function( event, ui ) {
      $(ui.draggable).draggable("disable");
      processPlayerImage( ui.draggable , $trash_right, 4);
    }
  });




//*********************  Hazır, player img sürükleniyor  **************************************************

  var trash_left_array = new Array();//soldakilere konan resimler.
  var trash_right_array = new Array();//sağdakilere konan resimler.

  var trash_left_count = 0;
  var trash_right_count = 0;

  var teamId_of_players = new Array();


  function processPlayerImage( $item, $trash, integer) {

    var player_position = $item.find("img").data("player_position");

    $item.addClass("faded");
    $item.draggable("enable");

    console.log("bu oyuncu hangi takımda oynuyor: " + teamId);
    teamId_of_players.push(teamId);

    $item.fadeTo(400, 0.3, function() {
      if($trash.find("ul").length === 0){

        if(player_position === 1){
          $list = $( "<ul class='goalkeeper ui-helper-reset'/>" ).appendTo( $trash );
        }else if(player_position === 2){
          $list = $( "<ul class='defense ui-helper-reset'/>" ).appendTo( $trash );
        }else if(player_position === 3){
          $list = $( "<ul class='midfield ui-helper-reset'/>" ).appendTo( $trash );
        }else if(player_position === 4){
          $list = $( "<ul class='forward ui-helper-reset'/>" ).appendTo( $trash );
        }

      } else {
        $list = $trash.find("ul");
      }
    });//sectigim item ı soldurdu.
    

    console.log($item.find("img").data("playername") + " is selected :))\n ");
   


    if(integer === 3){// 1 soldaki trashlar demek.
      trash_left_array.push($item);//sectigim item i, sola atmak istiyosam, solun arrayine koyuyorum.
      trash_left_count += 1;//şimdi, kutuda bir img oldugu icin count unu 1 yaptım.

    }else if(integer === 4){// 2 sağdaki trashlar demek.
      trash_right_array.push($item);//sectigim item ı, sağa atmak istiyosam, sağın arrayine koyuyorum.
      trash_right_count += 1;//şimdi, kutuda bir img oldugu icin count unu 1 yaptım.
    }

    var newItem = $item.clone();//gercekte olan-> item, trashın icindeki-> onun clone u yani newItem.  

    if(trash_left_count > 1 || trash_right_count > 1){// 2. image i koymaya calisiyorum demek oluyor.
      $trash.empty();

      var element;
      if(integer === 3){
        trash_left_count -= 1;
        element = trash_left_array[trash_left_array.length-2];//suan sol trashte olan,benim üstüne koymaya calıstıgım.

      }else if(integer === 4){
        trash_right_count -= 1;
        element = trash_right_array[trash_right_array.length-2];//suan sag trashte olan,benim üstüne koymaya calıstıgım.
        

      }

      if(teamId_of_players[teamId_of_players.length - 1] === teamId_of_players[teamId_of_players.length - 2]){// üstüne koyduğumla aynı takımda ise
        element.fadeTo(400, 1, function(){}); 
      }
      
      element.draggable("enable");//ve onu tekrar draggable yaptım.

    }      

    newItem.fadeTo(400, 1, function(){//trashın icindeki bu clone un  boyutunu büyütüyorum.
      newItem.appendTo( $list ).fadeIn(function() {
        newItem.animate({ width: "92px", margin: 0 }).find( "img" ).animate({ height: "130px",  width: "90px", margin:"0px"});
      });

      newItem.click(function(){//bu trashtakine tıklarlarsa, geri gidicek.
        console.log($item.find("img").data("playername") + " is sent back!");
        $item.draggable("enable");//tekrar sürüklenebilir oldu.

        $item.fadeTo(400, 1, function(){//dolayısıyle de trash boşalıcak.
          $trash.empty();
        });

        if(integer === 3){
          trash_left_count = 0;//solsa trash ta img olmadıgı icin sol countu 0 yapıyorum.
        }else if(integer === 4){
          trash_right_count = 0;//sag ise trash ta img olmadıgı icin sag countu 0 yapıyorum.
        }


      }).appendTo(newItem);


    });      
  }




});
