const baseURL = "http://localhost:8000/api";

let token;

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

async function postUser(email, username, password) {
    try {
        const response = await fetch(`${baseURL}/user/users/`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                email: email,
                username: username,
                password: password,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Could not add new user: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("User created:", data);
        return data;

    } catch (error) {
        console.error("Error adding new user:", error);
        return null;
    }
}

async function getUser(id) {
    try {
        const response = await fetch(`${baseURL}/user/users/${id}/`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Could not read user data: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.username;

    } catch (error) {
        console.error("Error adding new user:", error);
        return null;
    }
}

async function fetchMaps() {
    try {
        const response = await fetch(`${baseURL}/map/`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });


        if (!response.ok) {
            throw new Error(`Error fetching maps: ${response.status}`);
        }
        const maps = await response.json();

        const container = document.querySelector(".tile-container");

        maps.forEach(map => {
            const tile = document.createElement("div");
            getUser(map.id).then(username => {
                tile.classList.add("tile");
                tile.innerHTML = `
                <a href="details.html?id=${map.id}" data-id="${map.id}">
                    <h3>${map.name}</h3>
                    <p>Created by ${username}</p>
                    <p>Date created: ${new Date(map.creation_date).toLocaleDateString()}</p>
                </a>
            `;
                container.appendChild(tile);
            })
        });

    } catch (error) {
        console.error("Error loading maps:", error);
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
        renderMapHierarchy(mapData);
    } catch (error) {
        console.error("Error loading map details:", error);
    }
}

function renderMapHierarchy(map) {
    const container = document.createElement("div");
    container.classList.add("tile-tree-details");

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
            <p>${tile.description}</p>
            <p><small>(${tile.position_x}, ${tile.position_y})</small></p>
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

window.onload = async function () {
    token = await getToken();

    if (token) {
        console.log("Token obtained successfully");
    } else {
        console.log("Failed to obtain token");
    }

    const registerButton = document.getElementById('registerFormButton');
    if (registerButton) {
        registerButton.addEventListener('click', handleRegisterClick);
    }
    fetchMaps();
    const mapId = getMapIdFromURL();
    if (mapId) {
        fetchMapDetails(mapId);
    };

    async function handleRegisterClick(event) {
        event.preventDefault();

        const emailInput = document.getElementById('email');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (emailInput && usernameInput && passwordInput) {
            const email = emailInput.value.trim();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (email && username && password) {
                const result = await postUser(email, username, password);

                if (result) {
                    const loginButton = document.getElementById('loginButt');
                    const registerButton = document.getElementById('registerButt');

                    if (loginButton) {
                        loginButton.remove();
                    }
                    if (registerButton) {
                        registerButton.remove();
                    }
                    console.log("Użytkownik zarejestrowany pomyślnie!");
                    window.location.href = 'index.html';
                } else {
                    console.error("Rejestracja nieudana");
                }
            } else {
                alert("Proszę wypełnić oba pole email, nazwę użytkownika i hasło.");
            }
        }
    }
}
