import {
    db,
    auth
} from "./firebase-config.js";


// ==============================
// SHOW OWNER / STAFF NAME
// ==============================

const welcomeText =
    document.getElementById("welcomeText");


if (welcomeText) {

    // Default
    welcomeText.innerText = "Hi 👋";


    // Check Owner Login
    const ownerLoginData =
        localStorage.getItem("ownerLogin");


    // Check Staff Login
    const staffLoginData =
        localStorage.getItem("staffLogin");


    if (ownerLoginData) {

        try {

            const owner =
                JSON.parse(ownerLoginData);


            if (owner && owner.name) {

                welcomeText.innerText =
                    `Hi ${owner.name} 👋`;

            }

        } catch (error) {

            console.log(
                "Invalid owner login data"
            );

            localStorage.removeItem(
                "ownerLogin"
            );

        }

    }

    else if (staffLoginData) {

        try {

            const staff =
                JSON.parse(staffLoginData);


            if (staff && staff.name) {

                welcomeText.innerText =
                    `Hi ${staff.name} 👋`;

            }

        } catch (error) {

            console.log(
                "Invalid staff login data"
            );

            localStorage.removeItem(
                "staffLogin"
            );

        }

    }

}


// =====================================
// OWNER LOGIN
// =====================================

window.ownerLogin = function () {

    window.location.href =
        "owner-login.html";

};


// =====================================
// STAFF LOGIN
// =====================================

window.staffLogin = function () {

    window.location.href =
        "staff-login.html";

};


// =====================================
// CREATE ACCOUNT
// =====================================

window.createAccount = function () {

    window.location.href =
        "create-account.html";

};