// Main game elements
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 576;
let canvasColor = 'white';
c.fillStyle = canvasColor;
c.fillRect(0, 0, canvas.width, canvas.height);

const keys = {
    a: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
}

const gravity = 0.52;

let animRequest;
let isGameOver;
let playerMovementEnabled;

let mainGameMusicSources = ["./sounds/Jerry Five.mp3","./sounds/Cool Blast.mp3",
                            "./sounds/Blobby Samba.mp3","./sounds/Special Spotlight.mp3",
                            "./sounds/Vicious.mp3"];
let gameMusic;


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// Platforms/Blocks that the player can collide with
let topPlatform;
let btmLeftPlatform;
let btmRightPlatform;

let btmCanvasPlatform;

let topCanvasPlatform;

let leftCanvasPlatform;

let rightCanvasPlatform;

let collisionBlocks;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// Creating the player and enemy. Also handling score and game over
let player;

let score;
let highScore = 0;
let scoreId;

// Creating the first enemy that will spawn and future enemies
let enemy;

let enemies = [];
function increaseEnemies() {
    let randomx = Math.random() * (5.15 - 1) + 1;
    let randomy = Math.random() * (5.15 - 1) + 1;
    document.getElementById("enemySplitSound").loop = false;
    document.getElementById("enemySplitSound").load();
    document.getElementById("enemySplitSound").play();
    enemies[enemies.length] = new Enemy({
        position: {
            x: enemy.position.x,
            y: enemy.position.y,
        },
        collisionBlocks: collisionBlocks,
        velocity: {
            x: randomx,
            y: randomy
        },
        color: 'black'
    });
}

// Handling the powerups and traps
// Variables with no "Icon" at the end are booleans to determine if the powerup/trap is active
let powerupDeleteHalfIcon; // index 0
let powerupPacmanIcon; // index 1
let powerupSlowTimeIcon; // (0, 162, 232) rgb index 2

let slowTimeCount;
let isSlowTimeActive;

let trapAddOneIsOn;
let trapAddOneIcon;

let powerupArray = [];

let abilityPositionIndex;

