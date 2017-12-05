var test;

App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

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
    $.getJSON('Go.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var GoArtifact = data;

      App.contracts.Go = TruffleContract(GoArtifact);

      // Set the provider for our contract
      App.contracts.Go.setProvider(App.web3Provider);
      // Use our contract to retrieve and mark the adopted pets
      return App.markMove();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#moveButton', App.handleMove);
    $(document).on('click', '#newGameButton', App.handleNewGame);
  },

  markMove: function() {
    var goInstance;

    App.contracts.Go.deployed().then(function(instance) {
      goInstance = instance;

      return goInstance.getBoard.call();
    }).then(function(newBoard) {
      // FIXME SUPER UGLY
      console.log(newBoard);
      for (let i = 0; i < 19; i++) {
        for (let j = 0; j < 19; j++) {
          board.updateSize();
          let stone;
          if (newBoard[i * 19 + j].c[0] == 1) {
            stone = $('<div class="stone white as" id="stone' + (i * 19 + j) + '"></div>');
            stone.css({
              display: 'block',
              top:  i/19 * 100 + '%',
              left: j/19 * 100 + '%'
            });
            boardDiv.append(stone);
          } else if (newBoard[i * 19 + j].c[0] == 2) {
            stone = $('<div class="stone black as" id="stone' + (i * 19 + j) + '"></div>');
            stone.css({
              display: 'block',
              top:  i/19 * 100 + '%',
              left: j/19 * 100 + '%'
            });
            boardDiv.append(stone);
          }
        }
      }

    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleMove: function(event) {
    event.preventDefault();

    // get the current position of the stone
    console.log(placedStone.x);
    var pos = placedStone.x + 19 * placedStone.y;

    // when you click confirm, it should store the right number at that position


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
        return goInstance.move(pos);
      }).then(function(result) {
        return App.markMove(board.data, account);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleNewGame: function(event) {
    event.preventDefault();

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
          return goInstance.newGame();
        }).then(function(result) {
          // console.log(result);
          return goInstance.getGames.call();

        })
        .then(function(games) {
          console.log(games);
          $('#gamesList').empty();
          for (let i = 0; i < games.length; i++) {
            item = $('<a href="#" class="list-group-item list-group-item-action flex-column align-items-start active"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">List group item heading</h5><small>3 days ago</small></div><p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p><small>Donec id elit non mi porta.</small></a>');
            // stone.css({
            //   display: 'block',
            //   top: i * board.cellWidth + 'px',
            //   left: j * board.cellWidth + 'px'
            // });
            $('#gamesList').append(item);
          }
        })
        .catch(function(err) {
          console.log(err.message);
        });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
