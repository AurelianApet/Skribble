module.exports = function(app, port) {

    const fs = require('fs');
    const util = require('util');
    let conf = require('../resources/Config')();
    // console.log(util.inspect(socket, {showHidden: false, depth: null}))
    // Socket setup

    const words = require('../resources/words');
    // var highscores = require('../resources/highscores');


    const socket = require('socket.io');
    const server = app.listen(port, () => {
        console.log('#############################################');
        console.log('Server [' + port + ']  started successfully...');
    });
    var io = socket(server);



    var UserModel = require('../Model/UserModel')


    // user = {
    //     user_name,//이름
    //     status, //guessed,
    //     current_rank,
    //     socketID,
    //     score,
    //     must_draw
    // color_pos:data.color_pos,
    // eye_pos:data.eye_pos,
    // mouth_pos:data.mouth_pos,
    // }

    var g_rooms = [];
    var g_time_warning;
    // var g_rooms[getIndex(socket.room)].users = [];
    // var g_rooms[getIndex(socket.room)].lines_history = [];
    // var g_rooms[getIndex(socket.room)].is_game_running = false;
    // var g_rooms[getIndex(socket.room)].is_round_running = false;
    // var g_rooms[getIndex(socket.room)].current_word = undefined;
    // var g_rooms[getIndex(socket.room)].current_char = undefined;
    // var g_rooms[getIndex(socket.room)].current_user = undefined;
    // var g_rooms[getIndex(socket.room)].current_rank = 1;
    // var g_rooms[getIndex(socket.room)].current_turn = 1;
    // var g_rooms[getIndex(socket.room)].guessed_counter = 0;
    // var g_rooms[getIndex(socket.room)].word_array = [];
    // var g_rooms[getIndex(socket.room)].time_counter = 0;
    // var g_rooms[getIndex(socket.room)].turn_index = 0;
    // var g_rooms[getIndex(socket.room)].everybody_guessed = false;
    // var g_rooms[getIndex(socket.room)].kick_count = 0;

    io.on('connection', function(socket) {

        //console.log(`Current number of connections: ${io.engine.clientsCount} `);
        socket.on('disconnect', function(data) {
            if (!g_rooms[getIndex(socket.room)]) {
                return;
            }

            index = g_rooms[getIndex(socket.room)].users.findIndex(user => user.socketID === socket.id);

            disconnectedUser = g_rooms[getIndex(socket.room)].users[index];
            // If the disconnected user was also logged in (otherwise his ID won't show up in g_rooms[getIndex(socket.room)].users)
            if (index !== -1) {
                g_rooms[getIndex(socket.room)].users.splice(index, 1);
                io.sockets.in(socket.room).emit('new message', {
                    msg: `${disconnectedUser.user_name}님이 퇴장하셨습니다.`
                });
                io.sockets.in(socket.room).emit('play_sound', "assets/snd/player leave.wav");

                if (g_rooms[getIndex(socket.room)].is_round_running == true && g_rooms[getIndex(socket.room)].users.length < 2) {
                    endGame();
                } else {
                    // End the round when the player to draw disconnects
                    if (g_rooms[getIndex(socket.room)].current_user != undefined) {
                        if (disconnectedUser.socketID === g_rooms[getIndex(socket.room)].current_user.socketID) {
                            endRound();
                        } else if (g_rooms[getIndex(socket.room)].is_round_running) {
                            checkIfEverybodyGuessed();
                        }
                    }
                }
            }
            socket.broadcast.to(socket.room).emit('users', g_rooms[getIndex(socket.room)].users);
            socket.leave(socket.room);

            g_rooms[getIndex(socket.room)].is_full = false;

        });

        socket.on('new user', function(data) {
            var user_data = {
                socketID: socket.id,
                user_name: data.user_name,
                color_pos: data.color_pos,
                eye_pos: data.eye_pos,
                mouth_pos: data.mouth_pos,
                score: 0,
                status: 'guessing',
                must_draw: true,
                current_rank: 0,
                kick_pressed: false,
                room_index: -1
            }

            //방이 존재 하지 않는다면 
            if (g_rooms.length == 0) {
                user_data.room_index = 0;
                var room_object = {
                    index: 0,
                    name: "Room0",
                    users: [user_data],
                    is_full: false,
                    lines_history: [],
                    last_shape_index:-1,
                    is_game_running: false,
                    is_round_running: false,
                    current_word: undefined,
                    current_char: undefined,
                    current_user: undefined,
                    current_rank: 1,
                    current_turn: 1,
                    guessed_counter: 0,
                    word_array: [],
                    time_counter: 0,
                    turn_index: 0,
                    everybody_guessed: false,
                    kick_count: 0
                }
                g_rooms.push(room_object);
                socket.room = room_object.name;
            } else {
                var inserted_flag = false;
                //방목록 순환
                for (var i = 0; i < g_rooms.length; i++) {
                    // 방이 다 찼으면 
                    if (g_rooms[i].is_full) {
                        continue;
                    } else {
                        // 방에 자리가 있으면
                        user_data.room_index = i;
                        g_rooms[i].users.push(user_data);
                        socket.room = g_rooms[i].name;

                        //방금 넣은 유저로 하여 방이 다 찼다면 
                        if (g_rooms[i].users.length == conf.user_count_per_room) { // ############ 1방에 찰 인원수
                            g_rooms[i].is_full = true;
                        }

                        inserted_flag = true;
                        break;
                    }
                }
                if (inserted_flag == false) {
                    // 현재 창조되여 있는 방이 다 꽉 차있다면 
                    user_data.room_index = g_rooms.length;
                    var room_object = {

                        index: g_rooms.length,
                        name: "Room" + (g_rooms.length),
                        users: [user_data],
                        is_full: false,
                        lines_history: [],
                        last_shape_index:-1,
                        is_game_running: false,
                        is_round_running: false,
                        current_word: undefined,
                        current_char: undefined,
                        current_user: undefined,
                        current_rank: 1,
                        current_turn: 1,
                        guessed_counter: 0,
                        word_array: [],
                        time_counter: 0,
                        turn_index: 0,
                        everybody_guessed: false,
                        kick_count: 0
                    }
                    g_rooms.push(room_object);
                    socket.room = room_object.name;
                }
            }
            WriteRoomTable("User [ "+user_data.user_name + " ] is Inserted.");

            socket.join(socket.room);

                io.sockets.in(socket.room).emit('play_sound', "assets/snd/player enter.wav");

            if (g_rooms[getIndex(socket.room)].is_round_running) {

                let index = g_rooms[getIndex(socket.room)].users.findIndex(user => user.socketID === socket.id);
                g_rooms[getIndex(socket.room)].users[index].status = 'guessing';

                socket.emit('new message', {
                    msg: `${g_rooms[getIndex(socket.room)].current_user.user_name}'님이 그릴 차례입니다.`,
                    delay: 2500
                });

                socket.emit('current char', g_rooms[getIndex(socket.room)].current_char);

                socket.emit('drawing_history', g_rooms[getIndex(socket.room)].lines_history);
                socket.emit('notification', {
                    msg: "",
                    delay: 100
                });
            }else if (g_rooms[getIndex(socket.room)].is_game_running) {

                if(g_rooms[getIndex(socket.room)].current_user == undefined){

                    socket.emit('notification', {
                        msg: '대기중',
                        delay: 0
                    });

                }else{
                    
                    socket.emit('notification', {
                        msg: g_rooms[getIndex(socket.room)].current_user.user_name + '님이 단어를 선택 중 입니다.',
                        delay: 0
                    });                    
                }

                
                
            }
            if (g_rooms[getIndex(socket.room)].users.length > 1 && g_rooms[getIndex(socket.room)].is_game_running == false) {

                io.sockets.in(socket.room).emit('users', g_rooms[getIndex(socket.room)].users);
                startGame(socket.room);
            }
            if (g_rooms[getIndex(socket.room)].users.length == 1) {
                socket.emit('notification', {
                    msg: '다른 플레이어들을 기다리고 있습니다.',
                    delay: 0
                });
            }
            io.sockets.in(socket.room).emit('users', g_rooms[getIndex(socket.room)].users);
        });

        socket.on('send chat', function(data) {
             

            if (!g_rooms[getIndex(socket.room)]) {
                return;
            }

            //console.log(g_rooms[getIndex(socket.room)]);

            let index = g_rooms[getIndex(socket.room)].users.findIndex(user => user.socketID === socket.id);
            let user_name = g_rooms[getIndex(socket.room)].users[index].user_name;

            if (g_rooms[getIndex(socket.room)].users[index].status != 'drawing' && g_rooms[getIndex(socket.room)].users[index].status != 'guessed') {
                // If the player has guessed the word
                if (g_rooms[getIndex(socket.room)].is_round_running && data === g_rooms[getIndex(socket.room)].current_word) {
                    g_rooms[getIndex(socket.room)].users[index].status = 'guessed';
                    g_rooms[getIndex(socket.room)].users[index].current_rank = g_rooms[getIndex(socket.room)].current_rank;
                    //g_rooms[getIndex(socket.room)].users[index].score_for_add += 10;

                    g_rooms[getIndex(socket.room)].guessed_counter++;
                    g_rooms[getIndex(socket.room)].current_rank++;

                    io.sockets.in(socket.room).emit('play_sound', "assets/snd/correct answer.wav");
                    io.sockets.in(socket.room).emit('new message', {
                        msg: `${user_name}님이 맞추셨습니다!`,
                        color: "green"
                    });
                    io.sockets.in(socket.room).emit('users', g_rooms[getIndex(socket.room)].users);

                    if (g_rooms[getIndex(socket.room)].time_counter > 16) {
                        g_rooms[getIndex(socket.room)].time_counter = 16;
                    }
                    checkIfEverybodyGuessed();
                } else {
                    io.sockets.in(socket.room).emit('new message', {
                        msg: data,
                        user: user_name
                    });
                }
            } else if (g_rooms[getIndex(socket.room)].users[index].status == 'guessed') {
                if (data == g_rooms[getIndex(socket.room)].current_word) {
                    io.to(socket.id).emit('new message', {
                        msg: `메시지를 보내실 수 없습니다.`,
                        color: "red"
                    });
                } else {
                    io.sockets.in(socket.room).emit('new message', {
                        msg: data,
                        user: user_name,
                        color: "orange"
                    });
                }
            } else {
                io.to(socket.id).emit('new message', {
                    msg: `메시지를 보내실 수 없습니다.`,
                    color: "red"
                });
            }
        });

        socket.on('drawing', function(data) {

             
            if (!g_rooms[getIndex(socket.room)]) {
                return;
            }

            g_rooms[getIndex(socket.room)].lines_history.push(data);
            socket.broadcast.to(socket.room).emit('drawing', data);
        });

        socket.on('mouse_down',function(){
            //g_rooms[getIndex(socket.room)].last_shape = [];
            g_rooms[getIndex(socket.room)].last_shape_index = g_rooms[getIndex(socket.room)].lines_history.length;
            //console.table(g_rooms[getIndex(socket.room)].last_shape_index);

        });

        socket.on('undo',function(){

            g_rooms[getIndex(socket.room)].lines_history = g_rooms[getIndex(socket.room)].lines_history.slice(0,g_rooms[getIndex(socket.room)].last_shape_index);

            io.sockets.in(socket.room).emit('undo_redraw', g_rooms[getIndex(socket.room)].lines_history );
        });
        socket.on('clear',function(){
            g_rooms[getIndex(socket.room)].lines_history =[];;
           io.sockets.in(socket.room).emit('drawing', 'clear');
        });

        socket.on('current drawing', function() {
            if (!g_rooms[getIndex(socket.room)]) {
                return;
            }
            for (var i = 0; i < g_rooms[getIndex(socket.room)].lines_history.length; i++) {
                socket.emit('drawing', g_rooms[getIndex(socket.room)].lines_history[i]);
            }
        });

        socket.on('word selected', function(selected_index) {

            if (!g_rooms[getIndex(socket.room)]) {
                console.log("current room in null");
                return;
            }
            if (g_rooms[getIndex(socket.room)].word_array == undefined) {
                console.log(" @@ Alert: g_rooms[getIndex(socket.room)].word_array is undefined.");
                return;
            }

            g_rooms[getIndex(socket.room)].current_word = g_rooms[getIndex(socket.room)].word_array[selected_index].split(":")[0];
            g_rooms[getIndex(socket.room)].current_char = g_rooms[getIndex(socket.room)].word_array[selected_index].split(":")[1];
            
            selectedWord();
        });

        socket.on('votekick', function(data) {
             

            if (!g_rooms[getIndex(socket.room)]) {
                return;
            }
            if (g_rooms[getIndex(socket.room)].users.length == 2) {
                return;
            }

            if (g_rooms[getIndex(socket.room)].current_user == undefined) {
                //console.log("votekick -- current user is undefined.");
                return;
            }
            g_rooms[getIndex(socket.room)].kick_count++;
            var current_kick_pressed_user;
            for (var i = 0; i < g_rooms[getIndex(socket.room)].users.length; i++) {

                if (g_rooms[getIndex(socket.room)].users[i].socketID == data) {
                    if (g_rooms[getIndex(socket.room)].users[i].kick_pressed) {
                        return;
                    } else {
                        g_rooms[getIndex(socket.room)].users[i].kick_pressed = true;
                        current_kick_pressed_user = g_rooms[getIndex(socket.room)].users[i];
                    }
                }
            }

            var limit_kick_count = 0;
            if (g_rooms[getIndex(socket.room)].users >= 8) {
                limit_kick_count = 5;
            } else if (g_rooms[getIndex(socket.room)].users >= 5) {

                limit_kick_count = g_rooms[getIndex(socket.room)].users.length - 2;
            } else {
                limit_kick_count = g_rooms[getIndex(socket.room)].users.length - 1;
            }

            io.sockets.in(socket.room).emit('new message', {
                msg: current_kick_pressed_user.user_name + "님이 강퇴에 찬성하셨습니다. (" + g_rooms[getIndex(socket.room)].kick_count + " / " + limit_kick_count + ")",
                color: "green"
            });

            if (g_rooms[getIndex(socket.room)].kick_count < limit_kick_count) {
                console.log("kick canceled");
                return;
            }

            io.to(g_rooms[getIndex(socket.room)].current_user.socketID).emit('kicked');
            index = g_rooms[getIndex(socket.room)].users.findIndex(user => user.socketID === g_rooms[getIndex(socket.room)].current_user.socketID);
            disconnectedUser = g_rooms[getIndex(socket.room)].users[index];
            // If the disconnected user was also logged in (otherwise his ID won't show up in g_rooms[getIndex(socket.room)].users)
            if (index !== -1) {
                g_rooms[getIndex(socket.room)].users.splice(index, 1);
                io.sockets.in(socket.room).emit('new message', {
                    msg: `${disconnectedUser.user_name} 님이 퇴장되었습니다.`
                });

                if (g_rooms[getIndex(socket.room)].is_round_running == true && g_rooms[getIndex(socket.room)].users.length < 2) {
                    endGame();
                } else {
                    // End the round when the player to draw disconnects
                    if (g_rooms[getIndex(socket.room)].current_user != undefined) {
                        if (disconnectedUser.socketID === g_rooms[getIndex(socket.room)].current_user.socketID) {
                            endRound();
                        } else if (g_rooms[getIndex(socket.room)].is_round_running) {
                            checkIfEverybodyGuessed();
                        }
                    }
                }
            }
            // console.log('Disconnected: %s sockets connected', io.engine.clientsCount);
            io.sockets.in(socket.room).emit('users', g_rooms[getIndex(socket.room)].users);
        });



        function startGame(room_name) {
            for (var i = 0; i < g_rooms[getIndex(socket.room)].users.length; i++) {
                g_rooms[getIndex(socket.room)].users[i].score = 0;
            }

            io.sockets.in(socket.room).emit('users', g_rooms[getIndex(socket.room)].users);

            g_rooms[getIndex(socket.room)].is_game_running = true;
            startTurn();
        }

        // Game logic
        function getIndex(room_name) {
            return g_rooms.findIndex(room => room.name == room_name);
        }

        function startTurn() {
            for (var i = 0; i < g_rooms[getIndex(socket.room)].users.length; i++) {
                g_rooms[getIndex(socket.room)].users[i].must_draw = true; // only users present at the beginning are required to draw
            }
            io.sockets.in(socket.room).emit('users', g_rooms[getIndex(socket.room)].users);
            g_rooms[getIndex(socket.room)].is_game_running = true;
            startRound();
        }

        function startRound() {

            g_rooms[getIndex(socket.room)].current_user = undefined;
            // Check if there are still players who have to draw
            for (var i = 0; i < g_rooms[getIndex(socket.room)].users.length; i++) {
                if (g_rooms[getIndex(socket.room)].users[i].must_draw) {
                    g_rooms[getIndex(socket.room)].current_user = g_rooms[getIndex(socket.room)].users[i];
                    break;
                }
            }

            // If one player was found, start actually the round
            if (g_rooms[getIndex(socket.room)].current_user !== undefined) {
                //console.log(util.inspect(g_rooms[getIndex(socket.room)], {showHidden: false, depth: null}))

                for (var i = 0; i < g_rooms[getIndex(socket.room)].users.length; i++) {
                    g_rooms[getIndex(socket.room)].users[i].kick_pressed = false;
                    if (g_rooms[getIndex(socket.room)].users[i].socketID == g_rooms[getIndex(socket.room)].current_user.socketID) {

                        g_rooms[getIndex(socket.room)].users[i].status = 'drawing';
                        io.sockets.in(socket.room).emit('new round', g_rooms[getIndex(socket.room)].current_turn, g_rooms[getIndex(socket.room)].current_user);
                        io.sockets.in(socket.room).emit('users', g_rooms[getIndex(socket.room)].users)
                        io.sockets.in(socket.room).emit('new message', {
                            msg: g_rooms[getIndex(socket.room)].current_user.user_name + '님이 그릴 차례입니다'
                        });
                    } else {
                        g_rooms[getIndex(socket.room)].users[i].status = 'guessing';
                    }
                }
                prepareWordArray();
                io.sockets.in(socket.room).emit('notification', {
                    msg: g_rooms[getIndex(socket.room)].current_user.user_name + '님이 단어를 선택 중 입니다.',
                    delay: 0
                });
                io.to(g_rooms[getIndex(socket.room)].current_user.socketID).emit('choose word', g_rooms[getIndex(socket.room)].word_array);
                
            } else {
                g_rooms[getIndex(socket.room)].current_turn++;
                if (g_rooms[getIndex(socket.room)].current_turn > 3) {
                    g_rooms[getIndex(socket.room)].current_turn = 1;
                    endGame();
                } else {
                    endTurn();
                }

            }
        }

        function endGame() {

            g_rooms[getIndex(socket.room)].is_game_running = false;
            if (g_rooms[getIndex(socket.room)].is_round_running) {
                endRound();
            }

            io.sockets.in(socket.room).emit('show game result', g_rooms[getIndex(socket.room)].users);

            // start a new game if there are enough players
            if (g_rooms[getIndex(socket.room)].users.length > 1) {
                setTimeout(function() {
                    io.sockets.in(socket.room).emit('notification', {
                        msg: '새 게임 시작중...',
                        delay: 2000
                    });
                }, 6000);
                setTimeout(function() {
                    startGame(socket.room);
                }, 8000);
            } else if (g_rooms[getIndex(socket.room)].users.length == 1) {
                setTimeout(function() {
                    if (g_rooms[getIndex(socket.room)].users.length == 1)
                        io.to(g_rooms[getIndex(socket.room)].users[0].socketID).emit('notification', {
                            msg: '다른 플레이어들을 기다리고 있습니다.',
                            delay: 0
                        });
                }, 2000);
            }
        }

        function endTurn() {

            g_rooms[getIndex(socket.room)].is_game_running = false;
            if (g_rooms[getIndex(socket.room)].is_round_running)
                endRound();
            // start a new game if there are enough players
            if (g_rooms[getIndex(socket.room)].users.length > 1) {
                setTimeout(startTurn, 500);
            } else if (g_rooms[getIndex(socket.room)].users.length == 1) {
                setTimeout(function() {
                    if (g_rooms[getIndex(socket.room)].users.length == 1)
                        io.to(g_rooms[getIndex(socket.room)].users[0].socketID).emit('notification', {
                            msg: '다른 플레이어들을 기다리고 있습니다.',
                            delay: 0
                        });
                }, 500);
            }
        }

        function endRound() {
            if(g_rooms[getIndex(socket.room)].time_warning){
                clearInterval(g_rooms[getIndex(socket.room)].time_warning);
            }


            for (var i = 0; i < g_rooms[getIndex(socket.room)].users.length; i++) {
                switch (g_rooms[getIndex(socket.room)].users[i].current_rank) {
                    case 1:
                        g_rooms[getIndex(socket.room)].users[i].score_added = 100;
                        break;
                    case 2:
                        g_rooms[getIndex(socket.room)].users[i].score_added = 75;
                        break;
                    case 3:
                        g_rooms[getIndex(socket.room)].users[i].score_added = 60;
                        break;
                    case 4:
                        g_rooms[getIndex(socket.room)].users[i].score_added = 50;
                        break;
                    case 5:
                        g_rooms[getIndex(socket.room)].users[i].score_added = 40;
                        break;
                    case 6:
                        g_rooms[getIndex(socket.room)].users[i].score_added = 30;
                        break;
                    case 7:
                        g_rooms[getIndex(socket.room)].users[i].score_added = 20;
                        break;
                    default:
                        g_rooms[getIndex(socket.room)].users[i].score_added = 0;
                        break;
                }

                if (g_rooms[getIndex(socket.room)].users[i].status == "drawing") {
                    g_rooms[getIndex(socket.room)].users[i].score_added = 80 - (10 * ((g_rooms[getIndex(socket.room)].users.length - 1) - g_rooms[getIndex(socket.room)].guessed_counter));
                    if (g_rooms[getIndex(socket.room)].guessed_counter == 0) {
                        g_rooms[getIndex(socket.room)].users[i].score_added = 0;
                    }
                }
            }

            io.sockets.in(socket.room).emit('finished draw');
            io.sockets.in(socket.room).emit('drawing', 'clear');

            g_rooms[getIndex(socket.room)].lines_history = [];

            var data = {
                userList: g_rooms[getIndex(socket.room)].users,
                correct_word: g_rooms[getIndex(socket.room)].current_word,
                everybody_guessed: g_rooms[getIndex(socket.room)].everybody_guessed
            };
            //socket.broadcast.to(socket.room).emit('notification', { msg: '라운드 종료', delay: 5000 })

            WriteRoomTable("[ turn "+g_rooms[getIndex(socket.room)].current_turn + " ] [ "+ g_rooms[getIndex(socket.room)].current_user.user_name + "'s round ] is End. ");

            io.sockets.in(socket.room).emit('show round result', data);
            io.sockets.in(socket.room).emit('users', g_rooms[getIndex(socket.room)].users); //update the scores list

            for (var i = 0; i < g_rooms[getIndex(socket.room)].users.length; i++) {
                g_rooms[getIndex(socket.room)].users[i].status = 'idle';
                g_rooms[getIndex(socket.room)].users[i].score += g_rooms[getIndex(socket.room)].users[i].score_added;
                g_rooms[getIndex(socket.room)].users[i].score_added = 0;
                g_rooms[getIndex(socket.room)].users[i].current_rank = 0;

            }
            index = g_rooms[getIndex(socket.room)].users.findIndex(user => user.socketID === g_rooms[getIndex(socket.room)].current_user.socketID);

            if (index != -1) {
                g_rooms[getIndex(socket.room)].users[index].must_draw = false;
            }

            g_rooms[getIndex(socket.room)].current_user = undefined;
            g_rooms[getIndex(socket.room)].current_word = undefined;
            g_rooms[getIndex(socket.room)].current_char = undefined;
            g_rooms[getIndex(socket.room)].guessed_counter = 0;
            g_rooms[getIndex(socket.room)].is_round_running = false;
            g_rooms[getIndex(socket.room)].everybody_guessed = false;
            g_rooms[getIndex(socket.room)].current_rank = 1;
            g_rooms[getIndex(socket.room)].kick_count = 0;



            updateHighscores();
            if (g_rooms[getIndex(socket.room)].is_game_running) {

                setTimeout(startRound, 6000);
            }
        }

        function selectedWord() {
            if (!g_rooms[getIndex(socket.room)].current_user.socketID) {
                console.log("=== error ===")
                return;
            }

            io.sockets.connected[g_rooms[getIndex(socket.room)].current_user.socketID].broadcast.to(g_rooms[getIndex(socket.room)].name).emit('current char', g_rooms[getIndex(socket.room)].current_char);

            io.to(g_rooms[getIndex(socket.room)].current_user.socketID).emit('current word', g_rooms[getIndex(socket.room)].current_word);
            io.to(g_rooms[getIndex(socket.room)].current_user.socketID).emit('start draw');

            // io.sockets.connected[g_rooms[getIndex(socket.room)].current_user.socketID].broadcast.emit('notification', { msg: `${g_rooms[getIndex(socket.room)].current_user.user_name}님의 턴입니다. 60초동안 맞추어야 합니다.`, delay: 2500 });
            io.sockets.connected[g_rooms[getIndex(socket.room)].current_user.socketID].broadcast.to(g_rooms[getIndex(socket.room)].name).emit('notification', {
                msg: "",
                delay: 100
            });

            io.sockets.in(socket.room).emit('users', g_rooms[getIndex(socket.room)].users)

            g_rooms[getIndex(socket.room)].is_round_running = true;
            g_rooms[getIndex(socket.room)].time_counter = 61;
            g_rooms[getIndex(socket.room)].time_warning = setInterval(function() {
                g_rooms[getIndex(socket.room)].time_counter -= 1;
                if (g_rooms[getIndex(socket.room)].time_counter < 0) {
                    g_rooms[getIndex(socket.room)].time_counter = 0;
                    endRound();
                    io.sockets.in(socket.room).emit('new message', {
                        msg: '라운드 종료'
                    });
                }
                io.sockets.in(socket.room).emit('count down', g_rooms[getIndex(socket.room)].time_counter);
            }, 1000);


        }

        function updateHighscores() {
            // highscores = require('../resources/highscores.json');
            // for (var i = 0; i < g_rooms[getIndex(socket.room)].users.length; i++) {
            //     newUser = g_rooms[getIndex(socket.room)].users[i].user_name;
            //     newScore = g_rooms[getIndex(socket.room)].users[i].score;
            //     for (let name in highscores) {
            //         if (name == newUser) {
            //             if (newScore > highscores[name])
            //                 highscores[name] = newScore;
            //         }
            //         else
            //             highscores[newUser] = newScore;
            //     }
            // }
            // const json = JSON.stringify(highscores);

            // fs.writeFile('mynewfile3.txt', json, function (err) {
            //   if (err) throw err;
            //   //console.log('Saved!');
            // });


            // // fs.writeFile("../resources/highscores_.json", json, (err) => {
            // //     if (err) throw err;
            // // }
            // // );
        }

        function checkIfEverybodyGuessed() {
            for (var i = 0; i < g_rooms[getIndex(socket.room)].users.length; i++) {
                if (g_rooms[getIndex(socket.room)].users[i].status == 'guessing')
                    return;
            }

            g_rooms[getIndex(socket.room)].everybody_guessed = true;

            endRound();
        }

        function prepareWordArray() {
            g_rooms[getIndex(socket.room)].word_array = [];

            index = Math.floor(Math.random() * words.length);
            g_rooms[getIndex(socket.room)].word_array.push(words[index]);

            index = Math.floor(Math.random(index) * words.length);
            g_rooms[getIndex(socket.room)].word_array.push(words[index]);

            index = Math.floor(Math.random(index) * words.length);
            g_rooms[getIndex(socket.room)].word_array.push(words[index]);
        }


        function MyLog(str)
        {
            console.log(util.inspect(str, {showHidden: false, depth: null}))
        }

        function WriteRoomTable(str)
        {
            console.log(" - [ "+socket.room+" ] "+str+"");
            console.table(g_rooms,["index","name","is_full","is_game_running","is_round_running","current_user","current_rank","current_turn","guessed_counter","turn_index","everybody_guessed","kick_count","current_word","current_char"]);
            for(var i = 0; i< g_rooms.length; i++){
                console.log(" "+g_rooms[i].name + " user = " + g_rooms[i].users.length);
                console.table(g_rooms[i].users);
            }
            console.log("\n");
        }

    });
}

