const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos UI
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const subtitles = document.getElementById('subtitles');
const marketModal = document.getElementById('market-modal');
const chestModal = document.getElementById('chest-modal');

// Estado Geral
let gameActive = false;
let isModalOpen = false;
let score = 0;
let coins = 15; // Começa com algum dinheiro para sementes
let currentItemIdx = 0; 
let subtitleTimeout;

// Inventários (Mochila e Baú)
const maxMochila = 3;
let inv = { seeds: 0, crops: 0 };
let chest = { seeds: 0, crops: 0 };

// Jogador
const player = { x: 400, y: 300, size: 24, speed: 5, color: '#e67e22' };
const keys = {};

// Sistema de Plantação e Expansão
const tiles = [];
const tileSize = 60;
let gridRows = 2; // Começa menor
let gridCols = 2;
let maxGrid = 5;

// Estruturas do Mapa
const marketStall = { x: 50, y: 50, w: 100, h: 80, color: '#8e44ad', name: 'MERCADO' };
const storageChest = { x: 650, y: 50, w: 60, h: 40, color: '#d35400', name: 'BAÚ' };

// Sistema de Objetivos Dinâmicos
let objIndex = 0;
let objProgress = 0;
const storyObjectives = [
    { action: 'plow', target: 2, desc: "Prepare 2 pedaços de terra", text: "A terra seca finalmente respira. O primeiro passo foi dado." },
    { action: 'buy', target: 2, desc: "Compre 2 sementes no Mercado", text: "Sementes adquiridas. O mercado local será seu aliado." },
    { action: 'plant', target: 2, desc: "Plante 2 sementes", text: "Sementes na terra. Agora é esperar o tempo fazer seu trabalho." },
    { action: 'harvest', target: 2, desc: "Colha 2 alimentos", text: "Sua primeira colheita! O sustento independente é real." },
    { action: 'sell', target: 2, desc: "Venda 2 colheitas no Mercado", text: "O comércio é a base da nova economia. Lucro gerado." },
    { action: 'upgrade', target: 1, desc: "Expanda a terra no Mercado", text: "Mais terra, mais responsabilidade. A fazenda está crescendo!" }
];

function initGrid() {
    tiles.length = 0;
    // Centraliza a grade dinamicamente
    const startX = (canvas.width - (gridCols * (tileSize + 10))) / 2;
    const startY = (canvas.height - (gridRows * (tileSize + 10))) / 2 + 50;

    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            tiles.push({ x: startX + c * (tileSize+10), y: startY + r * (tileSize+10), status: 'grama', timer: 0 });
        }
    }
}

function startGame() {
    mainMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    initGrid();
    updateUI();
    showSubtitle("O ano é 2026. Sem internet, a sobrevivência é manual. Comece preparando a terra.");
    gameActive = true;
    gameLoop();
}

// === CONTROLES ===
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    keys[e.code] = true;

    if (!isModalOpen) {
        if (e.key === '1') selectSlot(0);
        if (e.key === '2') selectSlot(1);
        if (e.key === '3') selectSlot(2);
        if (e.code === 'Space') {
            e.preventDefault();
            interact();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    keys[e.code] = false;
});

function selectSlot(idx) {
    document.getElementById(`slot-${currentItemIdx}`).classList.remove('active');
    currentItemIdx = idx;
    document.getElementById(`slot-${currentItemIdx}`).classList.add('active');
}

// === SISTEMA DE OBJETIVOS E HISTÓRIA ===
function checkObjective(action) {
    const currentObj = storyObjectives[objIndex];
    if (currentObj && currentObj.action === action) {
        objProgress++;
        if (objProgress >= currentObj.target) {
            showSubtitle(currentObj.text);
            score += 50; // Bônus por completar
            objIndex++;
            objProgress = 0;
            
            // Loop infinito de objetivos após zerar a história
            if (objIndex >= storyObjectives.length) {
                generateRandomObjective();
            }
        }
        updateUI();
    }
}

function generateRandomObjective() {
    const actions = ['plow', 'plant', 'harvest', 'sell'];
    const randAction = actions[Math.floor(Math.random() * actions.length)];
    const randTarget = Math.floor(Math.random() * 3) + 3; // 3 a 5
    
    let desc = "";
    if(randAction==='plow') desc = `Prepare ${randTarget} terras`;
    if(randAction==='plant') desc = `Plante ${randTarget} sementes`;
    if(randAction==='harvest') desc = `Colha ${randTarget} vezes`;
    if(randAction==='sell') desc = `Venda ${randTarget} itens`;

    storyObjectives.push({ action: randAction, target: randTarget, desc: desc, text: "Ótimo trabalho! A rotina offline continua." });
}

function showSubtitle(text) {
    subtitles.innerText = text;
    subtitles.classList.remove('hidden');
    clearTimeout(subtitleTimeout);
    subtitleTimeout = setTimeout(() => {
        subtitles.classList.add('hidden');
    }, 5000);
}

// === INTERAÇÕES E MERCADO/BAÚ ===
function checkCollision(obj) {
    return player.x + player.size/2 > obj.x && player.x - player.size/2 < obj.x + obj.w &&
           player.y + player.size/2 > obj.y && player.y - player.size/2 < obj.y + obj.h;
}