let trapArray = [];

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initializes all the necessary values, variables, and objects for the game to start
function startGame() {

    playerMovementEnabled = true;
    isGameOver = false;

    // Platforms and boundaries
    topPlatform = new Platform({
        position: {
            x: canvas.width/2,
            y: canvas.height/3,
        },
        dimensions: {
            x: 200,
            y: 25
        }
    })
    btmLeftPlatform = new Platform({
        position: {
            x: canvas.width/4.5,
            y: canvas.height/1.5,
        },
        dimensions: {
            x: 200,
            y: 25
        }
    })
    btmRightPlatform = new Platform({
        position: {
            x: 796,
            y: canvas.height/1.5,
        },
        dimensions: {
            x: 200,
            y: 25
        }
    })
    
    btmCanvasPlatform = new Platform({
        position: {
            x: canvas.width/2,
            y: canvas.height,
        },
        dimensions: {
            x: canvas.width + 30,
            y: 30
        }
    })
    
    topCanvasPlatform = new Platform({
        position: {
            x: canvas.width/2,
            y: -30,
        },
        dimensions: {
            x: canvas.width + 30,
            y: 30
        }
    })
    
    leftCanvasPlatform = new Platform({
        position: {
            x: -15,
            y: 0,
        },
        dimensions: {
            x: 30,
            y: canvas.height + 30
        }
    })
    
    rightCanvasPlatform = new Platform({
        position: {
            x: canvas.width + 15,
            y: 0,
        },
        dimensions: {
            x: 30,
            y: canvas.height + 30
        }
    })
    
    // Platforms/barriers that can be collided with
    collisionBlocks = [topPlatform, btmLeftPlatform, btmRightPlatform, 
        btmCanvasPlatform, leftCanvasPlatform, rightCanvasPlatform, topCanvasPlatform];

    // Player and enemy
    player = new Player({
        position: {
            x: canvas.width/2,
            y: canvas.height - 50,
        },
        collisionBlocks: collisionBlocks
    });
    
    // This is the original enemy. It is a different color than the others. It is the enemy that
    // will create more enemies, and it cannot be destroyed/killed
    enemy = new Enemy({
        position: {
            x: canvas.width/2,
            y: canvas.height/1.5,
        },
        collisionBlocks: collisionBlocks,
        velocity: {
            x: 4.75,
            y: 4.75
        },
        color: 'rgb(30, 30, 30)'
    });

    enemies.length = 0;
    enemies[enemies.length] = enemy;

    document.querySelector('#score').innerHTML = 0;
    score = -1;

    document.getElementById("gameOver").style.display = "none";

    powerupDeleteHalfIcon = new Ability({
        htmlImage: document.getElementById("deleteHalf"),
        isSpawned: false,
    });
    powerupPacmanIcon = new Ability({
        htmlImage: document.getElementById("pacman"),
        isSpawned: false,
    });
    powerupSlowTimeIcon = new Ability({
        htmlImage: document.getElementById("slowtime"),
        isSpawned: false,
    });

    slowTimeCount = 0;
    isSlowTimeActive = false;

    powerupArray = [powerupDeleteHalfIcon, powerupPacmanIcon, powerupSlowTimeIcon]

    window.requestAnimationFrame(animate);
    increaseScore();

    // Music
    gameMusic = document.getElementById("gameMusic");
    gameMusic.src = mainGameMusicSources[getRandomInt(0,mainGameMusicSources.length-1)];
    gameMusic.play();

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//Loads the main menu screen
function loadMainMenu() {
    
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//Game Over that deletes/resets any unnecessary things to prepare for game restart
function gameOver({score, scoreId}) {
    if (score > highScore) {
        highScore = score;
    }
    console.log("Your current high score is " + highScore);
    document.getElementById("Your score is").innerHTML = "Your score is " + score;
    document.getElementById("gameOver").style.display = "block";
    window.cancelAnimationFrame(animRequest);
    clearTimeout(scoreId);

    playerMovementEnabled = false;
}

// Test the number of enemies currently spawned
// let numEnemies = 1;
function increaseScore() {
    scoreId = setTimeout(increaseScore, 1000);
    if(isGameOver) {
        if(score == -1) {
            gameOver({0: scoreId});
        } else {
            gameOver({score, scoreId});           
        }
    } else {
        score += 1;
        document.querySelector('#score').innerHTML = score;
        if (score != 0) {

            if(isSlowTimeActive){
                console.log("Cant spawn enemy, Slow Time is active!");
            }

            // Controlling when to spawn more enemies (can't spawn while slow time powerup is on)
            if(!isSlowTimeActive) {
                if(score <= 105) {
                    if (score % 15 == 0) {
                        increaseEnemies();
                        // console.log(++numEnemies " at " + score);
                    }   // multiplies enemies every 15 while score <= 105
                } else {
                    if ((score+5) % 10 == 0) {
                        increaseEnemies();
                        // console.log(++numEnemies " at " + score);
                    }   // multiplies enemies every 10 while score > 105
                }
            }

            //Controlling when to spawn and despawn a powerup/trap
            if(score >= 20) {
                if((score+10) % 15 == 0) { // Spawn powerup every 15 while score >= 20
                    let powerupIndex = getRandomInt(0,powerupArray.length-1);
                    spawnPowerup(powerupIndex);
                    console.log("Spawned at " + score);
                    setTimeout( function() { powerupArray[powerupIndex].isSpawned = false; }, 5000);
                }
            }
        }
    }
}

function spawnPowerup(powerupIndex) {
    powerupArray[powerupIndex].randomIndex = getRandomInt(0,2);
    powerupArray[powerupIndex].isSpawned = true;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// Animating the game elements
function animate() {
    animRequest = window.requestAnimationFrame(animate);
    c.fillStyle = canvasColor;
    c.fillRect(0, 0, canvas.width, canvas.height);
    topPlatform.draw();
    btmLeftPlatform.draw();
    btmRightPlatform.draw();

    player.update();
    
    // Check if any powerup has spawned or if its ability is active
    for(let i = 0; i < powerupArray.length; i++) {
        if(powerupArray[i].isSpawned) {
            powerupArray[i].update();
        }

        if(powerupArray[i].isActive) {
            // DeleteHalf Powerup
            // Randomly deletes half of the enemies on the screen
            // The original enemy will not be deleted
            if(i == 0) {
                powerupArray[i].isActive = false;
                document.getElementById("deleteHalfSound").loop = false;
                document.getElementById("deleteHalfSound").load();
                document.getElementById("deleteHalfSound").play();
                 console.log("Curr num of enemies is " + enemies.length)
                let numEnemiesToDelete = Math.floor(enemies.length/2);
                 console.log("Enemies to delete is " + numEnemiesToDelete)
                for(let j = 0; j < numEnemiesToDelete; j++)
                {
                    enemies.splice(getRandomInt(1,enemies.length-1),1);
                }
                console.log("After DeleteHalf: " + enemies.length);
            }

            // Pacman Powerup
            // Pacman powerup lets player reduce the size of enemies when they collide with player
            // Also reduces enemy speed
            // After an enemy has been touched 3 times, it dissapears
            // The original enemy cannot be affected by this
            // Duration is 5 seconds
            else if(i == 1) {
                powerupArray[i].isActive = false;
                player.isPacmanOn = true;
                gameMusic.pause();
                document.getElementById("pacmanPowerupSound").loop = false;
                document.getElementById("pacmanPowerupSound").load();
                document.getElementById("pacmanPowerupSound").play();

                // This will make the player alternate colors like a mario star effect
                let id = setInterval(function () {
                    player.color = 'yellow';
                    setTimeout( function() { 
                        player.color = 'rgb(255, 255, 143)';
                    }, 100);
                }, 200);

                setTimeout( function() { 
                    clearInterval(id);
                    player.isPacmanOn = false;
                    document.getElementById("pacmanPowerupSound").pause();
                    gameMusic.play();
                    // Ensures that changing the color to red happens after the interval has finished
                    setTimeout( function() {
                        player.color = 'red';
                    }, 100);
                }, 5000);
            }

            // SlowTime Powerup
            // SlowTime powerup reduces the speed of every enemy by a third
            // Screen will turn blue to emphasize the effect
            // Duration is 5 seconds
            // Has an additional effect of add 5 to score every 3 times it is activated
            // New enemies won't spawn while this is active
            else if(i == 2) {
                powerupArray[i].isActive = false;
                slowTimeCount += 1;
                isSlowTimeActive = true;

                gameMusic.playbackRate = 0.8;
                gameMusic.volume = 0.7;
                document.getElementById("slowTimePowerupSound").loop = false;
                document.getElementById("slowTimePowerupSound").volume = 0.5;
                document.getElementById("slowTimePowerupSound").load();
                document.getElementById("slowTimePowerupSound").play();
                canvasColor = 'rgb(0, 162, 232)';
                let enemyArrLength = enemies.length; // So that only the current enemies are affected

                // Activate SlowTime's extra effect
                if(slowTimeCount >= 2) {
                    console.log("SlowTime additional effect!")
                    slowTimeCount = 0;
                    for (let i = 0; i < enemyArrLength; i++) {
                        enemies[i].velocity.x = enemies[i].velocity.x/10;
                        enemies[i].velocity.y = enemies[i].velocity.y/10;
                    }
                    score += 5;
                    setTimeout( function() { 
                        gameMusic.playbackRate = 1;
                        document.getElementById("slowTimePowerupSound").pause();
                        gameMusic.volume = 1;
                        canvasColor = 'white';
                        for (let i = 0; i < enemyArrLength; i++) {
                            enemies[i].velocity.x = enemies[i].velocity.x*10;
                            enemies[i].velocity.y = enemies[i].velocity.y*10;
                        }
                        isSlowTimeActive = false;
                    }, 5000);
                } else {
                    for (let i = 0; i < enemyArrLength; i++) {
                        enemies[i].velocity.x = enemies[i].velocity.x/2;
                        enemies[i].velocity.y = enemies[i].velocity.y/2;
                    }

                    setTimeout( function() { 
                        gameMusic.playbackRate = 1;
                        document.getElementById("slowTimePowerupSound").pause();
                        gameMusic.volume = 1;
                        canvasColor = 'white';
                        for (let i = 0; i < enemyArrLength; i++) {
                            enemies[i].velocity.x = enemies[i].velocity.x*2;
                            enemies[i].velocity.y = enemies[i].velocity.y*2;
                        }
                        isSlowTimeActive = false;
                    }, 5000);
                }
            }
        }
    }

    player.velocity.x = 0;
    if(keys.a.pressed || keys.ArrowLeft.pressed) player.velocity.x = -10
    else if(keys.d.pressed || keys.ArrowRight.pressed) player.velocity.x = 10

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// User key inputs
window.addEventListener('keydown', (event) => {
    if (playerMovementEnabled) {
        switch (event.key) {
            case 'w':
                if (player.velocity.y >= -0.25) {
                    player.velocity.y = -16.5; //Changes how high player jumps
                }
                break
            case 'ArrowUp':
                if (player.velocity.y >= -0.25) {
                    player.velocity.y = -16.5; //Changes how high player jumps
                }
                break
            case 'a':
                keys.a.pressed = true;
                break
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                break
            case 'd':
                keys.d.pressed = true;
                break
            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                break
        }
    }
})

window.addEventListener('keyup', (event) => {
    if (playerMovementEnabled) {
        switch (event.key) {
            case 'a':
                keys.a.pressed = false;
                break
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = false
                break
            case 'd':
                keys.d.pressed = false;
                break
            case 'ArrowRight':
                keys.ArrowRight.pressed = false;
                break
        }
    }
})

// Button Event Listeners
const playAgainButton = document.getElementById("Play Again");
const creditsButton = document.getElementById("creditsButton");
let isCreditsDisplayed = false;

startGameButton.addEventListener("click", function() {
    document.getElementById("startGameButton").style.display = "none";
    startGame();
});

playAgainButton.addEventListener("click", function() {
    document.getElementById("Credits Screen").style.display = "none";
    isCreditsDisplayed = false;
    startGame();
});

creditsButton.addEventListener("click", function() {
    if(isCreditsDisplayed) {
        document.getElementById("Credits Screen").style.display = "none";
        isCreditsDisplayed = false;
    } else {
        document.getElementById("Credits Screen").style.display = "block";
        isCreditsDisplayed = true;
    }
});

document.addEventListener("visibilitychange", (event) => {
    if (document.visibilityState == "visible") {
      console.log("tab is active")
    } else {
      console.log("tab is inactive")
      isGameOver = true;
    }
});





































/* 

const choices = ["rock", "paper", "scissors"];
const playerDisplay = document.getElementById("playerDisplay");
const computerDisplay = document.getElementById("computerDisplay");
const resultDisplay = document.getElementById("resultDisplay");
const playerScoreDisplay = document.getElementById("playerScoreDisplay");
const computerScoreDisplay = document.getElementById("computerScoreDisplay");

let playerScore = 0;
let computerScore = 0;

function playGame(playerChoice){
    const computerChoice = choices[Math.floor(Math.random() * 3)];

    let result = "";
    if(playerChoice == computerChoice){
        result = "IT'S A TIE!";
    }
    else {
        // Use for health later
        switch(playerChoice){
            case "rock":
                result = (computerChoice === "scissors") ? "YOU WIN!" : "YOU LOSE";
                break;
            case "paper":
                result = (computerChoice === "rock") ? "YOU WIN!" : "YOU LOSE";
                break;
            case "scissors":
                result = (computerChoice === "paper") ? "YOU WIN!" : "YOU LOSE";
                break;
        }
    }

    playerDisplay.textContent = "PLAYER: " + playerChoice;
    computerDisplay.textContent = "COMPUTER: " + computerChoice;
    resultDisplay.textContent = result;

    //Use for health later
    resultDisplay.classList.remove("greenText","redText");
    switch(result){
        case "YOU WIN!":
            resultDisplay.classList.add("greenText");
            playerScore++;
            playerScoreDisplay.textContent = playerScore;
            break;
        case "YOU LOSE":
            resultDisplay.classList.add("redText");
            computerScore++;
            computerScoreDisplay.textContent = computerScore;
            break;
    }
}
*/
