App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    App.contracts.Games = [];
    $.getJSON('Go.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var GoArtifact = data;

      App.contracts.Go = TruffleContract(GoArtifact);

      // Set the provider for our contract
      App.contracts.Go.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#moveButton', App.handleMove);
    $(document).on('click', '#passButton', App.handlePass);
    $(document).on('click', '#newGameButton', App.handleNewGame);
  },

  loadGames: function() {

    var goInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      $('#loader').fadeToggle('fast');
      App.contracts.Go.deployed().then(function(instance) {
          goInstance = instance;

          // Execute adopt as a transaction by sending account
          return goInstance.getGames.call();
        })
        .then(function(games) {
          App.updateGamesList(games)
          $('#loader').fadeToggle('fast');
        })
        .catch(function(err) {
          console.log(err.message);
        });
    });
  },

  loadBoard: function() {
    boardDiv.find('.temporary-stone').remove()
    board.updateSize();

    for (let i = 0; i < 19; i++) {
      for (let j = 0; j < 19; j++) {
        let stone;
        if (board.data[i * 19 + j].c[0] == 1) {
          stone = $('<div class="stone black temporary-stone" id="stone' + (i * 19 + j) + '"></div>');
          stone.css({
            display: 'none',
            top: i / 19 * 100 + '%',
            left: j / 19 * 100 + '%'
          });
          boardDiv.append(stone);
          stone.fadeToggle('fast');
        } else if (board.data[i * 19 + j].c[0] == 2) {
          stone = $('<div class="stone white temporary-stone" id="stone' + (i * 19 + j) + '"></div>');
          stone.css({
            display: 'none',
            top: i / 19 * 100 + '%',
            left: j / 19 * 100 + '%'
          });
          boardDiv.append(stone);
          stone.fadeToggle('fast');
        }
      }
    }
    $('#loader').fadeToggle('fast');
    $('#invalidMove').hide();
    $("#noGameSelected").hide();
  },

  handleMove: function(event) {
    event.preventDefault();

    // get the current position of the stone
    var pos = placedStone.x + 19 * placedStone.y;

    if (board.data[pos]!= 0) {
      $("#invalidMove").show();
      $('.close').click(function() {
         $('#invalidMove').hide();
      })
      console.log("A stone has already been placed in this spot")
      return;
    }
    // when you click confirm, it should store the right number at that position

    if (!selectedGameAddress) {
      console.log("no selected game");
      $("#noGameSelected").show();
      $('.close').click(function() {
         $('#noGameSelected').hide();
      })
      return;
    }

    $('#loader').fadeToggle('fast');


    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      let index = gamesList.indexOf(selectedGameAddress);

      App.contracts.Games[index].move(pos)
        .then(function(res) {
          App.contracts.Games[index].getBoard.call()
            .then(function(res) {
              board.data = res;
              // sometimes promises don't give back the updated data, so
              // knowing the move we do it manually
              // +1 because 0 stands for empty, 1 and 2 for placed stones
              if(board.data[pos].c[0] == 0) {
                board.data[pos].c[0] = board.turn + 1;
              }
              App.loadBoard();
            });
        })
        .catch(function(err) {
          console.log(err.message);
          $('#loader').fadeToggle('fast');
        })
    });
  },

  handlePass: function(event) {
    event.preventDefault();

    $('#loader').fadeToggle('fast');

    if (!selectedGameAddress) {
      $('#loader').fadeToggle('fast');
      $("#noGameSelected").show();
      $('.close').click(function() {
         $('#noGameSelected').hide();
      })
      return;
    }

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      let index = gamesList.indexOf(selectedGameAddress);

      App.contracts.Games[index].pass()
        .then(function(res) {
          if (gamesData[index][3] == 1) {
            $("#winner1").show();
            $('#moveButton').fadeOut('fast');
            $('#passButton').fadeOut('fast');
          } else if (gamesData[index][3] == 2) {
            $("#winner2").show();
            $('#moveButton').fadeOut('fast');
            $('#passButton').fadeOut('fast');
          }
          $('#loader').fadeToggle('fast');
        })
        .catch(function(err) {
          console.log(err.message);
          $('#loader').fadeToggle('fast');

        })
    });

  },

  handleNewGame: function(event) {
    event.preventDefault();
    $('#loader').fadeToggle('fast');

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      App.contracts.Go.deployed().then(function(instance) {
          goInstance = instance;

          return goInstance.newGame();
        }).then(function(result) {
          $('#loader').fadeToggle('fast');
        })
        .catch(function(err) {
          console.log(err.message);
          $('#loader').fadeToggle('fast');
        });
    });
  },

  updateGamesList: function(games) {
    // NOTE this works assuming we don't delete games
    let oldGamesList = gamesList;
    gamesList = games;
    for (let i = oldGamesList.length; i < games.length; i++) {
      let game = gamesList[i];
      $.getJSON('GoGame.json', function(data) {
        App.contracts.Games[i] = TruffleContract(data);
        App.contracts.Games[i].setProvider(App.web3Provider);
        App.contracts.Games[i] = App.contracts.Games[i].at(game);
        App.contracts.Games[i].getData.call()
          .then(function(res) {
            gamesData[i] = res;
            let turn = gamesData[i][2].c[0] == 0 ? 'owner' : 'opponent';
            let state = gamesData[i][3] == 0 ? 'ongoing' : gamesData[i][3] == 1 ? '1 won' : '2 won';
            item = $('<a href="#" id="game-' + i + '" class="game-item list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">Game ' + (i+1) + '</h5><small>state: ' + state + '</small></div><p class="mb-1">' + gamesData[i][0] + ' vs ' + gamesData[i][1] + '</p><small>turn: ' + turn + '</small></a>');
            item.hide();
            item.on('click', this, function(event) {
              $('#loader').fadeToggle('fast');
              let item = event.target;
              while (!item.classList.contains('game-item')) {
                item = item.parentElement;
              }
              if (selectedGameElement) {
                selectedGameElement.classList.remove("active");
              }
              item.classList.add("active");
              selectedGameElement = item;
              let index = item.id.split('-')[1];
              let game = gamesList[index];

              $.getJSON('GoGame.json', function(data) {
                App.contracts.Games[i] = TruffleContract(data);
                App.contracts.Games[i].setProvider(App.web3Provider);
                App.contracts.Games[i] = App.contracts.Games[i].at(game);
                App.contracts.Games[i].getData.call()
                  .then(function(res) {
                    board.turn = res[2].c[0];
                    gamesData[i] = res;
                    App.selectGame(i);
                  })
                  .catch(function(err) {
                    console.log(err.message);
                    $('#loader').fadeToggle('fast');
                  })
              });
            })
            $('#gamesList').append(item);
            item.fadeToggle('fast');

          })
          .catch(function(err) {
            console.log(err.message);
            $('#loader').fadeToggle('fast');
          })
      });
    }
  },

  selectGame: function(index) {
    selectedGameAddress = gamesList[index];
    // FIXME load also the state of the game (turn/state) and store it locally
    App.contracts.Games[index].getBoard.call()
      .then(function(res) {
        board.data = res;
        App.loadBoard();
        if (gamesData[index][3] == 0) {
          $('#winner1').hide();
          $('#winner2').hide();
          $('#moveButton').fadeIn('fast');
          $('#passButton').fadeIn('fast');
        } else if (gamesData[index][3] == 1) {
          $('#winner1').show();
          $('#winner2').hide();
          $('#moveButton').fadeOut('fast');
          $('#passButton').fadeOut('fast');
        } else {
          $('#winner1').hide();
          $('#winner2').show();
          $('#moveButton').fadeOut('fast');
          $('#passButton').fadeOut('fast');
        }

      })
      .catch(function(err) {
        console.log(err.message);
        $('#loader').fadeToggle('fast');
      })
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
