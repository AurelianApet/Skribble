// ############# Login page ##############

//init page 
// $("#user_login_window").show();
// $("#guest_login_window").hide();
// animateCSS("#user_login_window", 'flipInX');


//1st
$("#user_login_window").hide();
$("#guest_login_window").show();
animateCSS("#guest_login_window", 'flipInX');



function playGuestPressed() {
    animateCSS("#user_login_window", 'fadeOutLeft', function() {
        $("#user_login_window").hide(); 
    });
    $("#guest_login_window").show();
    animateCSS("#guest_login_window", 'fadeInRight');   
}
function playUserPressed_1(){
    animateCSS("#guest_login_window", 'fadeOutRight', function() {
        $("#guest_login_window").hide();    
    }); 

    $("#user_login_window").show();
    animateCSS("#user_login_window", 'fadeInLeft'); 
}
function playUserPressed_2(){
    animateCSS("#user_signup_window", 'fadeOutLeft', function() {
        $("#user_signup_window").hide();    
    }); 

    $("#user_login_window").show();
    animateCSS("#user_login_window", 'fadeInRight');    
}
function userSignUpPressed(){
    animateCSS("#user_login_window", 'fadeOutRight', function() {
        $("#user_login_window").hide(); 
    });
    $("#user_signup_window").show();
    animateCSS("#user_signup_window", 'fadeInLeft');    
}

function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)
        if (typeof callback === 'function') callback()
    }
    node.addEventListener('animationend', handleAnimationEnd)
}






//Skribbl javascript

var socket = io.connect();

var $chatInput = $('#chatForm');
var $message = $('#message');
var $chat = $('#chatMessages');
var $gameContainer = $('#gameContainer');

var $loginWindow = $('.loginWindow');

var $user_login_form = $('#user_login_form');
var $guest_login_form = $('#guest_login_form');
var $user_signup_form = $('#user_signup_form');
var $users = $('#users tbody');
var $username = $('#username');

var $canvas = $('#drawCanvas');
var $notification = $('#notificationWindow p');
var $notificationWindow = $('#notificationWindow');

var $round_result_panel = $("#round_result_panel");
var $game_result_panel = $("#game_result_panel");
var $select_word_panel = $('#select_word_panel');


$(".tool").hide();
$('#vote_kick_btn').attr('disabled','disabled');

//Submit the Message
$chatInput.submit(function (e) {
    e.preventDefault();
    socket.emit('send chat', $message.val());
    $message.val(''); //clear it
});



$user_login_form.submit(function (e) {
    e.preventDefault();
    if ($('#user_login_name').val()) {
        if ($('#user_login_password').val()) {
            var post_data = {
                user_name: $('#user_login_name').val(),
                password:  $('#user_login_password').val()
            }
            $.post("/user/login",post_data,function(data, status){
                if(data.status =="success"){

                    socket.emit('new user', data.user);
                    //
                    $("#user_login_window").hide(); 
                    $gameContainer.addClass('visible');
                    $gameContainer.removeClass('hidden');

                    $('#user_login_name').val('');  
                    $('#user_login_password').val('');
                    $(".status_string").html("");

                }else{
                    $(".status_string").html(data.status + ": " +data.msg);
                    animateCSS("#user_login_window", 'tada');
                }
            });
        }else{
            animateCSS("#user_login_window", 'tada');
            $('#user_login_password').focus();
        }
    }else{
        animateCSS("#user_login_window", 'tada');
        $('#user_login_name').focus();
    }
});


