// Set up the canvas
const canvas = document.getElementById('organismCanvas');
const ctx = canvas.getContext('2d');

// Set larger virtual canvas size
const virtualWidth = 3000;
const virtualHeight = 2000;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Zoom and pan variables
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;

// Display total organisms and notification
const organismCountDisplay = document.getElementById('organismCount');
const CycleCountDisplay = document.getElementById('cycleCounter');
const notification = document.getElementById('notification');

// Organism parameters
let organisms = [];
let organismSize = 10;
let aliveOrganisms = 0;
let bob = 0;
let familyIDCounter = 0;  // Family ID counter for unique family identifiers
let organismCount = 50;
let cyclesBetweenUpdates = 1;
let cycleCounter = 0;

// Disease parameters
let diseaseTriggered = false;
let diseaseInterval = 500; // How often to check for disease (in cycles)
let diseaseChance = 0.5;   // 5% chance per cycle to trigger a disease
let lastDiseaseCycle = 0;
let diseaseRadius = 500;    // How far the disease spreads from the original infected organism

// Utility function to generate color based on traits
function traitBasedColor(tribe, birthRate, mobility) {
    const r = Math.floor((tribe / 255) * 255);        // Tribe value controls red component
    const g = Math.floor((birthRate / 255) * 255);    // Birth rate value controls green component
    const b = Math.floor((mobility / 255) * 255);     // Mobility value controls blue component
    return `rgb(${r},${g},${b})`;  // Return the color based on traits
}

// Population Density Effect Function (same as original)
function populationDensityEffect(aliveOrganisms) {
    return (-0.5 * (((2 ** (0.01 * (aliveOrganisms - 5000))) - 1) / ((2 ** (0.01 * (aliveOrganisms - 5000))) + 1))) + 0.5;
}

// Organism class
class Organism {
    constructor(id, x, y, health, tribe, birthRate, mobility, color, familyID) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.health = health;
        this.tribe = tribe;
        this.birthRate = birthRate;
        this.mobility = mobility;
        this.color = color;
        this.familyID = familyID;  // Family ID to prevent parent-child fights
        this.age = 0;
        this.alive = true;
        this.nextKid = 510 - birthRate;
        this.kidCooldown = 0;
    }

    move() {
        const moveX = Math.random() * this.mobility - (this.mobility / 2);
        const moveY = Math.random() * this.mobility - (this.mobility / 2);
        this.x += moveX / 2;
        this.y += moveY / 2;

        // Wrapping behavior: organism moves to opposite side if it crosses boundary
        if (this.x < 0) this.x = virtualWidth;
        if (this.x > virtualWidth) this.x = 0;
        if (this.y < 0) this.y = virtualHeight;
        if (this.y > virtualHeight) this.y = 0;
    }

    draw() {
        if (this.alive) {
            ctx.beginPath();
            ctx.arc(
                (this.x - offsetX) * scale,
                (this.y - offsetY) * scale,
                (organismSize / 2) * scale,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }

    ageOrganism() {
        this.age++;
        if (this.age > 500 || this.health <= 0) {
            this.alive = false;
        }
    }

    reproduce() {
        if (this.age >= this.nextKid && this.kidCooldown === 0) {
            const childX = this.x;
            const childY = this.y;
            const childTribe = this.tribe + randomMutation();
            const childBirthRate = this.birthRate + randomMutation();
            const childMobility = this.mobility + randomMutation();

            const childColor = traitBasedColor(childTribe, childBirthRate, childMobility);

            const newOrganism = new Organism(
                bob++,
                childX,
                childY,
                100,
                Math.min(Math.max(0, childTribe), 255),
                Math.min(Math.max(0, childBirthRate), 255),
                Math.min(Math.max(0, childMobility), 255),
                childColor,
                this.familyID  // Pass the family ID to the child
            );
            organisms.push(newOrganism);
            aliveOrganisms++;
            this.kidCooldown = 20; // Cooldown before next reproduction
        } else if (this.kidCooldown > 0) {
            this.kidCooldown--;
        }
    }

    checkDeath() {
        // Calculate the population density effect
        const popDensityEffect = populationDensityEffect(aliveOrganisms);
        
        const lifeChance = Math.floor(5000 * popDensityEffect * (275 / (this.tribe + this.birthRate + this.mobility)));
        const dead = Math.random() * lifeChance < 1;
        if (dead) {
            this.alive = false;
        }
    }

    applyDiseaseEffect(mortality) {
        this.health -= mortality;
        if (this.health <= 0) {
            this.alive = false;
        }
    }

    // Function to calculate distance to another organism
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return dx * dx + dy * dy;
    }

    // Function to handle tribe-based survival with family protection
    fight(other) {
        if (this.distanceTo(other) <= organismSize * organismSize) {  // Check if they are touching
            if ((this.tribe - other.tribe) * (this.tribe - other.tribe) > 75 && this.tribe > other.tribe && this.tribe > 150) {
                other.alive = false;  // The one with the lower tribe value dies
            } else if ((this.tribe - other.tribe) * (this.tribe - other.tribe) > 75 && this.tribe < other.tribe && this.tribe > 150) {
                this.alive = false;  // If the other organism has a higher tribe, this one dies
            }
        }
    }
}

