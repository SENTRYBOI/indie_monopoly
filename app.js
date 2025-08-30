// Game Data
const GAME_DATA = {
  cities: [
    {name: "Mumbai", state: "Maharashtra", companies: ["Tata Group", "Reliance Industries", "State Bank of India"], color: "#8B4513", price: 1200, rent: 120},
    {name: "Bengaluru", state: "Karnataka", companies: ["Infosys", "Wipro", "Biocon"], color: "#8B4513", price: 1000, rent: 100},
    {name: "Delhi", state: "NCR", companies: ["Bharti Airtel", "Paytm", "Zomato"], color: "#FF6347", price: 1400, rent: 140},
    {name: "Hyderabad", state: "Telangana", companies: ["Dr. Reddy's", "Cyient", "Flipkart"], color: "#FF6347", price: 1100, rent: 110},
    {name: "Chennai", state: "Tamil Nadu", companies: ["Ashok Leyland", "TVS Motor", "Super Tannery"], color: "#FFA500", price: 900, rent: 90},
    {name: "Pune", state: "Maharashtra", companies: ["Bajaj Auto", "Mahindra", "Tech Mahindra"], color: "#FFA500", price: 800, rent: 80},
    {name: "Kolkata", state: "West Bengal", companies: ["ITC Limited", "Coal India", "Britannia"], color: "#32CD32", price: 700, rent: 70},
    {name: "Ahmedabad", state: "Gujarat", companies: ["Adani Group", "Torrent Pharma", "Nirma"], color: "#32CD32", price: 600, rent: 60},
    {name: "Kochi", state: "Kerala", companies: ["V-Guard", "Federal Bank", "Geojit Financial"], color: "#4169E1", price: 500, rent: 50},
    {name: "Jaipur", state: "Rajasthan", companies: ["JK Group", "State Mines", "Heritage Hotels"], color: "#4169E1", price: 400, rent: 40}
  ],
  
  specialSpaces: [
    {name: "START", type: "start", description: "Collect ₹2000"},
    {name: "Chennai Central", type: "railway", price: 2000, rent: 250},
    {name: "Mumbai Central", type: "railway", price: 2000, rent: 250},
    {name: "New Delhi Station", type: "railway", price: 2000, rent: 250},
    {name: "Howrah Junction", type: "railway", price: 2000, rent: 250},
    {name: "Indian Railways", type: "utility", price: 1500, rent: 100},
    {name: "BSNL Telecom", type: "utility", price: 1500, rent: 100},
    {name: "Income Tax", type: "tax", amount: 2000},
    {name: "Super Tax", type: "tax", amount: 1000},
    {name: "JAIL", type: "jail"},
    {name: "FREE PARKING", type: "parking"},
    {name: "GO TO JAIL", type: "gotojail"}
  ],
  
  chanceCards: [
    {text: "Advance to START and collect ₹2000", action: "moveToStart"},
    {text: "Your startup got funded! Collect ₹5000", action: "collectMoney", amount: 5000},
    {text: "Pay poor tax of ₹1500", action: "payMoney", amount: 1500},
    {text: "Go directly to Jail", action: "goToJail"},
    {text: "Advance to Mumbai and collect ₹2000 if you pass START", action: "moveToProperty", property: "Mumbai"}
  ],
  
  communityChestCards: [
    {text: "Bank error in your favor! Collect ₹2000", action: "collectMoney", amount: 2000},
    {text: "Doctor's fees - Pay ₹500", action: "payMoney", amount: 500},
    {text: "From sale of stock you get ₹450", action: "collectMoney", amount: 450},
    {text: "Income tax refund - Collect ₹200", action: "collectMoney", amount: 200},
    {text: "You won second prize in beauty contest! Collect ₹100", action: "collectMoney", amount: 100}
  ]
};

// Game State
let gameState = {
  players: [],
  currentPlayerIndex: 0,
  board: [],
  gamePhase: 'setup',
  diceRolled: false,
  currentCard: null,
  actionPending: false
};

// Game Configuration
const CONFIG = {
  startingMoney: 15000,
  salaryAmount: 2000,
  maxPlayers: 4,
  minPlayers: 2,
  jailFine: 500
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing game...');
  initializeGame();
  checkSavedGame();
});

function initializeGame() {
  console.log('Initializing game...');
  setupBoard();
  setupEventListeners();
}