$user_signup_form.submit(function (e) {
    e.preventDefault();
    if ($('#user_signup_name').val()) {
        if ($('#user_signup_password').val()) {
            var post_data = {
                user_name: $('#user_signup_name').val(),
                password:  $('#user_signup_password').val(),
                color_pos:document.getElementById("id_color1").style.backgroundPosition,
            	eye_pos:document.getElementById("id_eyes1").style.backgroundPosition,
            	mouth_pos:document.getElementById("id_mouth1").style.backgroundPosition
            }
            $.post("/user/signup",post_data,function(data, res){
            	console.log(data);
                if(data.user_name){

                    socket.emit('new user', data);
                    //
                    $("#user_signup_window").hide(); 
                    $gameContainer.addClass('visible');
                    $gameContainer.removeClass('hidden');

                    $('#user_signup_name').val('');  
                    $('#user_signup_password').val('');
                    $(".status_string").html("");

                }else{
                    $(".status_string").html("Some server error decteted...");
                    animateCSS("#user_signup_window", 'tada');
                }
            });
        }else{
            animateCSS("#user_signup_window", 'tada');
            $('#user_signup_password').focus();
        }
    }else{
        animateCSS("#user_signup_window", 'tada');
        $('#user_signup_name').focus();
    }
});


// 게스트 로그인
$guest_login_form.submit(function (e) {
    e.preventDefault();
    if ($('#guest_nickname').val()) {

        var guest_data = {
            user_name:$('#guest_nickname').val(),
            color_pos:document.getElementById("id_color").style.backgroundPosition,
            eye_pos:document.getElementById("id_eyes").style.backgroundPosition,
            mouth_pos:document.getElementById("id_mouth").style.backgroundPosition
        }

        socket.emit('new user', guest_data);


        //
        $("#guest_login_window").hide(); 
        $gameContainer.addClass('visible');
        $gameContainer.removeClass('hidden');
        $('#guest_nickname').val('');  
        animateCSS("#guest_login_window", 'tada');
    
    }else{
        animateCSS("#guest_login_window", 'tada');
        $('#guest_nickname').focus();
    }
});










//submit a new User + hide the Login Window + show Game Container
// $userForm.submit(function (e) {
//     e.preventDefault();
//     if ($username.val()) {
//         $loginWindow.addClass('hidden');
//         $gameContainer.addClass('visible');
//         $loginWindow.removeClass('visible');
//         $gameContainer.removeClass('hidden');
//         socket.emit('new user', $username.val());
//     }
//     $username.val(''); //clear it
// });

//Add the new users to our current user playing list
socket.on('users', UpdateUsers);
socket.on('current word', showHintWord);
socket.on('current char', showHintChar);

socket.on('new message', showMessage);
socket.on('notification', showNotification);
socket.on('show round result',showRoundResult);//결과보여주기
socket.on('show game result',showGameResult);//결과보여주기

socket.on('finished draw', removeDrawingEventListeners);
socket.on('start draw',addDrawingEventListeners);
socket.on('count down',updateWatch);//초시계
socket.on('kicked', kickedAction);
socket.on('choose word',showSelectWordPanel);//단어선택
socket.on('new round',newRound);
socket.on('undo_redraw',undoRedraw);
socket.on('play_sound',play_sound);

