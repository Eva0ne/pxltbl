// Countdown timer program.

var gameState = 0;
var time = 0;
var timerStarted = false;

exports.setup = function(api) {

    api.blank(0,0,0);

};

exports.loop = function(api) {

    switch (gameState) {
        case 0:
            // User sets time
            setTimer(api);
            break;
        case 1:
            // Countdown begins
            countdown(api);
            break;

    }
}

function setTimer(api) {

    api.blank(0, 0, 0);
    api.setDrawColor(0, 255, 0);
    api.fillBox(13, 15, 6, 3);
    api.setDrawColor(0, 0, 255);
    api.fillBox(28, 10, 3, 3);
    api.fillBox(28, 5, 3, 3);

    console.log('Hi');
    api.setDrawColor(255, 0, 0);
    while (timerStarted == false) {
        if (api.isTouchInBounds(28, 10, 3, 3)) {
            console.log('Down');
            time = time + 1;
            api.text(time, 4, 1);
        } else if (api.isTouchInBounds(28, 5, 3, 3)) {
            console.log('Up');
            time = time - 1;
            api.text(time, 4, 1);
        } else if (api.isTouchInBounds(13,15,6,3)) {
            console.log('Start');
            timerStarted = true;
        }
    }
    gameState = 1;
}

function countdown(api) {



}


