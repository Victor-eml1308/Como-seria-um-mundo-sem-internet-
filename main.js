* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Courier New', Courier, monospace; /* Trazendo um ar mais rústico/terminal */
    user-select: none;
}

body {
    background-color: #111a13;
    color: #e0e6e1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
}

/* Telas Básicas */
.screen {
    background-color: #202e22;
    padding: 40px;
    border-radius: 8px;
    border: 2px solid #5c8261;
    text-align: center;
    max-width: 500px;
}
.screen h1 { color: #f1c40f; margin-bottom: 20px; }
.screen p { margin-bottom: 25px; line-height: 1.5; }

button {
    background-color: #4a674e;
    color: white;
    border: 2px solid #81b689;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.2s;
    border-radius: 4px;
}
button:hover { background-color: #5c8261; }
.hidden { display: none !important; }

/* Interface do Jogo */
#game-container { position: relative; display: flex; flex-direction: column; align-items: center; }

#status-panel {
    background: #202e22;
    width: 800px;
    border: 4px solid #38512e;
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.economy { font-size: 18px; color: #f1c40f; font-weight: bold; }
.obj-text { color: #81b689; font-size: 14px; margin: 0 10px; }
progress { width: 150px; height: 12px; accent-color: #f1c40f; }

.canvas-wrapper { position: relative; }
#gameCanvas {
    background-color: #4b6b3e;
    border-left: 4px solid #38512e;
    border-right: 4px solid #38512e;
}

/* Legendas */
#subtitles {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.75);
    color: #fff;
    padding: 12px 25px;
    border-radius: 4px;
    font-size: 16px;
    text-align: center;
    max-width: 90%;
    animation: fadeIn 0.5s;
    pointer-events: none;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* HUD Inferior */
#hud {
    background-color: #202e22;
    width: 800px;
    border: 4px solid #38512e;
    border-top: none;
    border-radius: 0 0 8px 8px;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.controls-info h4, .inventory-container h4 { color: #81b689; margin-bottom: 5px; font-size: 14px; }
.controls-info p { font-size: 12px; color: #a8b8aa; margin-bottom: 2px; }

/* Inventário */
.inventory-slots { display: flex; gap: 10px; margin-top: 5px; }
.slot {
    background-color: #111a13; border: 2px solid #455e49; border-radius: 4px;
    width: 90px; height: 60px;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    position: relative;
}
.slot.active { border-color: #f1c40f; background-color: #2c3e2e; }
.slot .key { position: absolute; top: 2px; left: 4px; font-size: 12px; color: #7f8c8d; }
.slot .name { font-size: 12px; font-weight: bold; }
.slot .count { font-size: 12px; color: #bdc3c7; margin-top: 2px;}

/* Modais (Mercado e Baú) */
.modal {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex; justify-content: center; align-items: center;
    z-index: 10;
}
.modal-content {
    background: #202e22; padding: 30px; border: 3px solid #f1c40f;
    border-radius: 8px; text-align: center; width: 400px;
}
.modal-content h2 { color: #f1c40f; margin-bottom: 10px; }
.modal-content p { margin-bottom: 20px; font-size: 14px; }
.market-actions, .chest-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.chest-item { display: flex; justify-content: space-between; align-items: center; background: #111a13; padding: 10px; border-radius: 4px; border: 1px solid #455e49; }
.close-btn { background-color: #c0392b; border-color: #e74c3c; width: 100%; }
.close-btn:hover { background-color: #e74c3c; }