$current_user = undefined;
$draw_permission = false;
function newRound(turn_index, current_user){
    $current_user = current_user;
    $("#turn_number").html("Round "+turn_index+" / 3");
    $("#hint_text").html("");
    $("#remain_time").css("color","black");    
    $("#remain_time").html(60);
    $("#leftSideContainer table tr").removeClass("guessed");
    $(".tool").hide();
    onDrawingEvent('clear');
}
function UpdateUsers(data) {

    $("#room_name").html(" ");
    $users.empty();

    data.sort(function (a, b) { 
        return a.score > b.score ? -1 : a.score < b.score ? 1 : 0;  
    });

    for (i = 0; i < data.length; i++) {
    $("#room_name").append(data[i].room_index+", ");


        var avatarStr =   '<div class="face" style="margin-top: -12px;margin-left:-25px;">'+
                            '<div class="color" id="id_color" style="background-position: '+data[i].color_pos+';"></div>'+
                            '<div class="eyes"  id="id_eyes" style="background-position: '+data[i].eye_pos+';"></div>'+
                            '<div class="mouth" id="id_mouth" style="background-position: '+data[i].mouth_pos+';"></div>'+
                            '</div>';


        var user_name = '<div class="info">'+
            '<div class="name">'+data[i].user_name+'</div>'+
            '<div class="score">Points: '+data[i].score+'</div>'+
        '</div>';

        if(socket.id == data[i].socketID){
            user_name = '<div class="info">'+
                '<div class="name" style="color:green;">'+data[i].user_name+'(You)</div>'+
                '<div class="score">Points: '+data[i].score+'</div>'+
            '</div>';

            if(data[i].status == "drawing"){
                $('#vote_kick_btn').attr('disabled','disabled');
            }else{
                $("#vote_kick_btn").removeAttr('disabled');
            }
        }

        if(data[i].status == "drawing"){
            $users.append(`<tr class="${data[i].socketID} ${data[i].status}"><td class="number">#${i+1}</td> <td class="username drawing">${user_name}</td> <td class="score">${data[i].score}</td> <td class="avatar">${avatarStr}</td></tr>`);
        }else{
            $users.append(`<tr class="${data[i].socketID} ${data[i].status}"><td class="number">#${i+1}</td> <td class="username">${user_name}</td> <td class="score">${data[i].score}</td> <td class="avatar">${avatarStr}</td></tr>`);
        }
    }
}
function showMessage(data) {
    var fcolor = "black";
    if(data.color){
        fcolor = data.color;
    }
    if (!data.user) {
        $chat.append('<p style="color:'+fcolor+'" class="well"><strong>' + data.msg + '</p>');
    }
    else {
        $chat.append('<p style="color:'+fcolor+'" class="well"><strong>' + data.user + '</strong>: ' + data.msg + '</p>');
    }
    $chat.scrollTop($chat[0].scrollHeight);
}

function kickedAction(){
  //  $loginWindow.removeClass('hidden');
  //  $loginWindow.addClass('visible');
    $gameContainer.addClass('hidden');
    $gameContainer.removeClass('visible');

    $("#guest_login_window").show();
    animateCSS("#guest_login_window", 'flipInX');
}

function showNotification(data) {
    $notificationWindow.show();
    $notification.text(data.msg);
    if (data.delay != 0) {
        $notificationWindow.fadeOut(data.delay);
    }
    $select_word_panel.hide();
    $round_result_panel.hide();
    $game_result_panel.hide();
}
function showGameResult(data){


    play_sound("assets/snd/trophies applause.mp3");

    $("#game_score_list").html("");
    UpdateUsers(data);

    data.sort(function (a, b) { 
        return a.score > b.score ? -1 : a.score < b.score ? 1 : 0;  
    });

    for(var i = 0; i < data.length; i++)
    {
        if(i==0){

            // 1nd
            $("#second_pos_user").html("" + data[i].user_name);
            $("#second_pos_pointer").html(" "+data[i].score+"점");
        }else if(i==1){

            // 2nd
            $("#first_pos_user").html("" + data[i].user_name);
            $("#first_pos_pointer").html(" "+data[i].score+"점");
        }else if (i == 2){

            // 3rd
            $("#third_pos_user").html("" + data[i].user_name);
            $("#third_pos_pointer").html(" "+data[i].score+"점");

        }else{
            $("#game_score_list").append("<div> "+ (i+1) + "등 "+data[i].user_name+"   <span style='color:lime;'> "+data[i].score+" 점</span></div");
        }
    }

    $game_result_panel.show();
    $round_result_panel.hide();

    setTimeout(function(){   
      $game_result_panel.fadeOut(1000); 

    }, 5000);
}
function showRoundResult(data){

    play_sound("assets/snd/score board.mp3");

    $("#user_score_list").html("");
    var userList = data.userList;

    userList.sort(function (a, b) { 
        return a.score_added > b.score_added ? -1 : a.score_added < b.score_added ? 1 : 0;  
    });

    $("#correct_word").html(data.correct_word);
    for(var i = 0; i < data.userList.length; i++)
    {
        if(data.userList[i].score_added == 0){
            $("#user_score_list").append("<div> #"+ (i+1) + " "+data.userList[i].user_name+"   <span style='color:#ff2828;'>+"+data.userList[i].score_added+"</span></div");
        }else{
            $("#user_score_list").append("<div> #"+  (i+1) + " "+data.userList[i].user_name+"   <span style='color:lime;'>+"+data.userList[i].score_added+"</span></div");
        }
    }
    if(data.everybody_guessed){
        $("#everybody_guessed").html("모두 정답을 맞추셨습니다!")
    }else{
        $("#everybody_guessed").html("시간 초과!")
    }
    $round_result_panel.show();

    setTimeout(function(){   
      $round_result_panel.fadeOut(1000); 
    }, 5000);
}