function checkSavedGame() {
  const savedGame = localStorage.getItem('indianMonopolyGame');
  const loadBtn = document.getElementById('loadGameBtn');
  
  if (savedGame && loadBtn) {
    loadBtn.style.display = 'inline-flex';
  } else if (loadBtn) {
    loadBtn.style.display = 'none';
  }
}

function setupEventListeners() {
  const playerCountSelect = document.getElementById('playerCountSelect');
  if (playerCountSelect) {
    playerCountSelect.addEventListener('change', updatePlayerSetup);
  }
}

// Screen Management Functions - Global scope
window.showScreen = function(screenId) {
  console.log('Showing screen:', screenId);
  const screens = document.querySelectorAll('.screen');
  screens.forEach(function(screen) {
    screen.classList.add('hidden');
  });
  
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
    console.log('Screen shown:', screenId);
  } else {
    console.error('Screen not found:', screenId);
  }
};

window.showWelcome = function() {
  console.log('Showing welcome screen');
  showScreen('welcomeScreen');
};

window.showPlayerSetup = function() {
  console.log('Showing player setup screen');
  showScreen('playerSetupScreen');
  updatePlayerSetup();
};

window.showRules = function() {
  console.log('Showing rules screen');
  showScreen('rulesScreen');
};

window.showGame = function() {
  console.log('Showing game screen');
  showScreen('gameScreen');
  updateGameDisplay();
};

// Player Setup Functions
window.updatePlayerSetup = function() {
  const playerCountSelect = document.getElementById('playerCountSelect');
  const container = document.getElementById('playersConfig');
  
  if (!playerCountSelect || !container) {
    console.error('Player setup elements not found');
    return;
  }
  
  const playerCount = parseInt(playerCountSelect.value);
  container.innerHTML = '';
  
  for (let i = 0; i < playerCount; i++) {
    const playerConfig = document.createElement('div');
    playerConfig.className = 'player-config';
    playerConfig.innerHTML = `
      <h4>Player ${i + 1}</h4>
      <div class="player-form">
        <div class="form-group">
          <label class="form-label">Name:</label>
          <input type="text" class="form-control" id="player${i}Name" value="Player ${i + 1}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Type:</label>
          <select class="form-control" id="player${i}Type">
            <option value="human">Human</option>
            <option value="ai">AI</option>
          </select>
        </div>
      </div>
    `;
    container.appendChild(playerConfig);
  }
};

window.startGame = function() {
  console.log('Starting game...');
  const playerCountSelect = document.getElementById('playerCountSelect');
  if (!playerCountSelect) {
    console.error('Player count select not found');
    return;
  }
  
  const playerCount = parseInt(playerCountSelect.value);
  gameState.players = [];
  
  // Create players
  for (let i = 0; i < playerCount; i++) {
    const nameInput = document.getElementById(`player${i}Name`);
    const typeSelect = document.getElementById(`player${i}Type`);
    
    const name = nameInput ? nameInput.value : `Player ${i + 1}`;
    const type = typeSelect ? typeSelect.value : 'human';
    
    gameState.players.push({
      id: i,
      name: name,
      type: type,
      money: CONFIG.startingMoney,
      position: 0,
      properties: [],
      inJail: false,
      jailTurns: 0,
      bankrupt: false
    });
  }
  
  gameState.currentPlayerIndex = 0;
  gameState.gamePhase = 'playing';
  gameState.diceRolled = false;
  gameState.actionPending = false;
  
  showGame();
  createPlayerTokens();
  updateGameDisplay();
  resetTurnButtons();
  showNotification(`Game started! ${gameState.players[0].name}'s turn.`);
};

