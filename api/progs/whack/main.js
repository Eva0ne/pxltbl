// Whack a mole prog.

// Put variables here that you need to persist between loops.
var failMessage = 'Over'; // Message that appears when game is over.
var welcomeMessage = 'Whack a Mole'; // Title of game.
var hitMessage = 'Hit!'; // Message when mole is hit.
var timeLimit = 0; // Time given to whack mole.
var score = 0; // One mole = one point.
var gameState = 0; // Switch that cycles between welcome screen, main game and game end.
var nextPopupTime = 0;


var numMoles = 4;

var moleX = [];
var moleY = [];
var moleVisible = []; // Mole is visible.
var moleWhacked = []; // Mole has not been whacked.
var moleWhackedTime = []; // Time when mole was whacked.
var moleAppearTime = []; // Time when mole appeared.
var moleHideTime = []; // Time when mole should hide.


// Code here gets executed once at program startup.
exports.setup = function(api) {

    // Blanks the screen
    api.blank(0, 0, 0);

}

exports.loop = function(api) {

    //need to add switch here on gameState
    switch (gameState) {
        case 0:
            // Welcome screen
            setupGame(api);
            break;
        case 1:
            // Speed select
            setSpeed(api);
            break;
        case 2:
            // Main game
            playGame(api);
            break;
        case 3:
            // Game over screen
            endOfGame(api);
            break;

    }
}

function setupGame(api) {

    api.blank(0, 0, 0);
    api.fillBox(0,0,32,2); // Draws borders
    api.fillBox(0,16,32,2);
    api.text(welcomeMessage,2,5); // Displays game name.
    api.setDrawColor(106,13,173); // Purple
    api.clearInputs();

    // setup our moles
    for(var i=0; i < numMoles; i++) {
        moleX[i] = Math.floor(Math.random() * (api.getScreenWidth() - 2)) + 1;
        moleY[i] = Math.floor(Math.random() * (api.getScreenHeight() - 2)) + 1;
        moleVisible[i] = false;
        moleWhacked[i] = false;
    }

    //if any button pressed,  gameState++;
    if (api.getButtons().any || api.getTouch) {
        // Triggers main game when any button is pressed. Need to include touch.
        api.blank(0, 0, 0);
        gameState = 1;
    }
}

// Allows user to select game speed.
function setSpeed(api) {

    api.setDrawColor(106,13,173);
    api.text('Speed:',1,1);
    api.setDrawColor(0,255,0);
    api.fillBox(5,13,3,3);
    api.setDrawColor(255,191,0);
    api.fillBox(15,13,3,3);
    api.setDrawColor(255,0,0);
    api.fillBox(25,13,3,3);
    api.clearInputs();

    if (api.isTouchInBounds(5,13,3,3)) {
        timeLimit = 4000;
        gameState = 2;
        resetScreen(api); // Set mole to random corner.
    }
    else if (api.isTouchInBounds(15,13,3,3)) {
        timeLimit = 3000;
        gameState = 2;
        resetScreen(api);
    }
    else if (api.isTouchInBounds(25,13,3,3)) {
        timeLimit = 2000;
        gameState = 2;
        resetScreen(api);
    }

}

// Game mechanics.
function playGame(api) {

    for(var i=0; i < numMoles; i++) {


        // has mole been whacked?
        if(api.isTouchInBounds(moleX[i],moleY[i],2,2)) {
            console.log('Click');
            if(moleVisible[i]) {
                moleWhackedTime[i] = api.getMillis();
                moleWhacked[i] = true;
                resetScreen(api);
            } else {
                //you missed!
                api.text('Miss!');
                score -= 1;
            }
        }
        //draw mole (could be optimised)
        drawMole(i,api);
    }
    popupMole(api);

}

function endOfGame(api) {
    //display score / game over msg
    api.blank(0, 0, 0);
    api.setDrawColor(255, 0, 0);
    api.text(failMessage,4,1);
    api.text('SC=' + score,4,9);

    // give option to exit, or option to restart
    if (api.getButtons().left || api.isTouchInBounds(0,0,16,18)) {
        api.exit();
    } else if (api.getButtons().right || api.isTouchInBounds(17,0,16,18)) {
        gameState = 0;
    }
}





function gameOver(api) {
    // advance gameState
    gameState = 3;
    // play sound
    api.playWav('looser');

}

function resetScreen(api) {
    //more like reset screen
    console.log('Clear');
    api.blank(0, 0, 0);
    moleAppearTime = api.getMillis();

}

function drawMole(mole,api) {

    api.setDrawColor(106,13,173);
    api.fillBox(moleX[mole]-1,moleY[mole]-1,4,4);
    if(moleVisible[mole]) {
        api.setDrawColor(255, 255, 255);
    } else {
        api.setDrawColor(0, 0, 0);
    }
    api.fillBox(moleX[mole], moleY[mole], 2, 2);

}

function popupMole(api) {

    //is the next popup time in the past?
    if(nextPopupTime < api.getMillis()) {


        //pick a random mole that's not popped up (if all moles are visible do nothing)
        var isMoleHidden = false;
        for(var i=0; i < numMoles; i++) {
            if(!moleVisible[i]) {
                isMoleHidden = true;
                break;
            }
        }

        if(isMoleHidden) {
            //there is at least one hidden mole, so lets pop one up at random
            var randomMole;
            do {
                randomMole = Math.floor(Math.random() * numMoles);
            } while(moleVisible[randomMole]);

            //woohoo we have a random hidden mole
            moleVisible[randomMole] = true;
            moleWhacked[randomMole] = false;
            moleAppearTime[randomMole] = api.getMillis();
            moleHideTime[randomMole] = moleAppearTime[randomMole] + 3000;
        }

        //set the delay before the next popup
        nextPopupTime = api.getMillis() + 1000 + Math.floor(Math.random() * 1000);

    }
}