function showSelectWordPanel(data){
    $("#select_word_panel .btn0").html(data[0].split(":")[0]);
    $("#select_word_panel .btn1").html(data[1].split(":")[0]);
    $("#select_word_panel .btn2").html(data[2].split(":")[0]);

    $select_word_panel.show();
    $notificationWindow.hide();
    $game_result_panel.hide();

}
function selectWord(index){
    socket.emit('word selected',index);
    $select_word_panel.fadeOut(500);
}

function updateWatch(data){
    if(data<11){
        $("#remain_time").css("color","red");    
        animateCSS("#timer_img", 'tada');
        play_sound("assets/snd/time ticking (15 seconds).wav");
    }else{
        $("#remain_time").css("color","black");    
    }
    $("#remain_time").html(data);
}


function showHintWord(data) {
   
   play_sound("assets/snd/draw start.wav");
    $("#hint_text").html(data);
    $(".tool").show();

    addDrawingEventListeners();
}
function showHintChar(data) {


   play_sound("assets/snd/draw start.wav");
    // var string = "";
    // for(var i =0;i<data;i++){
    //     string += "_ ";
    // }
    $("#hint_text").html(data);
    removeDrawingEventListeners();
     
}

//Canvas Drawing Logic
var canvas = document.getElementById('drawCanvas');
var context = canvas.getContext('2d');
var drawContainer = document.getElementById('drawContainer')

var current = {
    color: 'black',
    size:5
};

var next = {
    x: undefined,
    y: undefined
}

var drawing = false;

function addDrawingEventListeners() {
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
    console.log('Event listeners added');
    $draw_permission = true;
}

function removeDrawingEventListeners() {
    canvas.removeEventListener('mousedown', onMouseDown, false);
    canvas.removeEventListener('mouseup', onMouseUp, false);
    canvas.removeEventListener('mouseout', onMouseUp, false);
    canvas.removeEventListener('mousemove', throttle(onMouseMove, 10), false);
    console.log('Event listeners removed');
    $draw_permission = false;
}

socket.on('drawing', onDrawingEvent);
socket.on('drawing_history', drawHistory);

window.addEventListener('resize', onResize, false);

onResize();



function undoRedraw(data){
    onDrawingEvent('clear');
    var w = canvas.width;
    var h = canvas.height;
    
    for(var i = 0; i< data.length; i++)
    {
        drawLine(data[i].x0 * w, data[i].y0 * h, data[i].x1 * w, data[i].y1 * h, data[i].color, data[i].size);
    }
}

//for new user inserted when round is running
function drawHistory(history)
{
     for(var i = 0; i< history.length; i++)
    {
       onDrawingEvent(history[i]);
    }
}

function drawLine(x0, y0, x1, y1, color, size, emit) {
    // x0=x0+10;
    //  x1 = x1+10;

    //  y0=y0+35;
    //  y1 = y1+35;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);


    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = "round";
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: color,
        size:size
    });



}