// Board Setup
function setupBoard() {
  const boardSpaces = [
    // Bottom row (0-10)
    {name: "START", type: "start", description: "Collect ₹2000"},
    {name: "Jaipur", type: "city", ...GAME_DATA.cities[9]},
    {name: "Community Chest", type: "community"},
    {name: "Kochi", type: "city", ...GAME_DATA.cities[8]},
    {name: "Income Tax", type: "tax", amount: 2000},
    {name: "Chennai Central", type: "railway", price: 2000, rent: 250},
    {name: "Ahmedabad", type: "city", ...GAME_DATA.cities[7]},
    {name: "Chance", type: "chance"},
    {name: "Kolkata", type: "city", ...GAME_DATA.cities[6]},
    {name: "Pune", type: "city", ...GAME_DATA.cities[5]},
    {name: "JAIL", type: "jail"},
    
    // Left column (11-19)
    {name: "Chennai", type: "city", ...GAME_DATA.cities[4]},
    {name: "Indian Railways", type: "utility", price: 1500, rent: 100},
    {name: "Hyderabad", type: "city", ...GAME_DATA.cities[3]},
    {name: "Delhi", type: "city", ...GAME_DATA.cities[2]},
    {name: "Mumbai Central", type: "railway", price: 2000, rent: 250},
    {name: "Bengaluru", type: "city", ...GAME_DATA.cities[1]},
    {name: "Community Chest", type: "community"},
    {name: "Mumbai", type: "city", ...GAME_DATA.cities[0]},
    {name: "BSNL Telecom", type: "utility", price: 1500, rent: 100},
    
    // Top row (20-30)
    {name: "FREE PARKING", type: "parking"},
    {name: "Chance", type: "chance"},
    {name: "New Delhi Station", type: "railway", price: 2000, rent: 250},
    {name: "Community Chest", type: "community"},
    {name: "Howrah Junction", type: "railway", price: 2000, rent: 250},
    {name: "Super Tax", type: "tax", amount: 1000},
    {name: "Chance", type: "chance"},
    {name: "Community Chest", type: "community"},
    {name: "Chance", type: "chance"},
    {name: "Community Chest", type: "community"},
    {name: "GO TO JAIL", type: "gotojail"},
    
    // Right column (31-39)
    {name: "Chance", type: "chance"},
    {name: "Community Chest", type: "community"},
    {name: "Chance", type: "chance"},
    {name: "Community Chest", type: "community"},
    {name: "Chance", type: "chance"},
    {name: "Community Chest", type: "community"},
    {name: "Chance", type: "chance"},
    {name: "Community Chest", type: "community"},
    {name: "Chance", type: "chance"}
  ];
  
  gameState.board = boardSpaces;
  renderBoard();
}

function renderBoard() {
  const boardContainer = document.getElementById('gameBoard');
  if (!boardContainer) return;
  
  boardContainer.innerHTML = '';
  
  gameState.board.forEach(function(space, index) {
    const spaceElement = document.createElement('div');
    spaceElement.className = `board-space space-${index}`;
    spaceElement.setAttribute('data-space', index);
    
    if ([0, 10, 20, 30].includes(index)) {
      spaceElement.classList.add('corner');
    }
    
    if (space.type === 'city') {
      spaceElement.innerHTML = `
        <div class="property-color" style="background-color: ${space.color}"></div>
        <div class="space-name">${space.name}</div>
        <div class="space-price">₹${space.price}</div>
      `;
    } else if (space.type === 'railway' || space.type === 'utility') {
      spaceElement.innerHTML = `
        <div class="space-name">${space.name}</div>
        <div class="space-price">₹${space.price}</div>
      `;
    } else {
      spaceElement.innerHTML = `<div class="space-name">${space.name}</div>`;
    }
    
    spaceElement.addEventListener('click', function() {
      showSpaceInfo(index);
    });
    boardContainer.appendChild(spaceElement);
  });
}

// Player Management
function createPlayerTokens() {
  gameState.players.forEach(function(player, index) {
    const token = document.createElement('div');
    token.className = `player-token player-${index}`;
    token.id = `token-${index}`;
    token.setAttribute('data-player', index);
    
    const startSpace = document.querySelector('.space-0');
    if (startSpace) {
      startSpace.appendChild(token);
      
      // Position token within the space
      const tokenOffset = index * 8;
      token.style.left = `${10 + tokenOffset}px`;
      token.style.bottom = `10px`;
    }
  });
}

function movePlayerToken(playerIndex, newPosition) {
  const token = document.getElementById(`token-${playerIndex}`);
  const newSpace = document.querySelector(`.space-${newPosition}`);
  
  if (token && newSpace) {
    newSpace.appendChild(token);
    
    // Position multiple tokens in the same space
    const tokensInSpace = newSpace.querySelectorAll('.player-token');
    tokensInSpace.forEach(function(t, index) {
      const tokenOffset = index * 8;
      t.style.left = `${10 + tokenOffset}px`;
      t.style.bottom = '10px';
    });
  }
}

