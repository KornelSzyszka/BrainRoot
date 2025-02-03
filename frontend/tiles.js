const baseURL = "http://localhost:8000/api";

let token;
let mapId;

async function getToken() {
    try {
        const response = await fetch(`${baseURL}/token/`, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                "username": "admin",
                "password": "admin",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Could not fetch token: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        if (!data || !data.access) {
            throw new Error("Invalid token response: Missing 'access' token.");
        }

        return data.access;
    } catch (error) {
        console.error("Error fetching token:", error);
        return null;
    }
}

function getMapIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function fetchMapDetails(mapId) {
    try {
        const response = await fetch(`${baseURL}/map/${mapId}/`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) throw new Error(`Error fetching map details: ${response.status}`);

        const mapData = await response.json();
        return mapData;
    } catch (error) {
        console.error("Error loading map details:", error);
    }
}

function generateTiles() {
    fetchMapDetails(mapId).then((mapData) => {
        const data = mapData.tiles.map(tile => ({
            y: tile.position_x,
            x: tile.position_y,
            name: tile.name,
            description: tile.description
        }));

        data.sort((a, b) => {
            if (a.x !== b.x) {
                return a.x - b.x;
            }
            return a.y - b.y;
        });

        let storage = [];
        let currentRow = 0;

        const info = data.reduce((acc, crd) => {
            if (crd.x > currentRow) {
                acc.push(storage);
                storage = [];
                currentRow = crd.x;
            }
            storage.push(crd);
            return acc;
        }, []);
        info.push(storage);

        const board = document.querySelector("#board");
        board.innerHTML = ""; // Czyszczenie poprzednich elementów

        for (let r = 0; r < info.length; r++) {
            let row = document.createElement("div");
            row.classList.add("row");
            const rowWidth = Math.max(...info[r].map(item => item.y)) + 1;

            for (let n = 0; n < rowWidth; n++) {
                const box = document.createElement("div");
                box.classList.add("box");

                const tile = info[r].find(item => item.y === n);
                if (!tile) {
                    box.classList.add("hidden");
                } else {
                    box.textContent = tile.name;
                    box.dataset.index = n; // Dodanie indeksu dla poprawnego przypisania eventu
                }
                row.appendChild(box);
            }
            board.appendChild(row);
        }

        // Po utworzeniu kafelków, przypisujemy do nich eventy
        setupTileClickEvents(mapData);
    });
}

function setupTileClickEvents(mapData) {
    const modal = document.getElementById("customAlert");
    const closeButton = document.querySelector(".close-btn");
    const tileNameElem = document.getElementById("tileName");
    const tileDescriptionElem = document.getElementById("tileDescription");

    document.querySelectorAll(".box").forEach((box) => {
        box.addEventListener("click", () => {
            const tile = mapData.tiles.find(t => t.name === box.textContent);
            if (tile) {
                tileNameElem.textContent = tile.name;
                tileDescriptionElem.textContent = tile.description;
                modal.style.display = "flex"; // Pokazujemy modal
            }
        });
    });

    closeButton.addEventListener("click", () => {
        modal.style.display = "none"; // Ukrywamy modal
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}

function setupModal() {
    const modal = document.getElementById("customAlert");
    const closeButton = document.querySelector(".close-btn");
    const tileNameElem = document.getElementById("tileName");
    const tileDescriptionElem = document.getElementById("tileDescription");

    // Create modal styles
    const modalStyles = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.7);
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    // Apply modal styles
    modal.setAttribute('style', modalStyles);

    // Create modal content styles
    const modalContentStyles = `
        background: #222;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        max-width: 500px;
        color: white;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        position: relative;
    `;

    // Apply modal content styles
    const modalContent = document.querySelector('.modal-content');
    modalContent.setAttribute('style', modalContentStyles);

    // Add close button styles
    const closeBtnStyles = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #8B0A1A;
        color: white;
        border: none;
        padding: 5px 10px;
        font-size: 10px;
        cursor: pointer;
        border-radius: 5px;
        width: 10px;
        height: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    // Apply close button styles
    closeButton.setAttribute('style', closeBtnStyles);

    closeButton.addEventListener("mouseover", () => {
        closeButton.style.backgroundColor = "#BF0F32";
    });

    closeButton.addEventListener("mouseout", () => {
        closeButton.style.backgroundColor = "#8B0A1A";
    });

    // Event listeners
    closeButton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}

window.onload = async function () {
    token = await getToken();

    if (token) {
        console.log("Token obtained successfully");
    } else {
        console.log("Failed to obtain token");
    }

    mapId = getMapIdFromURL();
    if (mapId) {
        fetchMapDetails(mapId).then((mapData) => {
            generateTiles();
        });
    }

    const deleteButton = document.getElementById('deleteButton');
    deleteButton.addEventListener('click', async function () {
        if (await deleteMap(mapId)) {
            window.location.href = 'index.html';
        }
    });
    setupModal();
};
