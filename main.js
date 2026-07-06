const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Telas do Fluxo do Jogo
const mainMenu = document.getElementById('main-menu');
const storyScreen = document.getElementById('story-screen');
const gameContainer = document.getElementById('game-container');
const victoryScreen = document.getElementById('victory-screen');

// Estado do Jogo
let gameActive = false;
let currentItemIdx = 0; // 0 = Enxada, 1 = Sementes, 2 = Colheita

// Inventário (Valores atuais)
let inventory = {
    seeds: 3,
    crops: 0
};

// Objetivos quantificados
let progress = { plowed: 0, planted: 0, harvested: 0 };

// Configuração do Jogador (Fazendeiro)
const player = {
    x: 400,
    y: 300,
    size: 24,
    speed: 4,
    color: '#e67e22' // Cor alaranjada para roupas de trabalho
};

// Teclas pressionadas
const keys = {};

// Configuração dos Lotes de Terra (Grades de plantação estáticas no centro)
// Estados do lote: 'grama', 'arado', 'plantado', 'maduro'
const tiles = [];
const tileSize = 60;
const startGridX = 310;
const startGridY = 220;
const rows = 3;
const cols = 3;

function initGrid() {
    tiles.length = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            tiles.push({
                x: startGridX + c * (tileSize + 10),
                y: startGridY + r * (tileSize + 10),
                status: 'grama',
                growthTimer: 0
            });
        }
    }
}

// Navegação de Telas
function showStory() {
    mainMenu.classList.add('hidden');
    storyScreen.classList.remove('hidden');
}

function startGame() {
    storyScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    
    // Reset de variáveis
    inventory.seeds = 3;
    inventory.crops = 0;
    progress.plowed = 0; progress.planted = 0; progress.harvested = 0;
    player.x = 400; player.y = 450;
    currentItemIdx = 0;
    
    initGrid();
    updateUI();
    gameActive = true;
    gameLoop();
}

// Escuta de Input de Teclado
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    keys[e.code] = true; // Captura strings como 'Space'

    // Troca de Inventário pelas Teclas 1, 2, 3
    if (e.key === '1') selectSlot(0);
    if (e.key === '2') selectSlot(1);
    if (e.key === '3') selectSlot(2);

    // Ação com Espaço
    if (e.code === 'Space' && gameActive) {
        e.preventDefault();
        interactWithTile();
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

function updateUI() {
    document.getElementById('count-seeds').innerText = `${inventory.seeds}/3`;
    document.getElementById('count-crops').innerText = `${inventory.crops}/3`;

    // Atualização visual dos objetivos
    const objPlow = document.getElementById('obj-plow');
    const objPlant = document.getElementById('obj-plant');
    const objHarvest = document.getElementById('obj-harvest');

    objPlow.innerText = `Preparar a terra com a Enxada (${progress.plowed}/3)`;
    if (progress.plowed >= 3) {
        objPlow.classList.add('done');
        objPlant.classList.remove('locked');
    }

    objPlant.innerText = `Plantar as sementes (${progress.planted}/3)`;
    if (progress.planted >= 3) {
        objPlant.classList.add('done');
        objHarvest.classList.remove('locked');
    }

    objHarvest.innerText = `Colher o alimento maduro (${progress.harvested}/3)`;
    if (progress.harvested >= 3) {
        objHarvest.classList.add('done');
        setTimeout(endGame, 1000);
    }
}

// Lógica de Interação de Ações na Fazenda
function interactWithTile() {
    // Encontra se o jogador está em cima de algum lote de terra
    let touchedTile = null;
    for (let tile of tiles) {
        if (player.x + player.size/2 > tile.x && player.x - player.size/2 < tile.x + tileSize &&
            player.y + player.size/2 > tile.y && player.y - player.size/2 < tile.y + tileSize) {
            touchedTile = tile;
            break;
        }
    }

    if (!touchedTile) return;

    // Ação dependendo do item equipado
    if (currentItemIdx === 0) { // ENXADA
        if (touchedTile.status === 'grama' && progress.plowed < 3) {
            touchedTile.status = 'arado';
            progress.plowed++;
            updateUI();
        }
    } 
    else if (currentItemIdx === 1) { // SEMENTES
        if (touchedTile.status === 'arado' && inventory.seeds > 0 && progress.planted < 3) {
            touchedTile.status = 'plantado';
            touchedTile.growthTimer = 180; // Aproximadamente 3 segundos a 60fps
            inventory.seeds--;
            progress.planted++;
            updateUI();
        }
    } 
    else if (currentItemIdx === 2) { // COLHEITA (Mão/Cesto)
        if (touchedTile.status === 'maduro' && inventory.crops < 3) {
            touchedTile.status = 'grama'; // Volta a ser grama normal após colher
            inventory.crops++;
            progress.harvested++;
            updateUI();
        }
    }
}

// Atualização de Estados Físicos e Lógica
function update() {
    // Movimentação do Personagem
    if (keys['w'] || keys['arrowup']) player.y -= player.speed;
    if (keys['s'] || keys['arrowdown']) player.y += player.speed;
    if (keys['a'] || keys['arrowleft']) player.x -= player.speed;
    if (keys['d'] || keys['arrowright']) player.x += player.speed;

    // Limites de borda do Canvas
    if (player.x < player.size) player.x = player.size;
    if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
    if (player.y < player.size) player.y = player.size;
    if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;

    // Atualização do Crescimento das plantas
    for (let tile of tiles) {
        if (tile.status === 'plantado') {
            tile.growthTimer--;
            if (tile.growthTimer <= 0) {
                tile.status = 'maduro';
            }
        }
    }
}

// Renderização Gráfica do Cenário, Lotes e Personagem
function draw() {
    // Limpa a tela com o verde base do campo
    ctx.fillStyle = '#557a46';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a Área Delimitada da Fazendinha Central
    ctx.strokeStyle = '#3e5933';
    ctx.lineWidth = 4;
    ctx.strokeRect(startGridX - 20, startGridY - 20, (tileSize * cols) + 50, (tileSize * rows) + 50);

    // Desenha os 9 Lotes de Terra
    for (let tile of tiles) {
        if (tile.status === 'grama') {
            ctx.fillStyle = '#658853'; // Grama ligeiramente diferente
        } else if (tile.status === 'arado') {
            ctx.fillStyle = '#8b5a2b'; // Marrom da terra arada
        } else if (tile.status === 'plantado') {
            ctx.fillStyle = '#6e4722'; // Terra úmida com broto inicial
        } else if (tile.status === 'maduro') {
            ctx.fillStyle = '#27ae60'; // Verde vivo (Planta pronta)
        }

        ctx.fillRect(tile.x, tile.y, tileSize, tileSize);
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        ctx.strokeRect(tile.x, tile.y, tileSize, tileSize);

        // Detalhes visuais dos estágios
        if (tile.status === 'plantado') {
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(tile.x + tileSize/2 - 3, tile.y + tileSize/2 - 3, 6, 6);
        } else if (tile.status === 'maduro') {
            // Fruto Amarelo pronto para colher
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(tile.x + tileSize/2, tile.y + tileSize/2, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Desenha o Fazendeiro (Círculo Simples com indicação frontal)
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Detalhe do chapéu de palha do Fazendeiro
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    if (!gameActive) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameActive = false;
    gameContainer.classList.add('hidden');
    victoryScreen.classList.remove('hidden');
}

function restartGame() {
    victoryScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
}
