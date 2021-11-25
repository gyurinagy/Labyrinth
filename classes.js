class Sides {
  constructor(arr) {
    this.top = arr[0];
    this.right = arr[1];
    this.bottom = arr[2];
    this.left = arr[3];
  }
  join() {
    return `${this.top}${this.right}${this.bottom}${this.left}`;
  }
  rotate() {
    const tmp = this.left;
    this.left = this.bottom;
    this.bottom = this.right;
    this.right = this.top;
    this.top = tmp;
  }
}
class Treasure {
  // constructor(id, r, c) {
  constructor(id) {
    this.id = id;
    this.row = -1;
    this.column = -1;
  }
  setCoords(coords) {
    this.row = coords[0];
    this.column = coords[1];
  }
}
class Player {
  constructor(id, r, c) {
    this.id = id;
    this.row = r;
    this.column = c;
  }
}

class Tile {
  constructor(r, c, sides, treasure = null, player = null, type = null) {
    this.row = r;
    this.column = c;
    this.sides = sides;
    this.treasure = treasure;
    this.player = player;
    this.type = type;
    this.available = false;
  }
  setPlayer(player) {
    this.player = player;
  }
  setTreasure(treasure) {
    this.treasure = treasure;
  }
  setType() {
    if (tileTypes[0].includes(this.sides.join())) {
      this.type = "PATH";
    } else if (tileTypes[1].includes(this.sides.join())) {
      this.type = "CORNER";
    } else if (tileTypes[2].includes(this.sides.join())) {
      this.type = "T";
    }
  }
  getSides() {
    return this.sides.join();
  }

  rotate() {
    this.sides.rotate();
  }
}

class Game {
  constructor() {
    this.board = null;
    this.nextTile = null;
    this.players = [];
    this.treasures = [];
    this.move = false;
    this.nextPlayer = 0;
    this.availableTiles = null;
    this.winner = false;
  }

  initBoard(arr) {
    this.nextTile = new Tile(-1, -1, new Sides(arr[1].split("")));
    this.board = [];
    for (let i = 0; i < 7; ++i) {
      let t = [];
      for (let j = 0; j < 7; ++j) {
        let tile = new Tile(i, j, new Sides(arr[0][i][j].split("")));
        tile.setType();
        t.push(tile);
      }
      this.board.push(t);
    }
  }

  initPlayers(num) {
    if (num < 5) {
      for (let i = 0; i < num; ++i) {
        let pl = new Player(i, cornerCoords[i + 1][0], cornerCoords[i + 1][1]);
        this.board[cornerCoords[i + 1][0]][cornerCoords[i + 1][1]].player = pl;
        this.players.push(pl);
      }
    }
  }
  initTreasures(num) {
    let treasures = shuffle([...Array(24).keys()]).map((x) => new Treasure(x));

    let arr = [];
    for (let i = 0; i < 7; ++i) {
      for (let j = 0; j < 7; ++j) {
        if ((i == 0 && (j == 0 || j == 6)) || (i == 6 && (j == 0 || j == 6)))
          continue;
        arr.push([i, j]);
      }
    }
    arr = shuffle(arr);

    for (let i = 0; i < this.players.length; ++i) {
      this.treasures.push(treasures.splice(0, num));
    }
    this.treasures.map((x) => x.map((y) => y.setCoords(arr.shift())));
    this.treasures.forEach((x) =>
      x.forEach((y) => {
        this.board[y.row][y.column].treasure = y;
      })
    );
  }
  getBoard() {
    return this.board;
  }
  getNextElem() {
    return this.nextTile;
  }
  rotateNextElem() {
    this.nextTile.rotate();
  }
  bfs(rowIndex, colIndex) {
    this.availableTiles = [];
    this.board[rowIndex][colIndex].available = true;
    let queue = [this.board[rowIndex][colIndex]];
    while (queue.length) {
      let current = queue[0];
      let cri = current.row;
      let cci = current.column;

      if (cri - 1 >= 0) {
        let tn = this.board[cri - 1][cci];
        if (
          current.sides.top == 1 &&
          tn.sides.bottom == 1 &&
          !this.availableTiles.includes(tn)
        ) {
          tn.available = true;
          queue.push(tn);
        }
      }

      if (cci + 1 < 7) {
        let rn = this.board[cri][cci + 1];
        if (
          current.sides.right == 1 &&
          rn.sides.left == 1 &&
          !this.availableTiles.includes(rn)
        ) {
          rn.available = true;
          queue.push(rn);
        }
      }

      if (cri + 1 < 7) {
        let bn = this.board[cri + 1][cci];
        if (
          current.sides.bottom == 1 &&
          bn.sides.top == 1 &&
          !this.availableTiles.includes(bn)
        ) {
          bn.available = true;
          queue.push(bn);
        }
      }

      if (cci - 1 >= 0) {
        let ln = this.board[cri][cci - 1];
        if (
          current.sides.left == 1 &&
          ln.sides.right == 1 &&
          !this.availableTiles.includes(ln)
        ) {
          ln.available = true;
          queue.push(ln);
        }
      }

      this.availableTiles.push(queue.shift());
    }
    return this.availableTiles;
  }

