const canvas = document.querySelector('canvas');
const button_cheats = document.querySelector('#assisted');
const button_new_game = document.querySelector('#new_game');
const button_difficulty = document.querySelector('#difficulty');

var milisec = 0;
var sec = 0;
var minute = 0;
var timer;
var ele = document.getElementById('timer');

const ctx =  canvas.getContext('2d');
const Xsize = 10;
const Ysize = 10;
const BlockSize = 20;
const initalX = innerWidth/2-120;
const initalY = 10;
var	numberOfBombs = 10;

var closestIndex = new Array(2); //closestIndex[0] = x, [1] = y

canvas.width = innerWidth;
canvas.height = 270;

class GameState{
	constructor(numberOfBombs){
		this.start = false;
		this.over = false;
		this.numberOfBombs = numberOfBombs;
		this.win = false;

		this.cheats = false;
	}
}

class Block {
	constructor(x,y,obj,number){
		this.x = x;
		this.y = y;
		
		this.obj = obj; 
		// 0 = empty 
		// 1 = bomb
		// 2 = numbered 

		this.number = number;
		//0 = do not display the number
		this.checked = false;

		this.percentageOfBomb = -1;

		this.noBombs = -1;
	}

	draw(color){
		ctx.beginPath();
		ctx.rect(this.x,this.y,BlockSize,BlockSize);
		ctx.strokeRect(this.x, this.y, BlockSize, BlockSize);
		ctx.fillStyle = color;
		ctx.fill();
	}
	drawNumbers(color){
		if (this.number != 0){
			ctx.fillStyle = color;
			ctx.font = '12px serif';
			ctx.fillText(this.number.toString(10),this.x+BlockSize/3,this.y+BlockSize/1.5);
		}
	}
}

//Creating GameBoard:
var gameBoard = new Array(Xsize);

//Creating GameState
game = new GameState(numberOfBombs);

function findClosestBlock(){
	var clickedX = event.clientX;
	var clickedY = event.clientY;
	if ((clickedX < gameBoard[0][0].x) || (clickedX > gameBoard[0][Ysize-1].x+BlockSize)){
		return;
	}
	if ((clickedY < gameBoard[0][0].y) || (clickedY > gameBoard[Xsize-1][0].y+BlockSize+4)){
		return;
	}
	var smallestdx = Math.abs(clickedX-gameBoard[0][0].x+BlockSize/2);
	var smallestdy = Math.abs(clickedX-gameBoard[0][0].y+BlockSize/2);
	closestIndex[0] = 0;
	closestIndex[1] = 0;

	for (var indexX = 0; indexX < Xsize;indexX++){
		var newdx = Math.abs(clickedX-(gameBoard[0][indexX].x+BlockSize/2));
		if (newdx < smallestdx){
			closestIndex[0] = indexX;
			smallestdx = newdx;
		}
	}
	for(var indexY = 0; indexY < Ysize;indexY++){
		var newdy = Math.abs(clickedY-(gameBoard[indexY][0].y+BlockSize/2));
		if (newdy < smallestdy){
			closestIndex[1] = indexY;
			smallestdy = newdy;
		}
	}
}

for (var x = 0; x < Xsize;x++){
	gameBoard[x] = new Array(Ysize);
	for(var y = 0; y < Ysize;y++){
		gameBoard[x][y] = new Block(y*(BlockSize+4)+initalX,x*(BlockSize+4)+initalY,0,0);
		gameBoard[x][y].draw('black');
	}
}

function getRandomInt(max) {
	returnVal = Math.floor(Math.random() * max);
  	return returnVal
}

function checkNumbers(){
	for (var x = 0; x < Xsize;x++){
		for(var y = 0; y < Ysize;y++){
			var count = 0;
			if(gameBoard[x][y].obj != 1){
				for (var tempX = -1; tempX<=1;tempX++){
					for(var tempY = -1; tempY<=1;tempY++){
						if (tempY != 0 || tempX != 0){
							if (x+tempX >= 0 && y+tempY >= 0 && x+tempX < Xsize && y+tempY < Ysize){
								if (gameBoard[x+tempX][y+tempY].obj == 1){
									count++;
								}
							}
						}
					}
				}
			}
			if (count != 0){
				gameBoard[x][y].obj = 2;
				gameBoard[x][y].number = count;
			}
		}
	}
}