// Game Logic Functions - Global scope
window.rollDice = function() {
  if (gameState.diceRolled || gameState.actionPending) return;
  
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const total = dice1 + dice2;
  
  const dice1Element = document.getElementById('dice1');
  const dice2Element = document.getElementById('dice2');
  const rollBtn = document.getElementById('rollDiceBtn');
  
  if (dice1Element) dice1Element.textContent = dice1;
  if (dice2Element) dice2Element.textContent = dice2;
  
  // Add animation
  document.querySelectorAll('.dice').forEach(function(dice) {
    dice.style.animation = 'none';
    setTimeout(function() {
      dice.style.animation = 'diceRoll 0.5s ease-in-out';
    }, 10);
  });
  
  gameState.diceRolled = true;
  gameState.actionPending = true;
  if (rollBtn) rollBtn.disabled = true;
  
  setTimeout(function() {
    movePlayer(gameState.currentPlayerIndex, total);
  }, 600);
};

function movePlayer(playerIndex, steps) {
  const player = gameState.players[playerIndex];
  const oldPosition = player.position;
  let newPosition = (oldPosition + steps) % 40;
  
  // Check if player passed START
  if (newPosition < oldPosition && oldPosition !== 0) {
    player.money += CONFIG.salaryAmount;
    showNotification(`${player.name} passed START and collected ₹${CONFIG.salaryAmount}!`);
  }
  
  player.position = newPosition;
  movePlayerToken(playerIndex, newPosition);
  
  setTimeout(function() {
    handleLandedSpace(playerIndex, newPosition);
  }, 800);
}

function handleLandedSpace(playerIndex, position) {
  const player = gameState.players[playerIndex];
  const space = gameState.board[position];
  
  showMessage(`${player.name} landed on ${space.name}`);
  
  switch (space.type) {
    case 'city':
    case 'railway':
    case 'utility':
      handlePropertySpace(player, space, position);
      break;
    case 'chance':
      drawChanceCard();
      break;
    case 'community':
      drawCommunityChestCard();
      break;
    case 'tax':
      handleTaxSpace(player, space);
      break;
    case 'gotojail':
      sendToJail(playerIndex);
      break;
    case 'start':
    case 'jail':
    case 'parking':
      completeAction();
      break;
  }
  
  updateGameDisplay();
}

function handlePropertySpace(player, space, position) {
  const owner = gameState.players.find(function(p) {
    return p.properties.includes(position);
  });
  
  if (!owner) {
    // Property is available for purchase
    if (player.money >= space.price && player.type === 'human') {
      showPropertyModal(space, position, 'buy');
    } else if (player.type === 'ai' && player.money >= space.price) {
      // Simple AI decision
      if (Math.random() > 0.3) {
        buyPropertyForPlayer(player, space, position);
      } else {
        completeAction();
      }
    } else {
      showNotification(`${player.name} cannot afford ${space.name}`, 'warning');
      completeAction();
    }
  } else if (owner.id !== player.id) {
    // Pay rent to owner
    const rent = calculateRent(space, position, owner);
    if (player.money >= rent) {
      player.money -= rent;
      owner.money += rent;
      showNotification(`${player.name} paid ₹${rent} rent to ${owner.name}!`);
    } else {
      handleBankruptcy(player);
    }
    completeAction();
  } else {
    // Player owns the property
    showNotification(`${player.name} owns this property!`);
    completeAction();
  }
}

function completeAction() {
  gameState.actionPending = false;
  const endTurnBtn = document.getElementById('endTurnBtn');
  if (endTurnBtn) endTurnBtn.disabled = false;
}

function calculateRent(space, position, owner) {
  let rent = space.rent;
  
  if (space.type === 'railway') {
    const railwayCount = owner.properties.filter(function(pos) {
      return gameState.board[pos].type === 'railway';
    }).length;
    rent = space.rent * railwayCount;
  } else if (space.type === 'utility') {
    const utilityCount = owner.properties.filter(function(pos) {
      return gameState.board[pos].type === 'utility';
    }).length;
    rent = space.rent * utilityCount;
  }
  
  return rent;
}

window.buyProperty = function() {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const position = currentPlayer.position;
  const space = gameState.board[position];
  
  buyPropertyForPlayer(currentPlayer, space, position);
  closeModal();
};

function buyPropertyForPlayer(player, space, position) {
  if (player.money >= space.price) {
    player.money -= space.price;
    player.properties.push(position);
    
    // Mark space as owned
    const spaceElement = document.querySelector(`.space-${position}`);
    if (spaceElement) spaceElement.classList.add('owned');
    
    showNotification(`${player.name} bought ${space.name} for ₹${space.price}!`);
  }
  
  completeAction();
  updateGameDisplay();
}