  moveTiles(side, num) {
    if (!this.move) {
      let tmpElem = null;
      let tmpArr = [];
      switch (side) {
        case 1:
          for (let elem of this.board) {
            tmpArr.push(elem[num]);
          }
          tmpElem = this.nextTile;
          this.nextTile = tmpArr.pop();

          tmpArr.unshift(tmpElem);
          for (let i = 0; i < tmpArr.length; i++) {
            this.board[i][num] = tmpArr[i];
          }
          if (this.nextTile.player) {
            let pl = this.nextTile.player;
            this.nextTile.player = null;
            this.board[0][num].player = pl;
          }

          break;
        case 2:
          tmpElem = this.nextTile;
          this.nextTile = this.board[num].shift();
          this.board[num].push(tmpElem);
          if (this.nextTile.player) {
            let pl = this.nextTile.player;
            this.nextTile.player = null;
            this.board[num][6].player = pl;
          }

          break;
        case 3:
          for (let elem of this.board) {
            tmpArr.push(elem[num]);
          }
          tmpElem = this.nextTile;
          this.nextTile = tmpArr.shift();

          tmpArr.push(tmpElem);
          for (let i = 0; i < tmpArr.length; i++) {
            this.board[i][num] = tmpArr[i];
          }
          if (this.nextTile.player) {
            let pl = this.nextTile.player;
            this.nextTile.player = null;
            this.board[6][num].player = pl;
          }

          break;
        case 4:
          tmpElem = this.nextTile;
          this.nextTile = this.board[num].pop();
          this.board[num].unshift(tmpElem);
          if (this.nextTile.player) {
            let pl = this.nextTile.player;
            this.nextTile.player = null;
            this.board[num][0].player = pl;
          }

          break;
      }

      // TILE metadata change
      for (let i = 0; i < 7; ++i) {
        for (let j = 0; j < 7; ++j) {
          this.board[i][j].row = i;
          this.board[i][j].column = j;

          if (this.board[i][j].player) {
            this.players[this.board[i][j].player.id].row = i;
            this.players[this.board[i][j].player.id].column = j;
          }
        }
      }

      this.move = true;

      this.bfs(
        this.players[this.nextPlayer].row,
        this.players[this.nextPlayer].column
      );
    }
  }
  movePlayer(r, c) {
    if (
      (this.move && !this.board[r][c].player) ||
      (this.move &&
        this.board[r][c].player &&
        this.board[r][c].player.id == this.nextPlayer)
    ) {
      this.board[this.players[this.nextPlayer].row][
        this.players[this.nextPlayer].column
      ].player = null;

      let pl = new Player(this.nextPlayer, r, c);
      this.board[r][c].player = pl;
      this.players[this.nextPlayer] = pl;

      
      if (this.treasures[this.nextPlayer].length > 0) {
        if (
          this.board[r][c].treasure &&
          this.board[r][c].treasure.id == this.treasures[this.nextPlayer][0].id
        ) {
          console.log("egy megvan");
          this.board[r][c].treasure = null;
          this.treasures[this.nextPlayer].shift();
        }
      } else {
        
        if (
          r == cornerCoords[this.nextPlayer + 1][0] &&
          c == cornerCoords[this.nextPlayer + 1][1]
        ) {
          this.winner = true;
        }
      }

      this.nextPlayer++;
      if (this.nextPlayer > this.players.length - 1) {
        this.nextPlayer = 0;
      }
      this.setZeroavailables();
      this.move = false;
    }
  }
  getTileByCoord(row, col) {
    return this.board[row][col];
  }
  setZeroavailables() {
    for (let row of this.board) {
      for (let elem of row) {
        elem.available = false;
      }
    }
  }
}