function clearChecked() {
	for (var x = 0; x < Xsize;x++){
		for(var y = 0; y < Ysize;y++){
			gameBoard[x][y].checked = false;
			gameBoard[x][y].percentageOfBomb = -1;
			gameBoard[x][y].noBombs = -1;
		}
	}
}

function checkNeighbours(xloc,yloc){
	if (gameBoard[xloc][yloc].checked == false){
		gameBoard[xloc][yloc].checked = true;
		for (var tempX = -1; tempX<=1;tempX++){
			for(var tempY = -1; tempY<=1;tempY++){
				if (tempY != 0 || tempX != 0){
					if (xloc+tempX >= 0 && yloc+tempY >= 0 && xloc+tempX < Xsize && yloc+tempY < Ysize){
						if (gameBoard[xloc+tempX][yloc+tempY].obj == 0 && gameBoard[xloc+tempX][yloc+tempY].checked == false){
							checkNeighbours(xloc+tempX,yloc+tempY);
						}
						if (gameBoard[xloc+tempX][yloc+tempY].obj == 2 && gameBoard[xloc+tempX][yloc+tempY].checked == false){
							gameBoard[xloc+tempX][yloc+tempY].checked = true;
						}
					}
				}
			}
		}
	}
	return;
}

function generateIndexedArray(arrSize) {
	var myArray = new Array(arrSize);
	for(var i = 0; i < myArray.length;i++){
		myArray[i] = i;
	}
	return myArray
}

function randomFromArray(myArray) {
	var index = getRandomInt(myArray.length);
	return index;
}

function showBoard(){
	for (var x = 0; x < Xsize;x++){
		for(var y = 0; y < Ysize;y++){
			if(gameBoard[x][y].obj == 0){
				gameBoard[x][y].draw('grey');
			}
			if(gameBoard[x][y].obj == 1){
				gameBoard[x][y].draw('red');
			}
			if(gameBoard[x][y].obj == 2){
				gameBoard[x][y].draw('grey');
				gameBoard[x][y].drawNumbers('white');
			}
		}
	}
}

function checkGameState(){
	if(gameBoard[closestIndex[1]][closestIndex[0]].obj == 1){
		gameBoard[closestIndex[1]][closestIndex[0]].draw('red');
		showBoard();
		game.over = true;
		return;
	}
	game.win = true;
	for (var x = 0; x < Xsize;x++){
		for(var y = 0; y < Ysize;y++){
			if(!gameBoard[x][y].checked && gameBoard[x][y].obj != 1){
				game.win = false;
				return;
			}
		}
	}
	return;
}

function DrawEndScreen(){
	if (game.win || game.over){
		clearTimeout(timer);
		ctx.fillStyle = 'white';
		ctx.fillRect(gameBoard[Math.floor(Xsize/2)][Math.floor(Ysize/2)].x-70,gameBoard[Math.floor(Xsize/2)][Math.floor(Ysize/2)].y-23,130,50);
		ctx.fillStyle = 'Green';
		ctx.font = '24px serif';
	}
	if (game.win){
		if (sec < 10 && minute < 10){
			ele.innerHTML = '0'+minute + ':0'+sec + ':'+ milisec;
		}
		else if (sec >= 10 && minute < 10){
			ele.innerHTML = '0'+minute + ':'+sec +':'+ milisec;
		}
		else if (sec < 10 && minute >= 10){
			ele.innerHTML = minute + ':0'+sec +':'+ milisec;
		}
		else{
			ele.innerHTML = minute +':' + sec +':'+ milisec;
		}
		ctx.fillText("You Win",gameBoard[Math.floor(Xsize/2)][Math.floor(Ysize/2)].x-50,gameBoard[Math.floor(Xsize/2)][Math.floor(Ysize/2)].y+10);
		return;
	}
	if (game.over){
		ctx.fillText("You Lost",gameBoard[Math.floor(Xsize/2)][Math.floor(Ysize/2)].x-50,gameBoard[Math.floor(Xsize/2)][Math.floor(Ysize/2)].y+10);
		return;
	}
}

