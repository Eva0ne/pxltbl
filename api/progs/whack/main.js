// Whack a mole prog.

// Put variables here that you need to persist between loops.
var failMessage = 'Over'; // Message that appears when game is over.
var welcomeMessage = 'Whack a Mole'; // Title of game.
var hitMessage = 'Hit!'; // Message when mole is hit.
var timeLimit = 0; // Time given to whack mole.
var score = 0; // One mole = one point.
var gameState = 0; // Switch that cycles between welcome screen, main game and game end.



var moleCorner = 0;  // 0 = top left, 1 = top right ...

var moleVisible = false; // Mle is not visible.
var moleWhacked = false; // Mole has not been whacked.
var moleWhackedTime = 0; // Time when mole was whacked.
var moleAppearTime = 0; // Time when mole appeared.




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

    //if any button pressed,  gameState++;
    api.blank(0, 0, 0);
    api.setDrawColor(106,13,173); // Purple
    api.fillBox(0,0,32,2); // Draws borders
    api.fillBox(0,16,32,2);
    api.text(welcomeMessage,2,5); // Displays game name.
    if (api.getButtons().any) {
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

    if (api.isTouchInBounds(5,13,3,3)) {
        timeLimit = 4000;
        gameState = 2;
        moveMole(api); // Set mole to random corner.
    }
    else if (api.isTouchInBounds(15,13,3,3)) {
        timeLimit = 3000;
        gameState = 2;
        moveMole(api);
    }
    else if (api.isTouchInBounds(25,13,3,3)) {
        timeLimit = 2000;
        gameState = 2;
        moveMole(api);
    }

}

// Game mechanics.
function playGame(api) {

    // Draws hole borders.
    api.setDrawColor(106,13,173);
    api.fillBox(0,0,4,4);
    api.setDrawColor(0,0,0);
    api.fillBox(1,1,2,2);
    api.setDrawColor(106,13,173);
    api.fillBox(28,0,4,4);
    api.setDrawColor(0,0,0);
    api.fillBox(29,1,2,2);
    api.setDrawColor(106,13,173);
    api.fillBox(0,14,4,4);
    api.setDrawColor(0,0,0);
    api.fillBox(1,15,2,2);
    api.setDrawColor(106,13,173);
    api.fillBox(28,14,4,4);
    api.setDrawColor(0,0,0);
    api.fillBox(29,15,2,2);

    var moleX, moleY;

    // Hole locations.
    switch (moleCorner) {
        case 0:
            moleX = 1;
            moleY = 1;
            break;
        case 1:
            moleX = 29;
            moleY = 1;
            break;
        case 2:
            moleX = 1;
            moleY = 15;
            break;
        case 3:
            moleX = 29;
            moleY = 15;
            break;
    }

    // if mole visible = true
    if(moleVisible === true) {
        // draw the mole in the correct corner
        // has it been whacked
        if(moleWhacked) {

            api.setDrawColor(255,0,0);
            api.playWav('sfx_damage_hit3');
            api.text(hitMessage,9,5);
        } else {
            api.setDrawColor(255,255,255);
        }
        // If time has elapsed and mole not whacked.
        if(api.getMillis() - moleAppearTime > timeLimit) {
            gameOver(api);
        }
        api.fillBox(moleX, moleY, 2,2);

    }


    // switch for each corner
    switch (moleCorner) {
        case 0:
            // does the button pressed == the correct corner?
            if(api.getButtons().topLeft || api.getButtons().leftTop || api.isTouchInBounds(0,0,4,4)) {
                // if so display the mole whacked
                moleWhackedTime = api.getMillis();
                moleWhacked = true;
            }
            break;
        case 1:
            if(api.getButtons().topRight || api.getButtons().rightTop || api.isTouchInBounds(28,0,4,4)) {
                moleWhacked = true;
                moleWhackedTime = api.getMillis();
            }
            break;
        case 2:
            if(api.getButtons().bottomLeft || api.getButtons().leftBottom || api.isTouchInBounds(0,14,4,4)) {
                moleWhacked = true;
                moleWhackedTime = api.getMillis();
            }
            break;
        case 3:
            if(api.getButtons().bottomRight || api.getButtons().rightBottom || api.isTouchInBounds(28,14,4,4)) {
                moleWhacked = true;
                moleWhackedTime = api.getMillis();
            }
            break;

    }

    // if been whacked move the mole to a new corner
    if(moleWhacked && api.getMillis() - moleWhackedTime > 1000) {

        api.clearInputs();
        api.log('Time: ' + (moleWhackedTime - moleAppearTime));
        score += 1;
        api.log('Score: ' + score);
        timeLimit = timeLimit - 100;
        api.log('Time Limit: ' + timeLimit);
        moveMole(api);

        if(api.getButtons().topRight) {
            if(moleWhackedTime > 1000) {
                gameOver(0);
            }
        }

    }


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

function moveMole(api) {
    // Set the mole to a random corner
    moleCorner = Math.floor(Math.random() * 4);
    // Set the mole to be visible
    moleVisible = true;
    // And not whacked
    moleWhacked = false;
    // Blank the screen
    api.blank(0, 0, 0);
    moleAppearTime = api.getMillis();

}