function drawChanceCard() {
  const card = GAME_DATA.chanceCards[Math.floor(Math.random() * GAME_DATA.chanceCards.length)];
  gameState.currentCard = card;
  showCardModal('Chance', card.text);
}

function drawCommunityChestCard() {
  const card = GAME_DATA.communityChestCards[Math.floor(Math.random() * GAME_DATA.communityChestCards.length)];
  gameState.currentCard = card;
  showCardModal('Community Chest', card.text);
}

function executeCardAction() {
  const card = gameState.currentCard;
  const player = gameState.players[gameState.currentPlayerIndex];
  
  if (!card) return;
  
  switch (card.action) {
    case 'collectMoney':
      player.money += card.amount;
      showNotification(`${player.name} collected ₹${card.amount}!`);
      break;
    case 'payMoney':
      if (player.money >= card.amount) {
        player.money -= card.amount;
        showNotification(`${player.name} paid ₹${card.amount}!`);
      } else {
        handleBankruptcy(player);
      }
      break;
    case 'moveToStart':
      player.money += CONFIG.salaryAmount;
      player.position = 0;
      movePlayerToken(gameState.currentPlayerIndex, 0);
      showNotification(`${player.name} moved to START and collected ₹${CONFIG.salaryAmount}!`);
      break;
    case 'goToJail':
      sendToJail(gameState.currentPlayerIndex);
      break;
  }
  
  gameState.currentCard = null;
  completeAction();
  updateGameDisplay();
}

function handleTaxSpace(player, space) {
  if (player.money >= space.amount) {
    player.money -= space.amount;
    showNotification(`${player.name} paid ₹${space.amount} in taxes!`);
  } else {
    handleBankruptcy(player);
  }
  completeAction();
}

function sendToJail(playerIndex) {
  const player = gameState.players[playerIndex];
  player.position = 10; // Jail position
  player.inJail = true;
  player.jailTurns = 0;
  
  movePlayerToken(playerIndex, 10);
  showNotification(`${player.name} went to jail!`);
  completeAction();
}

function handleBankruptcy(player) {
  player.bankrupt = true;
  showNotification(`${player.name} is bankrupt!`, 'error');
  
  // Return properties to bank
  player.properties.forEach(function(position) {
    const spaceElement = document.querySelector(`.space-${position}`);
    if (spaceElement) spaceElement.classList.remove('owned');
  });
  player.properties = [];
  
  checkWinCondition();
}

function checkWinCondition() {
  const activePlayers = gameState.players.filter(function(p) {
    return !p.bankrupt;
  });
  
  if (activePlayers.length === 1) {
    showGameOverModal(activePlayers[0]);
  }
}

function resetTurnButtons() {
  const rollBtn = document.getElementById('rollDiceBtn');
  const endTurnBtn = document.getElementById('endTurnBtn');
  const buyBtn = document.getElementById('buyPropertyBtn');
  
  if (rollBtn) rollBtn.disabled = false;
  if (endTurnBtn) endTurnBtn.disabled = true;
  if (buyBtn) buyBtn.disabled = true;
}

window.endTurn = function() {
  gameState.diceRolled = false;
  gameState.actionPending = false;
  
  do {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  } while (gameState.players[gameState.currentPlayerIndex].bankrupt);
  
  resetTurnButtons();
  updateGameDisplay();
  
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  showMessage(`${currentPlayer.name}'s turn`);
  
  // Auto-play for AI
  if (currentPlayer.type === 'ai' && !currentPlayer.bankrupt) {
    setTimeout(function() {
      rollDice();
    }, 1500);
  }
  
  saveGame();
};

// UI Updates
function updateGameDisplay() {
  updatePlayersInfo();
  updateCurrentPlayerInfo();
}

function updatePlayersInfo() {
  const container = document.getElementById('playersInfo');
  if (!container) return;
  
  container.innerHTML = '';
  
  gameState.players.forEach(function(player, index) {
    const playerCard = document.createElement('div');
    playerCard.className = `player-card ${index === gameState.currentPlayerIndex ? 'active' : ''} ${player.bankrupt ? 'bankrupt' : ''}`;
    
    playerCard.innerHTML = `
      <div class="player-name">${player.name} ${player.type === 'ai' ? '🤖' : '👤'}</div>
      <div class="player-money">₹${player.money.toLocaleString()}</div>
      <div class="player-properties">${player.properties.length} properties</div>
      ${player.inJail ? '<div class="status status--warning">In Jail</div>' : ''}
    `;
    
    container.appendChild(playerCard);
  });
}

