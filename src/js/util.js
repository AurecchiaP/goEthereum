// create an empty array for the board 19x19
let board = [];
let turns = 0;

for (let i = 0; i < 19*19; i++) {
    board[i] = 0;
}

// get the div defined in index.html
let boardDiv = $('#board');

// create 361 buttons and add them to the div
for (let i = 0; i < 19; i++) {
    for (let j = 0; j < 19; j++) {
        let button = $('<button></button>');
        button.attr("id", i*19 + j);
        button.on('click', this, function() {
            console.log(this.id);
            turns++;
            board[i*19 + j] = turns%2;
        });
    boardDiv.append( button );
}
boardDiv.append( "<br>" );
}

let boardDiv2 = $('#board2');
var stone = $('#stone');

let x,y;
boardDiv2.on('mousemove', this, function() {
    // relative position of the board
    let offset = $(this).offset();
    // find the cursor position relative to the board
    x = event.pageX - offset.left;
    y = event.pageY - offset.top;
    // width (and height) of the board
    let w = this.clientWidth;
    let cellWidth = w/19;
    let cellX = Math.floor(19*x/w);
    let cellY = Math.floor(19*y/w);

    if(cellX < 19 && cellY < 19) {
        stone.css({
            display: 'block',
            top: cellY * cellWidth + 'px',
            left: cellX * cellWidth + 'px'
        })
    }
});
