const canvas = document.getElementById('pottsCanvas');
const ctx = canvas.getContext('2d');
const size = 100; 
const numStates = 4;
let temperature = 2.0; 
let interactionStrength = 1.0; 
let grid = [];
let animationFrameId;
let isRunning = false;
let speed = 10;
let duration = 30; 
let startTime = 0;

const temperatureInput = document.getElementById('temperature');
const temperatureValue = document.getElementById('temperatureValue');
const interactionStrengthInput = document.getElementById('interactionStrength');
const interactionStrengthValue = document.getElementById('interactionStrengthValue');
const algorithmSelect = document.getElementById('algorithm');
const speedInput = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');
const durationInput = document.getElementById('duration');
const durationValue = document.getElementById('durationValue');
const magnetizationElement = document.getElementById('magnetization');
const energyElement = document.getElementById('energy');
const correlationElement = document.getElementById('correlation');

temperatureInput.addEventListener('input', () => {
    temperatureValue.textContent = temperatureInput.value;
    temperature = parseFloat(temperatureInput.value);
});

interactionStrengthInput.addEventListener('input', () => {
    interactionStrengthValue.textContent = interactionStrengthInput.value;
    interactionStrength = parseFloat(interactionStrengthInput.value);
});

speedInput.addEventListener('input', () => {
    speedValue.textContent = speedInput.value;
    speed = parseInt(speedInput.value, 10);
});

durationInput.addEventListener('input', () => {
    durationValue.textContent = durationInput.value;
    duration = parseInt(durationInput.value, 10);
});

function initializeGrid() {
    grid = [];
    for (let x = 0; x < size; x++) {
        grid[x] = [];
        for (let y = 0; y < size; y++) {
            grid[x][y] = Math.floor(Math.random() * numStates);
        }
    }
}

function drawGrid() {
    const cellSize = canvas.width / size;
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            ctx.fillStyle = `hsl(${(grid[x][y] * 360) / numStates}, 100%, 50%)`;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function metropolisAlgorithm() {
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const state = grid[x][y];
            const newState = Math.floor(Math.random() * numStates);
            const deltaE = calculateEnergyChange(x, y, state, newState);
            if (deltaE < 0 || Math.random() < Math.exp(-deltaE / temperature)) {
                grid[x][y] = newState;
            }
        }
    }
}

function glauberAlgorithm() {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    const state = grid[x][y];
    const newState = Math.floor(Math.random() * numStates);
    const deltaE = calculateEnergyChange(x, y, state, newState);
    if (deltaE < 0 || Math.random() < Math.exp(-deltaE / temperature)) {
        grid[x][y] = newState;
    }
}

function wolffAlgorithm() {
    const xStart = Math.floor(Math.random() * size);
    const yStart = Math.floor(Math.random() * size);
    const initialState = grid[xStart][yStart];
    const stack = [];
    const cluster = new Set();
    stack.push({ x: xStart, y: yStart });
    cluster.add(`${xStart},${yStart}`);

    while (stack.length > 0) {
        const { x, y } = stack.pop();
        const neighbors = [
            { x: (x - 1 + size) % size, y },
            { x: (x + 1) % size, y },
            { x, y: (y - 1 + size) % size },
            { x, y: (y + 1) % size }
        ];

        neighbors.forEach(neighbor => {
            if (grid[neighbor.x][neighbor.y] === initialState && !cluster.has(`${neighbor.x},${neighbor.y}`) && Math.random() < 1 - Math.exp(-interactionStrength / temperature)) {
                stack.push(neighbor);
                cluster.add(`${neighbor.x},${neighbor.y}`);
            }
        });
    }
    cluster.forEach(position => {
        const [x, y] = position.split(',').map(Number);
        grid[x][y] = (grid[x][y] + 1) % numStates;
    });
}

function calculateEnergyChange(x, y, oldState, newState) {
    let deltaE = 0;
    const neighbors = [
        {x: (x - 1 + size) % size, y},
        {x: (x + 1) % size, y},
        {x, y: (y - 1 + size) % size},
        {x, y: (y + 1) % size}
    ];

    neighbors.forEach(neighbor => {
        if (grid[neighbor.x][neighbor.y] === oldState) {
            deltaE -= interactionStrength;
        } else if (grid[neighbor.x][neighbor.y] === newState) {
            deltaE += interactionStrength;
        }
    });

    return deltaE;
}

function calculateMetrics() {
    let magnetization = 0;
    let energy = 0;

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            magnetization += math.divide(grid[x][y] - numStates / 2, size * size);
            const neighbors = [
                {x: (x - 1 + size) % size, y},
                {x: (x + 1) % size, y},
                {x, y: (y - 1 + size) % size},
                {x, y: (y + 1) % size}
            ];
            neighbors.forEach(neighbor => {
                energy -= (grid[x][y] === grid[neighbor.x][neighbor.y]) ? interactionStrength : 0;
            });
        }
    }

    magnetizationElement.textContent = math.format(magnetization, { precision: 3 });
    energyElement.textContent = math.format(energy, { precision: 3 });
    correlationElement.textContent = math.format(calculateCorrelation(), { precision: 3 });
}

function calculateCorrelation() {
    let totalCorrelation = 0;
    let count = 0;

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const neighbors = [
                {x: (x + 1) % size, y},
                {x, y: (y + 1) % size}
            ];

            neighbors.forEach(neighbor => {
                totalCorrelation += (grid[x][y] === grid[neighbor.x][neighbor.y]) ? 1 : 0;
                count++;
            });
        }
    }

    return math.divide(totalCorrelation, count);
}

function update() {
    const algorithm = algorithmSelect.value;
    if (algorithm === 'metropolis') {
        metropolisAlgorithm();
    } else if (algorithm === 'glauber') {
        glauberAlgorithm();
    } else if (algorithm === 'wolff') {
        wolffAlgorithm();
    }

    drawGrid();
    calculateMetrics();

    if (isRunning && (Date.now() - startTime) < duration * 1000) {
        setTimeout(update, speed);
    } else {
        stopSimulation();
    }
}

function startSimulation() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now();
        update();
    }
}

function stopSimulation() {
    isRunning = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

function resetSimulation() {
    stopSimulation();
    initializeGrid();
    drawGrid();
    calculateMetrics();
}

function applySettings() {
    stopSimulation();
    initializeGrid();
    drawGrid();
    calculateMetrics();
}

function saveData(format) {
    let data;
    if (format === 'csv') {
        data = gridToCSV();
        downloadFile('simulation_data.csv', data);
    }
}

function gridToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    grid.forEach(row => {
        csvContent += row.join(",") + "\n";
    });
    return csvContent;
}

function downloadFile(filename, content) {
    const encodedUri = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveSnapshot() {
    const imageData = canvas.toDataURL('image/png');
    downloadFile('snapshot.png', imageData);
}

canvas.width = canvas.height = 500; // Set canvas size to 500x500 for consistency
initializeGrid();
drawGrid();
