//****** http://jqueryui.com/droppable/#photo-manager ESİNLENİLMİŞTİR *****
//****** item ın draggable özelliginin duruma göre enable ya da disable olması
//****** http://forum.jquery.com/topic/jquery-ui-how-do-i-re-enable-draggable
//****** adresinden alınmıstır.


$(function() {

  var $gallery = $( "#gallery" );// takım logolarının durduğu kısım
  var $player_img = $( "#player_img" );// carousel de player img ların durduğu kısım

  var $trash_left = $("#trash_left");// soldaki trash
  var $trash_right = $("#trash_right");// sağdaki trash
  var $trash_left_bottom = $("#trash_left_bottom");// sol altdaki trash
  var $trash_right_bottom = $("#trash_right_bottom");// sağ altdaki trash


  getTeamLogo();//gallerye takım logolarını koyuyoruz. asagidaki function i cagiriyoruz.
  $('#mycarousel').jcarousel({itemLoadCallback: putDefaultImage});// burada alttaki function i cagiriyorum.


  function putDefaultImage(carousel){//en basta carousel e default image koyuyorum.
    var carousel_length = 25;
    for (i = 0; i < carousel_length; i++) {
      carousel.add(i+1, $('<img src="/images/players/default.png" width="65" height="70" />'));
    }       
  carousel.size(carousel_length);// carousele o kadar kutu koyuyor
  }


  function serviceRequest(method, data, callback){
    $.post("/api/" + method, JSON.stringify(data)).done(function(data){
      callback(JSON.parse(data).data);
    });
  }

  function getTeamLogo() {
    serviceRequest("GetTeams", {"leagueId": 1, "seasonId": 9064}, function(teamData){  
      for (var i = 0; i < teamData.length; i++) {          
        var xd = $("<li class=\"ui-widget-content ui-corner-tr\" id=\"" +teamData[i][0]+ "\"><h5 class=\"ui-widget-header\">Logo</h5></li>").appendTo("#gallery");          
        $('<img src="/images/teams/' + teamData[i][0] + '.png" />').appendTo($(xd));

      }

      $( "li", $gallery ).draggable({
        cancel: "a.ui-icon", // clicking an icon won't initiate dragging
        revert: "invalid", // when not dropped, the item will revert back to its initial position
        containment: "document",
        helper: "clone",
        cursor: "move"
      });

      $( "li", $player_img ).draggable({
        cancel: "a.ui-icon", // clicking an icon won't initiate dragging
        revert: "invalid", // when not dropped, the item will revert back to its initial position
        containment: "document",
        helper: "clone",
        cursor: "move"
      });

      // let the trashes be droppable, accepting the gallery items
      $trash_left.droppable({
        accept: "#gallery > li",
        activeClass: "ui-state-highlight",
        drop: function( event, ui ) {
          $(ui.draggable).draggable("disable");
          freezeImage( ui.draggable , $trash_left, 1);
        }
      });

      $trash_right.droppable({
        accept: "#gallery > li",
        activeClass: "ui-state-highlight",
        drop: function( event, ui ) {
          $(ui.draggable).draggable("disable");
          freezeImage( ui.draggable , $trash_right, 2);
        }
       });

      $trash_left_bottom.droppable({
        accept: "#player_img > li",
        activeClass: "ui-state-highlight",
        drop: function( event, ui ) {
          $(ui.draggable).draggable("disable");
          freezeImage( ui.draggable , $trash_left_bottom, 3);
        }
      });

      $trash_right_bottom.droppable({
        accept: "#player_img > li",
        activeClass: "ui-state-highlight",
        drop: function( event, ui ) {
          $(ui.draggable).draggable("disable");
          freezeImage( ui.draggable , $trash_right_bottom, 4);
        }
      });

    });
  }

  //******************** Burası drag and drop functionları için (ESKİ) *********************

  // Sends image to trash, makes it flue and enlarges the image in dropgallery or takes the image back.
  var trash_left_array = new Array();//soldakilere konan resimler.
  var trash_right_array = new Array();//sağdakilere konan resimler.
  
  var teamId_left_array = new Array();
  var teamId_right_array = new Array();

  var trash_left_count = 0; //sol trashlerde img yoksa count= 0, varsa 1, olanın üstüne getiriyorsak 2.
  var trash_right_count = 0; //sağ trashlerde img yoksa count= 0, varsa 1, olanın üstüne getiriyorsak 2.

  

  function freezeImage( $item, $trash, integer) {


    if(integer === 1 || integer === 2){
      $item.fadeTo(400, 0.3, function() {
        if($trash.find("ul").length === 0){
          $list = $( "<ul class='gallery ui-helper-reset'/>" ).appendTo( $trash );
        } else {
          $list = $trash.find("ul");
        }
      });//sectigim item ı soldurdu.
    }else if(integer === 3 || integer === 4){
       $item.fadeTo(400, 0.3, function() {
        if($trash.find("ul").length === 0){
          $list = $( "<ul/>" ).appendTo( $trash );
        } else {
          $list = $trash.find("ul");
        }
      });//sectigim item ı soldurdu.
    }


    //burada da ekrana seçilen item ın id sini bastırıyoruz.
    var teamId = $item.attr("id"); 
    if(integer === 1){
      teamId_left_array.push(teamId);
    }else if(integer === 2){
      teamId_right_array.push(teamId);
    }
    console.log(teamId + " is selected :))");

    if(integer === 1 || integer === 2){
      $('#mycarousel').jcarousel({itemLoadCallback: getPlayersOfTeam});// burada alttaki function i cagiriyorum.

      function getPlayersOfTeam(carousel) {//player imagelarını carousel in icine koyuyoruz.

        serviceRequest("GetTeamPlayers", {"leagueId": 1, "seasonId": 9064, "teamId": teamId}, function(playersData){
          for (i = 0; i < playersData.length; i++) {
            carousel.add(i+1, $('<img src="/images/players/' + playersData[i][0] + '.jpg" width="65" height="70" />').click(function(){
              console.log("vafara vafara xD: ");
            }));              
          }

          carousel.size(playersData.length);// carousele o kadar kutu koyuyor.
        });
      };
    }


    if(integer === 1 || integer === 3){// 1 soldaki trashlar demek.
      console.log("trash_left_array: " + trash_left_array);
      trash_left_array.push($item);//sectigim item i, sola atmak istiyosam, solun arrayine koyuyorum.
      trash_left_count += 1;//şimdi, kutuda bir img oldugu icin count unu 1 yaptım.

    }else if(integer === 2 || integer === 4){// 2 sağdaki trashlar demek.
      console.log("trash_left_array: " + trash_left_array);
      trash_right_array.push($item);//sectigim item ı, sağa atmak istiyosam, sağın arrayine koyuyorum.
      trash_right_count += 1;//şimdi, kutuda bir img oldugu icin count unu 1 yaptım.
    }

    var newItem = $item.clone();//gercekte olan-> item, trashın icindeki-> onun clone u yani newItem.  

    if(trash_left_count > 1 || trash_right_count > 1){// 2. image i koymaya calisiyorum demek oluyor.
      $trash.empty();

      var element;
      if(integer === 1 || integer === 3){
        trash_left_count -= 1;
        element = trash_left_array[trash_left_array.length-2];//suan sol trashte olan,benim üstüne koymaya calıstıgım.
      }else if(integer === 2 || integer === 4){
        trash_right_count -= 1;
        element = trash_right_array[trash_right_array.length-2];//suan sag trashte olan,benim üstüne koymaya calıstıgım.
      }

      element.fadeTo(400, 1, function(){});//eskisinin renkini tekrar canlandırdım.
      element.draggable("enable");//ve onu tekrar draggable yaptım.

    }      

    newItem.fadeTo(400, 1, function(){//trashın icindeki bu clone un  boyutunu büyütüyorum.
      newItem.appendTo( $list ).fadeIn(function() {
        newItem.animate({ width: "85px", margin: 0 }).find( "img" ).animate({ height: "112px" });
      });

      newItem.click(function(){//bu trashtakine tıklarlarsa, geri gidicek.
        console.log($(newItem).attr("id") + " is sent back!");
        $item.draggable("enable");//tekrar sürüklenebilir oldu.

        $item.fadeTo(400, 1, function(){//dolayısıyle de trash boşalıcak.
          $trash.empty();
        });

        if(integer === 1 || integer === 3){
          trash_left_count = 0;//solsa trash ta img olmadıgı icin sol countu 0 yapıyorum.
        }else if(integer === 2 || integer === 4){
          trash_right_count = 0;//sag ise trash ta img olmadıgı icin sag countu 0 yapıyorum.
        }

        if(integer ===1 || integer === 2){
          if(trash_left_count === 0 && trash_right_count === 0){// iki trashta da logo yoksa default resim yapıyorum. 
            $('#mycarousel').jcarousel({itemLoadCallback: putDefaultImage});
          }else{
            console.log("teamId left array: " + teamId_left_array);
            console.log("teamId right array: " + teamId_right_array);

            if(trash_left_count === 0){
              teamId = teamId_right_array[teamId_right_array.length - 1];
              $('#mycarousel').jcarousel({itemLoadCallback: getPlayersOfTeam});
            
            }else  if(trash_right_count === 0){
              teamId = teamId_left_array[teamId_left_array.length - 1];
              $('#mycarousel').jcarousel({itemLoadCallback: getPlayersOfTeam});
            }
          }
        }

      }).appendTo(newItem);

    });      
  }



//********************************************************************************************
});
