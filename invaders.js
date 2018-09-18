const HEIGHT = 480;
const WIDTH = 540;

//putting canvas on the screen
var screen = document.createElement('canvas');
var screenCtx = screen.getContext('2d');
screen.height = HEIGHT;
screen.width = WIDTH;
document.body.appendChild(screen);

//Creating a back buffer
var backBuffer = document.createElement('canvas');
var backBufferCtx = screen.getContext('2d');
backBuffer.height = HEIGHT;
backBuffer.width = WIDTH;

var ui = document.getElementById("ui");

//public game state variables
var start = null;
var score = 0;
var lives = 3;
var gameover = false;

//list of bullets & enemies
var bullets= [];
var enemybullets= [];
var enemies= [];

//var bulletExists = false;
//var bulletY = 0;
//var bulletX = 0;
//spaceship
var x = WIDTH / 2 - 20;
var y = HEIGHT - 50;


var currentInput = {
  space: false,
  left: false,
  right: false,
  r: false
}

var priorInput = {
  space: false,
  left: false,
  right: false,
  r: false
}

/** @function handleKeydown
  * Event handler for keydown events
  * @param {KeyEvent} event - the keydown event
  */
function handleKeydown(event) {
  switch(event.key) {
    case ' ':
    case 'Space':
      currentInput.space = true;
      break;
    case 'ArrowLeft':
    case 'a':
      currentInput.left = true;
      break;
    case 'ArrowRight':
    case 'd':
      currentInput.right = true;
      break;
    case 'r':
      currentInput.r = true;
      break;
  }
}

//attach keydown evend to the window
window.addEventListener('keydown', handleKeydown);


/** @function handleKeyup
  * Event handler for keyup events
  * @param {KeyEvent} event - the keyup event
  */
function handleKeyup(event) {
  switch(event.key) {
    case ' ':
      case 'Space':
      currentInput.space = false;
      break;
    case 'ArrowLeft':
    case 'a':
      currentInput.left = false;
      break;
    case 'ArrowRight':
    case 'd':
      currentInput.right = false;
      break;
    case 'r':
      currentInput.r = false;
      break;
  }
}

// Attach keyup event handler to the window
window.addEventListener('keyup', handleKeyup);

/** @function loop
  * The main game loop
  * @param {DomHighResTimestamp} timestamp - the current system time,
  * in milliseconds, expressed as a double.
  */
function loop(timestamp) {
  if(!gameover){
    if(!start) start = timestamp;
    var elapsedTime = timestamp - start;
    start = timestamp;
    pollInput();
    update(elapsedTime, backBufferCtx);
    render(backBufferCtx,elapsedTime);
    screenCtx.drawImage(backBuffer,0,0);
    window.requestAnimationFrame(loop);
  }else{
    //if game is over then display gave over message
    ui.innerHTML = "Invaders ---- GAME OVER! (Press R to restart) --- Score: " + score;
    window.requestAnimationFrame(loop);
    //if player wants to play again, reset all game state variables
    if(currentInput.r){
      score = 0;
      lives = 3;
      bullets = [];
      enemies = [];
      enemybullets = [];
      x = WIDTH / 2 - 20;
      y = HEIGHT - 50;
      gameover = false;
    }
  }
}

/** @function pollInput
  * Copies the current input into the previous input
  */
function pollInput() {
  priorInput = JSON.parse(JSON.stringify(currentInput));
}


/** @function update
  * Updates the game's state
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function update(elapsedTime, ctx) {
  //updates the ui
  ui.innerHTML = "Invaders ---- Lives: " + lives + " ---- Score: " + score;
  // shoot when spacebar is pressed
  if(priorInput.space) {
    // TODO: Fire bullet
    if(bullets.length < 1){
      var bullet = new Bullet(x, y, elapsedTime, ctx);
      bullets.push(bullet);
    }

  }
  //move left when left arrow or
  if(currentInput.left) {
    x -= 0.3 * elapsedTime;
    if(x <= 15){
      x = 15;
    }
  }
  if(currentInput.right) {
    x += 0.3 * elapsedTime;
    if(x >= WIDTH - 50){
      x = WIDTH - 50;
    }
  }
}

//FriendlyBullets
function Bullet(x, y, elapsedTime, ctx){
  this.x = x;
  this.y = y;

  this.update = function(){
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(19 + this.x, this.y - 5,2, 9);
    this.y -= 1 * elapsedTime;

    if(this.y < 10){
      bullets.splice(bullets.indexOf(this), 1 );
    }

    enemies.forEach(function(element){
      if(Math.pow(((element.x + 20) - (this.x + 19)),2) + Math.pow(((element.y + 20) - (this.y - 5)),2) <= 400){
        bullets.splice(bullets.indexOf(this), 1 );
        enemies.splice(enemies.indexOf(element), 1 );
        score+= 20;
      }
    }, this)
  }
}

function EnemyBullet(ex, ey, elapsedTime,ctx){
  this.x = ex;
  this.y = ey;

  this.update = function(){
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(19 + this.x,25 + this.y,2, 9);
    this.y += .1 * elapsedTime;
    if(this.y > HEIGHT){
      enemybullets.splice(enemybullets.indexOf(this), 1 );
    }

    if(Math.pow(((x + 20) - (this.x + 19)),2) + Math.pow(((y + 20) - (this.y + 5)),2) <= 484){
      enemybullets.splice(enemybullets.indexOf(this), 1 );
      lives-=1;
      if(lives === 0){
        gameover = true;
      }
    }

  }
}

function Enemy(x, y, elapsedTime, ctx){
  this.x = x;
  this.y = y;
  this.velocity = (Math.random() - .5) * 1/2;

  this.update = function(){
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(10+this.x,10+this.y,20,20);
    ctx.fillRect(19+this.x,15+this.y,2,20);
    this.y += .05 * elapsedTime;
    this.x += this.velocity * elapsedTime;

    //if enemy hits left side, reverse velocity
    if(this.x < 0 ){
      this.x = 0;
      this.velocity *= -1;
    }
    //if enemy hits right side, reverse velocity
    if(this.x > WIDTH - 30){
      this.x = WIDTH - 30;
        this.velocity *= -1;
    }
    //if the enemy hits the bottom of the screen then lose a life, delete enemy
    if(this.y >= HEIGHT - 15){
      lives -=1;
      enemies.splice(enemies.indexOf(this), 1 );
      if(lives === 0){
          gameover = true;
      }
    }
    if((Math.random() * 1000) < 3){
      var ebullet = new EnemyBullet(this.x,this.y,elapsedTime, ctx)
      enemybullets.push(ebullet);
    }
  }
}

/** @function render
  * Renders the game into the canvas
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function render(ctx, elapsedTime) {
  //players space ship
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(10+x,10+y,20,20);
  ctx.fillRect(19+x,5+y,2,20);

  //update all bullet postions and check for collisions
  bullets.forEach(function (element){
    element.update();
  })

  //update all enemy ship positions
  enemies.forEach(function(element){
    element.update();
  })

  //update all enemy bullet positions and check for collisions
  enemybullets.forEach(function(element){
    element.update();
  })

  if((Math.random() * 1000) < 5){
    var enemy = new Enemy(Math.random() * (WIDTH - 20), -20, elapsedTime, ctx);
    enemies.push(enemy);
  }

}

// Start the game loop
window.requestAnimationFrame(loop);