function onMouseDown(e) {
    if(!$draw_permission){
        return;
    }
    if(socket.id != $current_user.socketID){
        return;
    }

    drawing = true;
    
    current.x = e.clientX - drawContainer.offsetLeft;
    // current.y = e.layerY + drawContainer.offsetTop;
    current.y = e.offsetY;
     // alert("e.clientY = "+ e.clientY + ", e.screenY = " + e.screenY)
    //  console.log("e.clientY = "+ e.clientY);
    // console.log("e.layerY = "+ e.layerY);
    // console.log("e.offsetY = "+ e.offsetY);
    // console.log("e.pageY = "+ e.pageY);
    // console.log("e.screenY = "+ e.screenY);
    // console.log("e.y = "+ e.y);

    // current.y = e.screenY;
    // current.y = e.clientY;



    socket.emit('mouse_down');
}

function onMouseUp(e) {
    if(!$draw_permission){
        return;
    }
    if(socket.id != $current_user.socketID){
        return;
    }
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, next.x, next.y, current.color, current.size, true);
}

function onMouseMove(e) {
    if(!$draw_permission){
        return;
    }
    if(socket.id != $current_user.socketID){
        return;
    }
    if (!drawing) { return; }
    next.x = e.clientX - drawContainer.offsetLeft;
    next.y = e.offsetY;
    drawLine(current.x, current.y, next.x, next.y, current.color, current.size, true);
    current.x = e.clientX - drawContainer.offsetLeft;
    current.y = e.offsetY;
}

// limit the number of events per second
function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
        var time = new Date().getTime();

        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
}

function onDrawingEvent(data) {
    if (data == 'clear') {
        console.log(canvas.nodeName, canvas.width, canvas.height);
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    else {
        var w = canvas.width;
        var h = canvas.height;
        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color,data.size);
    }
}

function onResize() {
    // Make the canvas fill its parent (will erase it's content)
    canvas.width = drawContainer.offsetWidth;
    canvas.height = drawContainer.offsetHeight;
    socket.emit('current drawing'); //request the current drawing and redraw it
}



function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

var selected_color = "black";

function changeColor(str)
{
    //console.log(str);
    current.color = str;
    selected_color = str;
}
function setPenSize(val){
    current.size = val;
}

function selectEraser(val){
     current.size = val;
    current.color = "white";
    // drawContainer.style.cursor =  "url('./img/erase.png'), auto";
}
function selectBrush(val){
    current.size = val;
    changeColor(selected_color);
    //drawContainer.style.cursor =  "url('./img/pen.png'), auto";

    // drawContainer.style.cursor =  "url('./img/brush.png'), auto";
}
function selectBucket()
{
    // drawContainer.style.cursor =  "url('./img/fill.png'), auto";
    // onTest();
}

function onTest() {


    changeColor("green");
    var canvas = document.getElementById('drawCanvas');
    var context = canvas.getContext('2d');


    for(var i = 0; i< canvas.width;i++){
        for(var j = 0; j< canvas.height;j++){
             
            var p = context.getImageData(i, j, 1, 1).data; 
            var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
            console.log(hex);
        }
        // context.clearRect(0, 0, canvas.width/2, canvas.height/2);
    }
}


function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}



function selectUndo(){
    socket.emit('undo');

}
function selectClear(){
    socket.emit('clear');

}

function voteKick(){
     socket.emit('votekick',socket.id);
     $('#vote_kick_btn').attr('disabled','disabled');
}
// var sketchpad = new Sketchpad({
//           element: '#drawCanvas',
//           width: 400,
//           height: 400,
//         });
        
//         // undo
//         sketchpad.undo();

//         // redo
//         sketchpad.redo();

//         // Change color
//         sketchpad.color = '#FF0000';

//         // Change stroke size
//         sketchpad.penSize = 10;

//         // Playback each sketchpad stroke (10 ms is the time between each line piece)
//         sketchpad.animate(10);

