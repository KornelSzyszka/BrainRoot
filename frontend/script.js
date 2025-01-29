const baseURL = "http://localhost:8000/api";

fetch(`${baseURL}/user/users`, {
    headers: {
        "Content-Type": "application/json",
    },
})
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not fetch resource");
        }
    })
    .then(data => console.log(data))
    .catch(error => console.error(error));