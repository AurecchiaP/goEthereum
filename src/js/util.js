// stone class
class Stone {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }
}

class Board {
  constructor(data) {
    this.data = data;
  }

  updateSize() {
    this.width = boardDiv[0].clientWidth;
    this.cellWidth = this.width / 19;
  }
}

var boardDiv = $('#board');

var placedStone = new Stone(-1, -1, 'white');

// create an empty array for the board 19x19
//TODO maybe make this into a session object? ugly
var board = new Board([], 0);
var gamesList = [];
var gamesData = [];
var selectedGameElement, selectedGameAddress;

// when the cursor hovers the board, show where the stone would be placed
boardDiv.on('mousemove', this, function() {
  // FIXME updatesize should be done only when we go on tab Game
  board.updateSize();

  let offset = $(this).offset();

  let x = event.pageX - offset.left;
  let y = event.pageY - offset.top;

  let cellX = Math.floor(19 * x / board.width);
  let cellY = Math.floor(19 * y / board.width);

  if (cellX < 19 && cellX >= 0 && cellY < 19 && cellY >= 0) {
    $('#hoverStone').css({
      display: 'block',
      top: cellY / 19 * 100 + '%',
      left: cellX / 19 * 100 + '%'
    });
  }
});

// when the cursor leaves the board, hide the stone
boardDiv.on('mouseleave', this, function() {
  $('#hoverStone').css({
    display: 'none'
  });
});

// when we click the board, put a stone on the selected intersection
boardDiv.on('click', this, function() {

  let offset = $(this).offset();
  // find the cursor position relative to the board
  let x = event.pageX - offset.left;
  let y = event.pageY - offset.top;
  // width (and height) of the board

  let cellX = Math.floor(19 * x / board.width);
  let cellY = Math.floor(19 * y / board.width);

  if (cellX < 19 && cellX >= 0 && cellY < 19 && cellY >= 0) {
    if (placedStone.x == cellX && placedStone.y == cellY) {
      $('#placedStone').css({
        display: 'none'
      });
      placedStone.x = -1;
      placedStone.y = -1;
      $('#moveButton').prop('disabled', true);
    } else {
      $('#placedStone').css({
        display: 'block',
        top: cellY / 19 * 100 + '%',
        left: cellX / 19 * 100 + '%'
      });
      placedStone.x = cellX;
      placedStone.y = cellY;
      $('#moveButton').prop('disabled', false);
      console.log("placed stone: ", placedStone.x, placedStone.y);
    }
  }
});
