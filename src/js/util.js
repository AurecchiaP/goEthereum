
// stone class
class Stone {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

// create an empty array for the board 19x19
let board = [];

for (let i = 0; i < 19*19; i++) {
    board[i] = 0;
}

var boardDiv = $('#board');

var placedStone = new Stone(0,0,'white');

// when the cursor hovers the board, show where the stone would be placed
boardDiv.on('mousemove', this, function() {
    // relative position of the board
    let offset = $(this).offset();
    // find the cursor position relative to the board
    let x = event.pageX - offset.left;
    let y = event.pageY - offset.top;
    // width (and height) of the board
    let w = this.clientWidth;
    let cellWidth = w/19;
    let cellX = Math.floor(19*x/w);
    let cellY = Math.floor(19*y/w);

    if(cellX < 19 && cellY < 19) {
        $('#hoverStone').css({
            display: 'block',
            top: cellY * cellWidth + 'px',
            left: cellX * cellWidth + 'px'
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
    let offset = $(this).offset();
    // find the cursor position relative to the board
    let x = event.pageX - offset.left;
    let y = event.pageY - offset.top;
    // width (and height) of the board
    let w = this.clientWidth;
    let cellWidth = w/19;
    let cellX = Math.floor(19*x/w);
    let cellY = Math.floor(19*y/w);

    if(cellX < 19 && cellY < 19) {
        $('#placedStone').css({
            display: 'block',
            top: cellY * cellWidth + 'px',
            left: cellX * cellWidth + 'px'
        });
        placedStone.x = cellX;
        placedStone.y = cellY;
        console.log("placed stone: ", placedStone.x, placedStone.y);
    }
});