function gameSolver(){
	var returnIndex = new Array(2);
	for (var x = 0; x < Xsize;x++){
		for(var y = 0; y < Ysize;y++){
			var unknown = 0;
			if (gameBoard[x][y].obj == 2 && gameBoard[x][y].checked == true){
				for (var tempX = -1; tempX<=1;tempX++){
					for(var tempY = -1; tempY<=1;tempY++){
						if (tempY != 0 || tempX != 0){
							if (x+tempX >= 0 && y+tempY >= 0 && x+tempX < Xsize && y+tempY < Ysize){
								if(gameBoard[x+tempX][y+tempY].checked == false){
									unknown++;
								}
							}
						}
					}
				}
				unknown = unknown - gameBoard[x][y].number;
				percentageOfBomb = unknown;
				for (var tempX = -1; tempX<=1;tempX++){
					for(var tempY = -1; tempY<=1;tempY++){
						if (tempY != 0 || tempX != 0){
							if (x+tempX >= 0 && y+tempY >= 0 && x+tempX < Xsize && y+tempY < Ysize){
								if(gameBoard[x+tempX][y+tempY].checked == false){
									if (gameBoard[x+tempX][y+tempY].percentageOfBomb > percentageOfBomb || gameBoard[x+tempX][y+tempY].percentageOfBomb == -1){
										gameBoard[x+tempX][y+tempY].percentageOfBomb = percentageOfBomb;
									}
									
								}
							}
						}
					}
				}
			}
		}
	}
	for (var x = 0; x < Xsize;x++){
		for(var y = 0; y < Ysize;y++){
			var comfirmedBombs = 0;
			for (var tempX = -1; tempX<=1;tempX++){
				for(var tempY = -1; tempY<=1;tempY++){
					if (x+tempX >= 0 && y+tempY >= 0 && x+tempX < Xsize && y+tempY < Ysize){
						if(gameBoard[x+tempX][y+tempY].checked == false && gameBoard[x+tempX][y+tempY].percentageOfBomb == 0){
							comfirmedBombs++;
						}
					}
				}
			}
			if (gameBoard[x][y].number - comfirmedBombs == 0 && gameBoard[x][y].number!= 0 && gameBoard[x][y].checked == true){
				for (var tempX = -1; tempX<=1;tempX++){
					for(var tempY = -1; tempY<=1;tempY++){
						if (x+tempX >= 0 && y+tempY >= 0 && x+tempX < Xsize && y+tempY < Ysize){
							if(gameBoard[x+tempX][y+tempY].checked == false){
								gameBoard[x+tempX][y+tempY].noBombs = 1;
								if (gameBoard[x+tempX][y+tempY].percentageOfBomb != 0){
									returnIndex[0] = x+tempX;
									returnIndex[1] = y+tempY;
								}
							}
						}
					}
				}
			}
		}
	}
	if (game.cheats){
		for (var x = 0; x < Xsize;x++){
			for(var y = 0; y < Ysize;y++){
				if(gameBoard[x][y].checked == false){
					gameBoard[x][y].draw('black');
					ctx.fillStyle = 'red';
					ctx.font = '12px serif';
					if (gameBoard[x][y].percentageOfBomb == 0){
						ctx.fillText('B',gameBoard[x][y].x+BlockSize/3,gameBoard[x][y].y+BlockSize/1.5);
					}
					else if (gameBoard[x][y].noBombs == 1){
						ctx.fillText('C',gameBoard[x][y].x+BlockSize/3,gameBoard[x][y].y+BlockSize/1.5);
					}
				}
			}	
		}
	}
	return returnIndex;
}

function generateBombs() {
	var bombs = 0;
	var myArray = generateIndexedArray(Xsize*Ysize);
	while (bombs < numberOfBombs){
		let indexTotal = randomFromArray(myArray);
		let xloc = Math.floor(myArray[indexTotal]/Xsize);
		let yloc = myArray[indexTotal]%Ysize;
		myArray.splice(indexTotal,1);
		if (gameBoard[xloc][yloc].obj == 0 && xloc != closestIndex[1] || yloc != closestIndex[0]){
			gameBoard[xloc][yloc].obj = 1;
			bombs++;
			gameBoard[xloc][yloc].draw('black');
		}
	}
}

function redrawBoard(){
	for (var x = 0; x < Xsize;x++){
		for (var y = 0; y < Ysize;y++){

			if (gameBoard[x][y].checked == false){
				gameBoard[x][y].draw('black');
			}
			else{
				gameBoard[x][y].draw('grey');
				gameBoard[x][y].drawNumbers('white')
			}
		}
	}
}

function numberOfUnknowns(){
	var count = 0;
	for (var x = 0; x < Xsize;x++){
		for(var y = 0; y < Ysize;y++){
			if (gameBoard[x][y].checked == false){
				count++;
			}
		}
	}
	return count;
}

