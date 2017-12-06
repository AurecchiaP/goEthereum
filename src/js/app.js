var test;

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
      // Use our contract to retrieve and mark the adopted pets
      return App.loadGames();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#moveButton', App.handleMove);
    $(document).on('click', '#newGameButton', App.handleNewGame);
  },

  loadGames: function() {

    var goInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(accounts);

      App.contracts.Go.deployed().then(function(instance) {
          goInstance = instance;

          // Execute adopt as a transaction by sending account
          return goInstance.getGames.call();
        })
        .then(function(games) {
          App.updateGamesList(games)
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

    var goInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(accounts);

      // FIXME 0 is static, make it index of current game
      App.contracts.Games[0].move(pos)
        .then(function(res) {
          App.contracts.Games[0].getBoard.call()
            .then(function(res) {
              board.data = res;
              App.loadBoard();
            });
        })
        .catch(function(err) {
          console.log(err.message);

        })
    });
  },

  handleNewGame: function(event) {
    event.preventDefault();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(accounts);

      App.contracts.Go.deployed().then(function(instance) {
          goInstance = instance;

          // Execute adopt as a transaction by sending account
          return goInstance.newGame();
        }).then(function(result) {
          // console.log(result);
          return goInstance.getGames.call();

        })
        .then(function(games) {
          App.updateGamesList(games);
        })
        .catch(function(err) {
          console.log(err.message);
        });
    });
  },

  updateGamesList: function(games) {
    gamesList = games;
    $('#gamesList').empty();
    for (let i = 0; i < games.length; i++) {
      let game = gamesList[i];
      $.getJSON('GoGame.json', function(data) {
        App.contracts.Games[i] = TruffleContract(data);
        App.contracts.Games[i].setProvider(App.web3Provider);
        App.contracts.Games[i] = App.contracts.Games[i].at(game);
        App.contracts.Games[i].getData.call()
          .then(function(res) {
            gamesData[i] = res;
            console.log(gamesData[i]);
            let turn = gamesData[i][2].c[0] == 0 ? 'owner' : 'opponent';
            item = $('<a href="#" id="game-' + i + '" class="game-item list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">Ongoing</h5><small>state</small></div><p class="mb-1">' + gamesData[i][0] + ' vs ' + gamesData[i][1] + '</p><small>turn: ' + turn + '</small></a>');
            item.on('click', this, function(event) {
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
                    // TODO should load the board and such, call 'selectGame'
                    console.log(res);
                    gamesData[i] = res;
                    App.selectGame(i);

                  })
              });

            })
            $('#gamesList').append(item);
          })
      });
    }
  },

  selectGame: function(index) {
    selectedGameAddress = gamesList[index];

    App.contracts.Games[index].getBoard.call()
      .then(function(res) {
        board.data = res;
        App.loadBoard();
      });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
