// ==========================================
// OWNER LOGIN
// ==========================================

const ownerData =
    localStorage.getItem("ownerLogin");


if (!ownerData) {

    alert(
        "Owner login session not found."
    );

    window.location.href =
        "owner-login.html";

} else {

    const owner =
        JSON.parse(ownerData);


    if (!owner || !owner.ownerId) {

        localStorage.removeItem(
            "ownerLogin"
        );

        window.location.href =
            "owner-login.html";

    } else {

        document.getElementById(
            "ownerWelcome"
        ).innerHTML =
            "👋 Welcome " +
            (
                owner.name ||
                owner.username ||
                "ఓనర్"
            );

    }

}


// ==========================================
// OPEN MORNING / EVENING
// ==========================================

function openSession(day, session) {

    window.location.href =
        "day-customers.html?day=" +
        day +
        "&session=" +
        session;

}


// ==========================================
// LOGOUT
// ==========================================

function logoutOwner() {

    localStorage.removeItem(
        "ownerLogin"
    );

    window.location.href =
        "owner-dashboard.html";

}