// Generate a random mutation
function randomMutation() {
    return Math.floor((Math.random() - 0.5) * 20);  // Smaller mutation range (-10 to +10)
}

// Show a disease notification
function showDiseaseNotification() {
    notification.style.display = 'block';
    notification.textContent = "A disease has started!";
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000); // Hide notification after 5 seconds
}

// Randomly trigger a disease with a higher effect in densely populated areas
function triggerDiseaseInDenseAreas() {
    const infectedIndex = Math.floor(Math.random() * organisms.length);
    const infectedOrganism = organisms[infectedIndex]; // Start infection with a random organism
    const severity = Math.random() * 13000;  // How much health to reduce

    organisms.forEach(organism => {
        const distance = infectedOrganism.distanceTo(organism);
        if (distance <= diseaseRadius) {
            const infectionChance = 1 - (distance / diseaseRadius);  // Closer organisms are more affected
            if (Math.random() < infectionChance) {
                organism.applyDiseaseEffect(severity * infectionChance);  // Scale effect based on closeness
            }
        }
    });

    // Notify the user and log the event in the console
    showDiseaseNotification();
    console.log(`Disease started from organism ${infectedIndex} and spread to nearby organisms.`);
}

// Create initial organisms
function createOrganisms() {
    organisms = [];
    bob = 0;
    aliveOrganisms = organismCount;

    for (let i = 0; i < organismCount; i++) {
        let x = Math.random() * virtualWidth;
        let y = Math.random() * virtualHeight;
        let health = 100;
        let tribe = Math.random() * 255;
        let birthRate = Math.random() * 255;
        let mobility = Math.random() * 255;
        let color = traitBasedColor(tribe, birthRate, mobility); // Assign color based on traits
        let familyID = familyIDCounter++;  // Each organism starts with a unique family ID
        organisms.push(new Organism(i, x, y, health, tribe, birthRate, mobility, color, familyID));
    }
}

// Update organism count display
function updateOrganismCountDisplay() {
    organismCountDisplay.textContent = aliveOrganisms;
}

function updateCycleCountDisplay() {
    CycleCountDisplay.textContent = cycleCounter;
}

// Handle zoom based on mouse position
canvas.addEventListener('wheel', function(event) {
    event.preventDefault();
    
    const zoomAmount = 0.1;
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Calculate canvas coordinates for the mouse position
    const canvasX = (mouseX - offsetX) / scale;
    const canvasY = (mouseY - offsetY) / scale;

    // Adjust zoom
    if (event.deltaY < 0) {
        scale += zoomAmount;
    } else {
        scale -= zoomAmount;
    }
    scale = Math.min(Math.max(0.2, scale), 5); // Limit zoom

    // Adjust offsetX and offsetY to center the zoom around the mouse
    offsetX = mouseX - canvasX * scale;
    offsetY = mouseY - canvasY * scale;
});

// Pan start (mouse down)
canvas.addEventListener('mousedown', function(event) {
    isPanning = true;
    startPanX = event.clientX;
    startPanY = event.clientY;
});

// Pan move (mouse move)
canvas.addEventListener('mousemove', function(event) {
    if (isPanning) {
        offsetX -= (event.clientX - startPanX) / scale;
        offsetY -= (event.clientY - startPanY) / scale;
        startPanX = event.clientX;
        startPanY = event.clientY;
    }
});

// Pan end (mouse up)
canvas.addEventListener('mouseup', function() {
    isPanning = false;
});

canvas.addEventListener('mouseleave', function() {
    isPanning = false;
});

// Update the simulation
function updateSimulation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check for fights between organisms
    for (let i = 0; i < organisms.length; i++) {
        for (let j = i + 1; j < organisms.length; j++) {
            if (organisms[i].alive && organisms[j].alive) {
                organisms[i].fight(organisms[j]);  // Check for fight based on tribe, but exclude family members
            }
        }
    }

    organisms.forEach((organism) => {
        if (organism.alive) {
            organism.move();
            organism.draw();
            organism.ageOrganism();
            organism.reproduce();
            organism.checkDeath();
        }
    });

    // Remove dead organisms from the array
    organisms = organisms.filter(o => o.alive);
    aliveOrganisms = organisms.length;

    // Randomly trigger a disease
    if (cycleCounter - lastDiseaseCycle >= diseaseInterval) {
        triggerDiseaseInDenseAreas();
        lastDiseaseCycle = cycleCounter; // Update the cycle count for the last triggered disease
    }

    // Update the total organism count display
    updateOrganismCountDisplay();
    updateCycleCountDisplay();

    // Loop the update
    cycleCounter++;
    if (cycleCounter % cyclesBetweenUpdates == 0) {
        requestAnimationFrame(updateSimulation);
    } else {
        updateSimulation();
    }


}

// Start the simulation
createOrganisms();
updateSimulation();
