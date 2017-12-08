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
    // TODO maybe better to put the event on the button itself?
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

      $('#loader').show();
      App.contracts.Go.deployed().then(function(instance) {
          goInstance = instance;

          // Execute adopt as a transaction by sending account
          return goInstance.getGames.call();
        })
        .then(function(games) {
          App.updateGamesList(games)
          $('#loader').hide();
        })
        .catch(function(err) {
          console.log(err.message);
        });
    });
  },

  loadBoard: function() {
    boardDiv.find('.temporary-stone').remove()

    for (let i = 0; i < 19; i++) {
      for (let j = 0; j < 19; j++) {
        board.updateSize();
        let stone;
        if (board.data[i * 19 + j].c[0] == 1) {
          stone = $('<div class="stone white temporary-stone" id="stone' + (i * 19 + j) + '"></div>');
          stone.css({
            display: 'block',
            top: i / 19 * 100 + '%',
            left: j / 19 * 100 + '%'
          });
          boardDiv.append(stone);
        } else if (board.data[i * 19 + j].c[0] == 2) {
          stone = $('<div class="stone black temporary-stone" id="stone' + (i * 19 + j) + '"></div>');
          stone.css({
            display: 'block',
            top: i / 19 * 100 + '%',
            left: j / 19 * 100 + '%'
          });
          boardDiv.append(stone);
        }
      }
    }
    $('#loader').hide();
  },

  handleMove: function(event) {
    event.preventDefault();

    // get the current position of the stone
    console.log(placedStone.x);
    var pos = placedStone.x + 19 * placedStone.y;

    // when you click confirm, it should store the right number at that position

    if (!selectedGameAddress) {
      console.log("no selected game");
      return;
    }

    $('#loader').show();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      let index = gamesList.indexOf(selectedGameAddress);

      App.contracts.Games[index].move(pos)
        .then(function(res) {
          App.contracts.Games[index].getBoard.call()
            .then(function(res) {
              board.data = res[0];
              // sometimes promises don't give back the updated data, so
              // knowing the move we do it manually
              // +1 because 0 stands for empty, 1 and 2 for placed stones
              board.data[pos].c[0] = res[1].c[0] + 1;
              App.loadBoard();
            });
        })
        .catch(function(err) {
          console.log(err.message);
          $('#loader').hide();
        })
    });
  },

  handlePass: function(event) {
    event.preventDefault();

    $('#loader').show();

    if (!selectedGameAddress) {
      console.log("no selected game");
      $('#loader').hide();
      return;
    }

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      let index = gamesList.indexOf(selectedGameAddress);

      App.contracts.Games[index].pass()
        .then(function(res) {
          console.log('passed');
          console.log(res);
          $('#loader').hide();
        })
        .catch(function(err) {
          console.log(err.message);
          $('#loader').hide();
        })
    });

  },

  handleNewGame: function(event) {
    event.preventDefault();
    $('#loader').show();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      App.contracts.Go.deployed().then(function(instance) {
          goInstance = instance;

          return goInstance.newGame();
        }).then(function(result) {
          $('#loader').hide();
        })
        .catch(function(err) {
          console.log(err.message);
          $('#loader').hide();
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
            item = $('<a href="#" id="game-' + i + '" class="game-item list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">Ongoing</h5><small>state: ' + state + '</small></div><p class="mb-1">' + gamesData[i][0] + ' vs ' + gamesData[i][1] + '</p><small>turn: ' + turn + '</small></a>');
            item.on('click', this, function(event) {
              $('#loader').show();
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
                    gamesData[i] = res;
                    App.selectGame(i);
                  })
                  .catch(function(err) {
                    console.log(err.message);
                    $('#loader').hide();
                  })
              });
            })
            $('#gamesList').append(item);
          })
          .catch(function(err) {
            console.log(err.message);
            $('#loader').hide();
          })
      });
    }
  },

  selectGame: function(index) {
    selectedGameAddress = gamesList[index];

    App.contracts.Games[index].getBoard.call()
      .then(function(res) {
        board.data = res[0];
        App.loadBoard();
      })
      .catch(function(err) {
        console.log(err.message);
        $('#loader').hide();
      })
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
