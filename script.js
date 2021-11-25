

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function createBoard(board) {
  let lastElem = "";
  let pieces = [13, 15, 6];
  let tiles = [];
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < pieces[i]; ++j) {
      //
      let newtype =
        tileTypes[i][Math.floor(Math.random() * tileTypes[i].length)];
      tiles.push(newtype);
    }
  }
  tiles = shuffle(tiles);

  let counter = 0;
  let defTiles = [...board];

  for (let i = 0; i < board.length; i++) {
    defTiles[i] = [...board[i]];
  }
  for (let i = 0; i < defTiles.length; i++) {
    for (let j = 0; j < defTiles[i].length; j++) {
      if (defTiles[i][j] === "0000") {
        defTiles[i][j] = tiles[counter];
        counter++;
      }
    }
  }
  lastElem = tiles[tiles.length - 1];

  return new Array(defTiles, lastElem);
}


// JÁTÉKOS ÉS KINCSKÁRTYA SZÁM
const playerNumber = document.querySelector("#playerNumber");
const treasureNumber = document.querySelector("#treasureNumber");
playerNumber.addEventListener("input", () => {
  treasureNumber.setAttribute("max", 24 / playerNumber.value);
  treasureNumber.value = 2;
});

////////////////////////////////
const gameDiv = document.querySelector("#game");
const statDiv = document.querySelector("#status");
// const buttonsDiv = document.querySelector("#buttons"); // majd törlés
////////////////////////////////

// Buttons
const menuPage = document.querySelector("#menu");
const gamePage = document.querySelector("#gamePage");
const helpPage = document.querySelector("#help");
const startButton = document.querySelector("#startBtn");

const close = document.querySelector(".close");

// Pages
const helpButton = document.querySelector("#helpBtn");
const escapeButton = document.querySelector("#escBtn");
const testButton = document.querySelector("#test");
const pages = document.querySelectorAll(".pages");

// ********************   HELP   **********************************
helpButton.addEventListener("click", () => {
  // menuPage.classList.remove('active')
  helpPage.classList.toggle("active");
});
close.onclick = function () {
  helpPage.classList.remove("active");
};
window.onclick = function (event) {
  if (event.target == menuPage) {
    helpPage.classList.remove("active");
  }
};
escapeButton.addEventListener("click", () => {
  menuPage.classList.add("active");
  gamePage.classList.toggle("active");
  treasureNumber.value = 2;
  playerNumber.value = 2;
});
// ****************************************************************

startButton.addEventListener("click", startGame);

function startGame(){
  helpPage.classList.remove("active");
  menuPage.classList.remove("active");
  gamePage.classList.toggle("active");

  gameDiv.innerHTML = ''
  statDiv.innerHTML = ''

  const theGame = new Game();
  theGame.initBoard(createBoard(defaultBoard));
  theGame.initPlayers(playerNumber.value);
  theGame.initTreasures(treasureNumber.value);
  
  let nextTile = document.createElement("div");

  nextTile.addEventListener("click", () => {
    theGame.rotateNextElem();
    draw();
  });


  function draw() {
    gameDiv.innerHTML = "";

    if(theGame.winner){
      let h1=document.createElement('h1');
      h1.innerText='NYERŐ'
      gameDiv.appendChild(h1);
      theGame.move
    }
    // CREATING THE BOARD
    for(let i = 0;i<9;++i){
      let divRow = document.createElement("div");
      divRow.classList.add('row');
      for(let j = 0;j<9;++j){
        let divTile = document.createElement("div");

        divTile.classList.add("tile");
        
        divTile.dataset.row = i;
        divTile.dataset.column = j;
        if(i == 0 || i == 8 || j ==  0 || j == 8){
          if( (i+j)%2 == 0 && (i+j)%8 != 0){
          
            divTile.classList.add('arrow')
            divTile.addEventListener("click", () => {
              console.log(i,j);
              // theGame.moveTiles(i-1, j-1);
              if(i==0){
                theGame.moveTiles(1,j-1);
              }else if(i==8){
                theGame.moveTiles(3,j-1);
              }else if(j==0){
                theGame.moveTiles(4,i-1);

              }else if(j==8){
                theGame.moveTiles(2,i-1);
              }

              draw();
              
            });
            divTile.addEventListener('contextmenu', (e)=>{
              e.preventDefault();
              theGame.rotateNextElem();
              draw();
            });
            divTile.addEventListener('mouseover',()=>{
              divTile.style.backgroundImage = `url(${data[theGame.getNextElem().getSides()]
              }) `;
            });
            divTile.addEventListener('mouseout',()=>{
              divTile.style.backgroundImage = '';
            });
          }
          

        }else{
          // GAMEBOARD FIELD BACKGROUND 
          let bckgImg = ''
          if (theGame.board[i-1][j-1].player) {
            bckgImg += `url('img/p${theGame.board[i-1][j-1].player.id + 1
              }.png'),`;
            }
          if(theGame.board[i-1][j-1].treasure){
              bckgImg += `url(img/t${theGame.board[i-1][j-1].treasure.id + 1}.png),`;
          } 
          bckgImg += `url(${data[theGame.board[i-1][j-1].getSides()]})`;
          divTile.style.backgroundImage = bckgImg
          
          // AVAILABLE FIELDS
          if (theGame.board[i-1][j-1].available) {
            divTile.classList.add("available");
            divTile.style.backgroundColor =  'rgba(0, 255, 0, 0.3)';
            divTile.addEventListener("click", () => {        
              theGame.movePlayer(i-1  ,j-1);
              draw();
            });
          }
        }
     
        divRow.appendChild(divTile);
      }
      gameDiv.appendChild(divRow);
    }

    // NEXT TILE DRAW
    nextTile.classList.add("tile");
    bckgImg = '';
    
    if(theGame.nextTile.treasure){
      bckgImg += `url(img/t${theGame.nextTile.treasure.id+1}.png),`;
    } 
          
    bckgImg += `url(${data[theGame.getNextElem().getSides()]}) `;
    nextTile.style.backgroundImage = bckgImg;
    
    statDiv.innerHTML = "<h2>Next field</h2>";
    statDiv.appendChild(nextTile);

    // STATUS BAR DRAW
    for (let i = 0; i < playerNumber.value; ++i) {
        let div = document.createElement("div");
        div.dataset.player = i + 1;
        div.classList.add("player");
        if (i == theGame.nextPlayer) div.classList.add("activePlayer");
        div.innerHTML = `<h2>Player${i + 1}</h2>`;
        let treasureTile = document.createElement("div");
        treasureTile.classList.add("tile");
        
        if(theGame.treasures[i].length>0){

          treasureTile.style.backgroundImage = `url(img/t${theGame.treasures[i][0].id+1}.png)`;
        }

        div.appendChild(treasureTile);
        statDiv.appendChild(div);
      }
  }

  draw();
}