function updateCurrentPlayerInfo() {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const infoElement = document.getElementById('currentPlayerInfo');
  if (infoElement) {
    infoElement.textContent = `${currentPlayer.name}'s Turn - ₹${currentPlayer.money.toLocaleString()}`;
  }
}

function showMessage(message) {
  const messageElement = document.getElementById('gameMessage');
  if (messageElement) {
    messageElement.textContent = message;
  }
}

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  const textElement = document.getElementById('notificationText');
  
  if (!notification || !textElement) return;
  
  textElement.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove('hidden');
  
  setTimeout(function() {
    notification.classList.add('hidden');
  }, 3000);
}

// Modal Management
function showPropertyModal(space, position, action) {
  const modal = document.getElementById('propertyModal');
  const title = document.getElementById('propertyTitle');
  const details = document.getElementById('propertyDetails');
  const actionBtn = document.getElementById('modalActionBtn');
  
  if (!modal || !title || !details || !actionBtn) return;
  
  title.textContent = space.name;
  
  let detailsHTML = `
    <h4>${space.name}</h4>
    <div class="property-stats">
      <div><strong>Price:</strong> ₹${space.price}</div>
      <div><strong>Rent:</strong> ₹${space.rent}</div>
    </div>
  `;
  
  if (space.companies) {
    detailsHTML += `
      <div class="property-companies">
        <h5>Famous Companies:</h5>
        <div class="company-list">
          ${space.companies.map(function(company) {
            return `<span class="company-tag">${company}</span>`;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  details.innerHTML = detailsHTML;
  
  if (action === 'buy') {
    actionBtn.textContent = 'Buy Property';
    actionBtn.onclick = buyProperty;
    actionBtn.style.display = 'inline-flex';
  } else {
    actionBtn.style.display = 'none';
  }
  
  modal.classList.remove('hidden');
}

function showCardModal(type, text) {
  const modal = document.getElementById('cardModal');
  const title = document.getElementById('cardTitle');
  const textElement = document.getElementById('cardText');
  
  if (!modal || !title || !textElement) return;
  
  title.textContent = type;
  textElement.textContent = text;
  
  modal.classList.remove('hidden');
}

function showSpaceInfo(position) {
  const space = gameState.board[position];
  
  if (space.type === 'city' || space.type === 'railway' || space.type === 'utility') {
    showPropertyModal(space, position, 'info');
  }
}

function showGameOverModal(winner) {
  const modal = document.getElementById('gameOverModal');
  const winnerInfo = document.getElementById('winnerInfo');
  
  if (!modal || !winnerInfo) return;
  
  winnerInfo.innerHTML = `
    <h3>🎉 Congratulations!</h3>
    <p><strong>${winner.name}</strong> wins the game!</p>
    <div class="winner-stats">
      <p>Final Money: ₹${winner.money.toLocaleString()}</p>
      <p>Properties Owned: ${winner.properties.length}</p>
    </div>
  `;
  
  modal.classList.remove('hidden');
  
  // Clear saved game
  localStorage.removeItem('indianMonopolyGame');
}

window.closeModal = function() {
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.add('hidden');
  });
  // If we're closing a property modal without buying, complete the action
  if (!gameState.actionPending === false) {
    completeAction();
  }
};

window.closeCardModal = function() {
  closeModal();
  executeCardAction();
};

window.modalAction = function() {
  // This will be set by the specific modal
};

// Save/Load Game Functions
window.saveGame = function() {
  const saveData = {
    gameState: gameState,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('indianMonopolyGame', JSON.stringify(saveData));
  showNotification('Game saved!');
};

window.loadGame = function() {
  const savedData = localStorage.getItem('indianMonopolyGame');
  
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      gameState = parsed.gameState;
      
      showGame();
      setupBoard();
      createPlayerTokens();
      
      // Restore player positions
      gameState.players.forEach(function(player, index) {
        movePlayerToken(index, player.position);
      });
      
      updateGameDisplay();
      resetTurnButtons();
      showNotification('Game loaded successfully!');
      
    } catch (error) {
      showNotification('Failed to load game!', 'error');
    }
  }
};

window.newGame = function() {
  localStorage.removeItem('indianMonopolyGame');
  location.reload();
};

window.showMenu = function() {
  if (confirm('Are you sure you want to return to menu? Current progress will be saved.')) {
    saveGame();
    showWelcome();
  }
};

// Additional global functions for UI elements
window.payRent = function() {
  completeAction();
};