function animate(){
	requestAnimationFrame(animate);
	if(game.over == false){
		if (closestIndex[0] !== undefined && closestIndex[1] !== undefined){
			if (!game.start){
				game.start = true;
				generateBoard();
				startTimer();
			}
			checkNeighbours(closestIndex[1],closestIndex[0]);
			redrawBoard();
			if (game.cheats == true){
				gameSolver();
			}
			checkGameState();
			DrawEndScreen();
		}
	}
}

function generateBoard(){
	var validBoard = false;
	var org = game.cheats;
	game.cheats = false;
	while (!validBoard){
		gameBoard = new Array(Xsize);
		for (var x = 0; x < Xsize;x++){
			gameBoard[x] = new Array(Ysize);
			for(var y = 0; y < Ysize;y++){
				gameBoard[x][y] = new Block(y*(BlockSize+4)+initalX,x*(BlockSize+4)+initalY,0,0);
			}
		}
		generateBombs();
		checkNumbers();
		checkNeighbours(closestIndex[1],closestIndex[0]);
		while (1){
			var newMove = new Array(2);
			newMove = gameSolver();
			var count = numberOfUnknowns();
			if (newMove[1] === undefined || newMove[0] === undefined){
				if (count == numberOfBombs){
					console.log(count);
					console.log(numberOfBombs);
					validBoard = true;
				}
				break;
			}
			checkNeighbours(newMove[0],newMove[1]);
		}
		if (!validBoard){
			console.log("bad board.");
		}
	}
	clearChecked();
	game.cheats = org;
}

function cheatsEnable(){
	if (game.over == false && game.win == false){
		if(button_cheats.value === 'Enable Assistence'){
			game.cheats = true;
			button_cheats.value = 'Disable Assistence';
			redrawBoard();

		}
		else if(button_cheats.value === 'Disable Assistence'){
			game.cheats = false;
			button_cheats.value = 'Enable Assistence';
			redrawBoard();
		}
	}
}

function newGame() {
	gameBoard = new Array(Xsize);
	for (var x = 0; x < Xsize;x++){
		gameBoard[x] = new Array(Ysize);
		for(var y = 0; y < Ysize;y++){
			gameBoard[x][y] = new Block(y*(BlockSize+4)+initalX,x*(BlockSize+4)+initalY,0,0);
			gameBoard[x][y].draw('black');
		}
	}
	game.over = false;
	game.win = false;
	game.start = false;
	closestIndex[0] = undefined;
	closestIndex[1] = undefined;
	ctx.clearRect(0,0,canvas.width,canvas.height);
	redrawBoard();
	clearTimer();
}

function startTimer(){
	milisec = 0;
	sec = 0;
	minute = 0;
	var startTime = new Date();
	var endTime;
	timer = setInterval(()=>{
		endTime = new Date();
		var timeDiff = endTime - startTime;
		sec = Math.floor(timeDiff/1000);
		minute = Math.floor(sec/60);
		sec = Math.floor(sec%60);
		milisec = timeDiff - sec*1000 - minute*60*1000;
		if (sec < 10 && minute < 10){
			ele.innerHTML = '0'+minute + ':0'+sec;
		}
		else if (sec >= 10 && minute < 10){
			ele.innerHTML = '0'+minute + ':'+sec;
		}
		else if (sec < 10 && minute >= 10){
			ele.innerHTML = minute + ':0'+sec;
		}
		else{
			ele.innerHTML = minute +':' + sec;
		}
	},10)
}

function clearTimer() {
	clearTimeout(timer);
	milisec = 0;
	sec = 0;
	minute = 0;
	ele.innerHTML = '00:00';
}

function difficulty_change(){
	if(button_difficulty.value === 'Easy (10)'){
		numberOfBombs = 20;
		button_difficulty.value = "Medium (20)";
	}
	else if(button_difficulty.value === 'Medium (20)'){
		numberOfBombs = 30;
		button_difficulty.value = "Hard (30)";
	}
	else if(button_difficulty.value === 'Hard (30)'){
		numberOfBombs = 10;
		button_difficulty.value = "Easy (10)";
	}
}

button_cheats.addEventListener('click',cheatsEnable);

button_new_game.addEventListener('click',newGame);

button_difficulty.addEventListener('click',difficulty_change);

window.addEventListener('click',findClosestBlock);

animate();



