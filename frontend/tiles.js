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
        //renderMapHierarchy(mapData);
        return mapData;
    } catch (error) {
        console.error("Error loading map details:", error);
    }
}

function renderMapHierarchy(map) {
    const container = document.createElement("div");
    container.classList.add("tile-container-details");

    const tileMap = new Map();
    map.tiles.forEach(tile => {
        tileMap.set(tile.id, tile);
        tile.children = [];
    });

    map.tiles.forEach(tile => {
        if (tile.parent && tileMap.has(tile.parent)) {
            tileMap.get(tile.parent).children.push(tile);
        }
    });

    function createTileElement(tile) {
        const tileDiv = document.createElement("div");
        tileDiv.classList.add("tile-details");
        tileDiv.innerHTML = `
            <h3>${tile.name}</h3>
        `;

        if (tile.children.length > 0) {
            const childrenContainer = document.createElement("div");
            childrenContainer.classList.add("children");
            tile.children.forEach(child => {
                childrenContainer.appendChild(createTileElement(child));
            });
            tileDiv.appendChild(childrenContainer);
        }

        return tileDiv;
    }

    map.tiles
        .filter(tile => !tile.parent || !tileMap.has(tile.parent))
        .forEach(rootTile => {
            container.appendChild(createTileElement(rootTile));
        });

    document.getElementById("content-details").appendChild(container);
}

async function deleteMap(mapId) {
    console.trace();
    try {
        const response = await fetch(`${baseURL}/map/${mapId}/`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            method: "DELETE",
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Could not delete map: ${response.status} - ${errorText}`);
        }

        console.log(`Map ${mapId} deleted successfully`);
        return true;


    } catch (error) {
        console.error("Error deleting map:", error);
        return false;
    }
}


function generateTiles() {
    fetchMapDetails(mapId).then((mapData) => {
        const data = mapData.tiles.map(tile => {
            return {
                y: tile.position_x,
                x: tile.position_y,
            }
        });

        data.sort((a, b) => {
            if (a.x !== b.x) {
                return a.x - b.x;
            }
            return a.y - b.y;
        });

        const names = mapData.tiles.map(tile => tile.name);
        let storage = [];
        let currentRow = 0;

        const info = data.reduce(
            (acc, crd) => {
                if (crd.x > currentRow) {
                    acc.push(storage);
                    storage = [];
                    currentRow = crd.x;
                }
                storage.push(crd.y);
                return acc;
            },
            []
        )
        info.push(storage);

        let renderedBoxes = 0;
        const board = document.querySelector("#board");
        for (let r = 0; r < info.length; r++) {
            let row = document.createElement("div");
            row.classList.add("row");
            const rowWidth = Math.max(...info[r]) + 1;
            for (let n = 0; n < rowWidth; n++) {
                const box = document.createElement("div");
                box.classList.add("box");
                if (!info[r].includes(n)) {
                    box.classList.add("hidden");
                }
                else {
                    box.textContent = names[renderedBoxes];
                    renderedBoxes++;
                }
                row.appendChild(box);
            }
            board.appendChild(row);
        }
    })
}

window.onload = async function () {
    token = await getToken();

    if (token) {
        console.log("Token obtained successfully");
    } else {
        console.log("Failed to obtain token");
    };

    mapId = getMapIdFromURL();
    if (mapId) {
        fetchMapDetails(mapId);
    };

    const deleteButton = document.getElementById('deleteButton');
    deleteButton.addEventListener('click', async function () {
        if (await deleteMap(mapId)) {
            window.location.href = 'index.html';
        }
    });
    generateTiles();
}