function interact() {
    // 1. Checa Baú
    if (checkCollision(storageChest)) {
        openModal(chestModal);
        return;
    }
    // 2. Checa Mercado
    if (checkCollision(marketStall)) {
        openModal(marketModal);
        return;
    }
    // 3. Checa Lotes de Terra
    for (let tile of tiles) {
        if (player.x > tile.x && player.x < tile.x + tileSize &&
            player.y > tile.y && player.y < tile.y + tileSize) {
            
            if (currentItemIdx === 0 && tile.status === 'grama') { // Enxada
                tile.status = 'arado';
                checkObjective('plow');
                score += 5;
            } 
            else if (currentItemIdx === 1 && tile.status === 'arado' && inv.seeds > 0) { // Sementes
                tile.status = 'plantado';
                tile.timer = 150; 
                inv.seeds--;
                checkObjective('plant');
                score += 10;
            } 
            else if (currentItemIdx === 2 && tile.status === 'maduro') { // Colher
                if (inv.crops < maxMochila) {
                    tile.status = 'grama';
                    inv.crops++;
                    checkObjective('harvest');
                    score += 20;
                } else {
                    showSubtitle("Mochila de colheita cheia! Guarde no baú ou venda.");
                }
            }
            updateUI();
            return;
        }
    }
}

// === FUNÇÕES DE MODAL, ECONOMIA E BAÚ ===
function openModal(modal) { isModalOpen = true; modal.classList.remove('hidden'); updateUI(); }
function closeModals() { isModalOpen = false; marketModal.classList.add('hidden'); chestModal.classList.add('hidden'); updateUI(); }

function marketSell() {
    if (inv.crops > 0) {
        inv.crops--; coins += 10; score += 15;
        checkObjective('sell'); updateUI();
    } else { alert("Você não tem colheitas na mochila!"); }
}

function marketBuySeed() {
    if (coins >= 5) {
        if (inv.seeds < maxMochila) {
            coins -= 5; inv.seeds++;
            checkObjective('buy'); updateUI();
        } else { alert("Mochila de sementes cheia!"); }
    } else { alert("Moedas insuficientes!"); }
}

function marketUpgrade() {
    if (coins >= 50) {
        if (gridCols < maxGrid) {
            coins -= 50;
            gridCols++; gridRows++;
            initGrid();
            checkObjective('upgrade');
            showSubtitle("O terreno foi expandido com sucesso!");
            updateUI();
        } else { alert("Tamanho máximo da fazenda atingido!"); }
    } else { alert("Requer 50 moedas para expandir."); }
}

function chestStore(type) {
    if (inv[type] > 0) { inv[type]--; chest[type]++; updateUI(); }
}
function chestTake(type) {
    if (chest[type] > 0 && inv[type] < maxMochila) { chest[type]--; inv[type]++; updateUI(); }
}

function updateUI() {
    document.getElementById('count-seeds').innerText = `${inv.seeds}/${maxMochila}`;
    document.getElementById('count-crops').innerText = `${inv.crops}/${maxMochila}`;
    document.getElementById('score-display').innerText = `Pontos: ${score}`;
    document.getElementById('coins-display').innerText = `Moedas: $${coins}`;
    
    document.getElementById('chest-seeds').innerText = chest.seeds;
    document.getElementById('chest-crops').innerText = chest.crops;

    const currObj = storyObjectives[objIndex];
    if (currObj) {
        document.getElementById('current-objective').innerText = currObj.desc;
        const progBar = document.getElementById('obj-progress');
        progBar.max = currObj.target;
        progBar.value = objProgress;
    }
}

// === LOOP PRINCIPAL ===
function update() {
    if (isModalOpen) return; // Pausa o jogo ao abrir menus

    // Movimentação
    if (keys['w'] || keys['arrowup']) player.y -= player.speed;
    if (keys['s'] || keys['arrowdown']) player.y += player.speed;
    if (keys['a'] || keys['arrowleft']) player.x -= player.speed;
    if (keys['d'] || keys['arrowright']) player.x += player.speed;

    // Limites de tela
    if (player.x < player.size) player.x = player.size;
    if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
    if (player.y < player.size) player.y = player.size;
    if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;

    // Crescimento das plantas
    for (let tile of tiles) {
        if (tile.status === 'plantado') {
            tile.timer--;
            if (tile.timer <= 0) tile.status = 'maduro';
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha Mercado e Baú
    ctx.fillStyle = marketStall.color;
    ctx.fillRect(marketStall.x, marketStall.y, marketStall.w, marketStall.h);
    ctx.fillStyle = '#fff'; ctx.font = '14px Courier New'; ctx.fillText(marketStall.name, marketStall.x+20, marketStall.y+45);

    ctx.fillStyle = storageChest.color;
    ctx.fillRect(storageChest.x, storageChest.y, storageChest.w, storageChest.h);
    ctx.fillStyle = '#fff'; ctx.fillText(storageChest.name, storageChest.x+15, storageChest.y+25);

    // Desenha Plantação
    for (let tile of tiles) {
        if (tile.status === 'grama') ctx.fillStyle = '#5c8261';
        else if (tile.status === 'arado') ctx.fillStyle = '#6e4722';
        else if (tile.status === 'plantado') ctx.fillStyle = '#523418';
        else if (tile.status === 'maduro') ctx.fillStyle = '#27ae60';
        
        ctx.fillRect(tile.x, tile.y, tileSize, tileSize);
        ctx.strokeStyle = '#202e22'; ctx.lineWidth = 2; ctx.strokeRect(tile.x, tile.y, tileSize, tileSize);

        if (tile.status === 'plantado') {
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(tile.x+25, tile.y+25, 10, 10);
        } else if (tile.status === 'maduro') {
            ctx.fillStyle = '#e74c3c'; // Fruto maduro vermelho (tomate/maçã)
            ctx.beginPath(); ctx.arc(tile.x+30, tile.y+30, 12, 0, Math.PI*2); ctx.fill();
        }
    }

    // Desenha Fazendeiro
    ctx.fillStyle = player.color;
    ctx.beginPath(); ctx.arc(player.x, player.y, player.size, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(player.x, player.y, player.size/2, 0, Math.PI*2); ctx.fill();
}

function gameLoop() {
    if (gameActive) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}
