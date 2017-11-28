// create an empty array for the board 19x19
let board = [];
var turns = 0;

for (var i = 0; i < 19*19; i++) {
    board[i] = 0;
}

// get the div defined in index.html
let boardDiv = $('#board');

// create 361 buttons and add them to the div
for (var i = 0; i < 19; i++) {
    for (var j = 0; j < 19; j++) {
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
