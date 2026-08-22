import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const ownerWelcome =
    document.getElementById("ownerWelcome");

const ownerData =
    JSON.parse(
        localStorage.getItem("ownerLogin")
    );

if (ownerData && ownerData.name) {

    ownerWelcome.innerText =
        `👋 Hi ${ownerData.name}`;

}

window.logout = function () {

    localStorage.removeItem("ownerLogin");

    window.location.href = "owner-login.html";

};

window.openDailySheet = function () {

    window.location.href = "staff-daily-sheet.html";

}