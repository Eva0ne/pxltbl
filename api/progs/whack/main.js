// Whack a mole prog.

// Settings


// Put variables here that you need to persist between loops.
var failMessage = 'Over'; // Message that appears when game is over.
var welcomeMessage = 'Whack a Mole'; // Title of game.
var hitMessage = 'Hit!'; // Message when mole is hit.

// skill vars
var moleVisibleTime = 0;
var numMoles = 0;
var missLimit = 0;
var nextMoleMinTime = 0;
var nextMoleMaxTime = 0;

// game vars
var score = 0; // One mole hit = one point.
var misses = 0; // Number of misses
var gameState = 0; // Switch that cycles between welcome screen, main game and game end.
var nextPopupTime = 0;
var missed = false;
var reduceTime = 50;

// moles
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

    switch (gameState) {
        case 0:
            // Welcome Screen
            showWelcome(api);
            break;
        case 1:
            // Setup game
            setupGame(api);
            break;
        case 2:
            // Speed select
            setDifficulty(api);
            break;
        case 3:
            // Main game
            playGame(api);
            break;
        case 4:
            // Game over screen
            endOfGame(api);
            break;

    }
}

function showWelcome(api) {

    // Draw welcome screen
    api.setDrawColor(130,64,191);
    api.blank(0, 0, 0);
    api.fillBox(0,0,32,2); // Draws borders
    api.fillBox(0,16,32,2);
    api.text(welcomeMessage,2,5); // Displays game name.
    api.setDrawColor(106,13,173); // Purple
    api.clearInputs();

    gameState++;

}

function setupGame(api) {
    //if any button pressed,  gameState++;
    if (api.getButtons().any || api.getTouch().length) {

        // Triggers main game when any button is pressed. Need to include touch.
        api.blank(0, 0, 0);
        gameState++;
    }
}

// Allows user to select game difficulty.
function setDifficulty(api) {

    api.setDrawColor(106,13,173);
    api.text('Speed:',1,1);
    api.setDrawColor(0,255,0);
    api.fillBox(5,13,3,3);
    api.setDrawColor(255,191,0);
    api.fillBox(15,13,3,3);
    api.setDrawColor(255,0,0);
    api.fillBox(25,13,3,3);
    api.clearInputs();

    // Could be optimised
    if (api.isTouchInBounds(5,13,3,3)) { // Easy
        numMoles = 4;
        missLimit = 3;
        moleVisibleTime = 3000;
        nextMoleMinTime = 3000;
        nextMoleMaxTime = 4000;
        gameState++;
        resetScreen(api);
    }
    else if (api.isTouchInBounds(15,13,3,3)) { // Medium
        numMoles = 5;
        missLimit = 5;
        moleVisibleTime = 2000;
        nextMoleMinTime = 2000;
        nextMoleMaxTime = 3000;
        gameState++;
        resetScreen(api);
    }
    else if (api.isTouchInBounds(25,13,3,3)) { // Hard
        numMoles = 6;
        missLimit = 7;
        moleVisibleTime = 1000;
        nextMoleMinTime = 1000;
        nextMoleMaxTime = 2000;
        gameState++;
        resetScreen(api);
    }

    // setup our moles
    for(var i=0; i < numMoles; i++) {

        moleX[i] = Math.floor(Math.random() * (api.getScreenWidth() - 3)) + 1;
        moleY[i] = Math.floor(Math.random() * (api.getScreenHeight() - 3)) + 1;
        moleVisible[i] = false;
        moleWhacked[i] = false;
    }

}

// Game mechanics.
function playGame(api) {


    for (var i = 0; i < numMoles; i++) {

        // has mole been whacked?
        if(api.getTouch().length) {

            if (api.isTouchInBounds(moleX[i], moleY[i], 2, 2)) {

                if (moleVisible[i] && !moleWhacked[i]) {
                    api.log('Whack!');
                    moleWhackedTime[i] = api.getMillis();
                    moleWhacked[i] = true;
                    score++;
                    moleVisibleTime -= reduceTime;
                    nextMoleMaxTime -= reduceTime;
                    nextMoleMinTime -= reduceTime;
                    api.log('Score: ' + score);
                    api.log('Visible Time: ' + moleVisibleTime);
                    api.log('Max Time: ' + nextMoleMaxTime);
                    api.log('Min Time: ' + nextMoleMinTime);
                }

            } else if (!missed && !api.isTouchInBounds(moleX[i], moleY[i], 2, 2)) {
                //you missed!
                api.log('miss!');
                misses++;
                api.log('misses: ' + misses);
                missed = true;
                if(misses == missLimit){
                    gameState++;
                }
            }
        } else {
            missed = false;
        }


        // check for moles that need to hide
        if(moleVisible[i] && api.getMillis() > moleHideTime[i]) {
            api.log('Hide mole time');
            moleWhacked[i] = false;
            moleVisible[i] = false;
        }

        // check for old whacked moles
        if(moleVisible[i] && moleWhacked[i] && api.getMillis() - moleWhackedTime[i] > 200) {
            api.log('Hide mole whacked');
            moleWhacked[i] = false;
            moleVisible[i] = false;
        }
        //draw mole (could be optimised)
        drawMole(i, api);
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
    if (api.getButtons().any) {
        api.exit();
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
    api.log('Clear');
    api.blank(0, 0, 0);
    missed = true;


}

function drawMole(mole,api) {

    api.setDrawColor(106,13,173);
    api.fillBox(moleX[mole]-1,moleY[mole]-1,4,4);

    if(moleWhacked[mole]) {
        api.setDrawColor(255, 0, 0);
    } else if(moleVisible[mole]) {
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
            moleHideTime[randomMole] = moleAppearTime[randomMole] + moleVisibleTime;

        }

        //set the delay before the next popup
        nextPopupTime = api.getMillis() + nextMoleMinTime + Math.floor(Math.random() * nextMoleMaxTime-nextMoleMinTime);

    }
}


