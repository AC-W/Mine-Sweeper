const canvas = document.querySelector('canvas');
const ctx =  canvas.getContext('2d');
const Xsize = 10;
const Ysize = 10;
const BlockSize = 20;
const initalX = 10;
const initalY = 10;
var	numberOfBombs = 20;

var closestIndex = new Array(2); //closestIndex[0] = x, [1] = y

canvas.width = 260;
canvas.height = 260;

class GameState{
	constructor(numberOfBombs){
		this.start = false;
		this.over = false;
		this.numberOfBombs = numberOfBombs;
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

//Creating GameBoard:
var gameBoard = new Array(Xsize)

for (var x = 0; x < Xsize;x++){
	gameBoard[x] = new Array(Ysize);
	for(var y = 0; y < Ysize;y++){
		gameBoard[x][y] = new Block(y*(BlockSize+4)+initalX,x*(BlockSize+4)+initalY,0,0);
		gameBoard[x][y].draw('black');
	}
}

//Creating GameState
game = new GameState(numberOfBombs);

function getRandomInt(max) {
  	return Math.floor(Math.random() * max);
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
		}
	}
}

function checkNeighbours(xloc,yloc){
	if (gameBoard[xloc][yloc].checked == false){
		gameBoard[xloc][yloc].draw('grey');
		gameBoard[xloc][yloc].drawNumbers('white')
		gameBoard[xloc][yloc].checked = true;
		for (var tempX = -1; tempX<=1;tempX++){
			for(var tempY = -1; tempY<=1;tempY++){
				if (tempY != 0 || tempX != 0){
					if (xloc+tempX >= 0 && yloc+tempY >= 0 && xloc+tempX < Xsize && yloc+tempY < Ysize){
						if (gameBoard[xloc+tempX][yloc+tempY].obj == 0 && gameBoard[xloc+tempX][yloc+tempY].checked == false){
							checkNeighbours(xloc+tempX,yloc+tempY);
						}
						if (gameBoard[xloc+tempX][yloc+tempY].obj == 2 && gameBoard[xloc+tempX][yloc+tempY].checked == false){
							gameBoard[xloc+tempX][yloc+tempY].draw('grey');
							gameBoard[xloc+tempX][yloc+tempY].drawNumbers('white')
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

function animate(){
	requestAnimationFrame(animate);
	if(game.over == false){
		if (closestIndex[0] !== undefined && closestIndex[1] !== undefined){
			if (!game.start){
				game.start = true;
				var bombs = 0;
				var myArray = generateIndexedArray(Xsize*Ysize);
				while (bombs < numberOfBombs){
					let indexTotal = randomFromArray(myArray);
					let xloc = Math.floor(myArray[indexTotal]/10);
					let yloc = myArray[indexTotal]%10;
					myArray.splice(indexTotal,1);
					if (gameBoard[xloc][yloc].obj == 0 && xloc != closestIndex[1] || yloc != closestIndex[0]){
						gameBoard[xloc][yloc].obj = 1;
						bombs++;
						gameBoard[xloc][yloc].draw('black');
					}
				}
				checkNumbers();
				for (var x = 0; x < Xsize;x++){
					for(var y = 0; y < Ysize;y++){
						// gameBoard[x][y].drawNumbers('white');
					}
				}
				
			}
			checkNeighbours(closestIndex[1],closestIndex[0]);
			if(gameBoard[closestIndex[1]][closestIndex[0]].obj == 1){
				gameBoard[closestIndex[1]][closestIndex[0]].draw('red');
				showBoard();
				game.over = true;
			}
			
		}
	}
}

window.addEventListener('click',findClosestBlock);

animate();