//avatar data
 function color_left(){

    var position = document.getElementById("id_color").style.backgroundPosition;
    if(position=="0px 0px") return;

    var position_array = position.split(" ");
    var first = Number(position_array[0].slice(0,-2));
        first = first + 48;
    if(position == "0px -48px"){

        var second = Number(position_array[1].slice(0,-2));
        second = 0;
        first = -432;
        position_array[1] = second + "px";
    }
    document.getElementById("id_color").style.backgroundPosition = first+"px"+" "+position_array[1];
    document.getElementById("id_color1").style.backgroundPosition = first+"px"+" "+position_array[1];

    // var second = Number(position_array[1].slice(0,-2));
    //     second = second-48;
 }

 function color_right() {
    

    var position = document.getElementById("id_color").style.backgroundPosition;
    if(position == "-336px -48px") return;

    var position_array = position.split(" ");
    var first = Number(position_array[0].slice(0,-2));
        first = first - 48;

    if(first == -480){
        
        first = 0;
        var second = Number(position_array[1].slice(0,-2));
            second = second -48;
        position_array[1]=second+"px";
    }
    document.getElementById("id_color").style.backgroundPosition = first+"px"+" "+position_array[1];
    document.getElementById("id_color1").style.backgroundPosition = first+"px"+" "+position_array[1];
 }

 function eyes_left() {

    var position = document.getElementById("id_eyes").style.backgroundPosition;
    
    if(position =="0px 0px") return;

    var position_array = position.split(" ");
    var first = Number(position_array[0].slice(0,-2));
    var second = Number(position_array[1].slice(0,-2)); 
    if(first == 0 && second < 0){

        var second = Number(position_array[1].slice(0,-2));

        second = second + 48;
        first = -432;
        position_array[1] = second + "px";
    }else first = first + 48;
    document.getElementById("id_eyes").style.backgroundPosition = first+"px"+" "+position_array[1];
    document.getElementById("id_eyes1").style.backgroundPosition = first+"px"+" "+position_array[1];

 }

 function eyes_right() {
    
    var position = document.getElementById("id_eyes").style.backgroundPosition;
    if(position =="0px -144px") return;
    var position_array = position.split(" ");
    var first = Number(position_array[0].slice(0,-2));
        first = first - 48;
    if(first == -480){
        
        first = 0;
        var second = Number(position_array[1].slice(0,-2));
            second = second -48;
        position_array[1]=second+"px";
        
    }
    document.getElementById("id_eyes").style.backgroundPosition = first+"px"+" "+position_array[1];
    document.getElementById("id_eyes1").style.backgroundPosition = first+"px"+" "+position_array[1];

 }

 function mouth_left() {
    
    var position = document.getElementById("id_mouth").style.backgroundPosition;
    if(position =="0px 0px") return;
    var position_array = position.split(" ");
    var first = Number(position_array[0].slice(0,-2));
    var second = Number(position_array[1].slice(0,-2)); 
    if(first == 0 && second < 0){

        var second = Number(position_array[1].slice(0,-2));
        console.log(second);
        second = second + 48;
        first = -432;
        position_array[1] = second + "px";
    }else first = first + 48;
    document.getElementById("id_mouth").style.backgroundPosition = first+"px"+" "+position_array[1];
    document.getElementById("id_mouth1").style.backgroundPosition = first+"px"+" "+position_array[1];

 }

 function mouth_right() {
    
    var position = document.getElementById("id_mouth").style.backgroundPosition;
    if(position == "-144px -96px") return;
    var position_array = position.split(" ");
    var first = Number(position_array[0].slice(0,-2));
        first = first - 48;
    if(first == -480){
        
        first = 0;
        var second = Number(position_array[1].slice(0,-2));
            second = second -48;
        position_array[1]=second+"px";
        
    }
    document.getElementById("id_mouth").style.backgroundPosition = first+"px"+" "+position_array[1];
    document.getElementById("id_mouth1").style.backgroundPosition = first+"px"+" "+position_array[1];

 }


function play_sound(str_path){

    var snd = new Audio(str_path); // buffers automatically when created
    snd.play();

}
