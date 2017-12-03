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
var board = new Board([], 0);

for (let i = 0; i < 19; i++) {
  for (let j = 0; j < 19; j++) {
    // board[i] = 0;
    if ((i * 19 + j) % 2 == 0) {
      board.data[i * 19 + j] = 0;
    } else {
      board.data[i * 19 + j] = 1;
    }
  }
}

// NOTE for this to work, the board and stones have to be visible, else the stones
// will stack as they have no size
// for (let i = 0; i < 19; i++) {
//   for (let j = 0; j < 19; j++) {
//     board.updateSize();
//     let stone;
//     if (board.data[i * 19 + j] == 0) {
//       stone = $('<div class="stone white as" id="stone' + (i * 19 + j) + '"></div>');
//     } else {
//       stone = $('<div class="stone black as" id="stone' + (i * 19 + j) + '"></div>');
//     }
//     stone.css({
//       display: 'block',
//       top: i * board.cellWidth + 'px',
//       left: j * board.cellWidth + 'px'
//     });
//     boardDiv.append(stone);
//   }
// }

// when the cursor hovers the board, show where the stone would be placed
boardDiv.on('mousemove', this, function() {

  let offset = $(this).offset();

  let x = event.pageX - offset.left;
  let y = event.pageY - offset.top;

  let cellX = Math.floor(19 * x / board.width);
  let cellY = Math.floor(19 * y / board.width);

  if (cellX < 19 && cellY < 19) {
    $('#hoverStone').css({
      display: 'block',
      top: cellY/19 * 100 + '%',
      left: cellX/19 * 100 + '%'
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
  // relative position of the board
  board.updateSize();
  let offset = $(this).offset();
  // find the cursor position relative to the board
  let x = event.pageX - offset.left;
  let y = event.pageY - offset.top;
  // width (and height) of the board

  let cellX = Math.floor(19 * x / board.width);
  let cellY = Math.floor(19 * y / board.width);

  if (cellX < 19 && cellY < 19) {
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
        top: cellY/19 * 100 + '%',
        left: cellX/19 * 100 + '%'
      });
      placedStone.x = cellX;
      placedStone.y = cellY;
      $('#moveButton').prop('disabled', false);
      console.log("placed stone: ", placedStone.x, placedStone.y);
    }
  }
});

$('#moveButton').on('click', this, function() {
  console.log('pressed');
});

// $( window ).resize(function() {
// boardDiv.empty();
// board.updateSize();
// });
