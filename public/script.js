async function getTubes(){
    return fetch("/tubes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    }).then(data => data.json()).then(data => {
        return data;
    }).catch(err => {
        console.log(err);
    });
}