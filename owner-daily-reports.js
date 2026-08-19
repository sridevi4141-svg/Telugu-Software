import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const container =
    document.getElementById("staffContainer");


// =================================================
// GET LOGGED-IN OWNER
// =================================================

function getOwnerId() {

    const ownerLogin =
        localStorage.getItem("ownerLogin");


    if (!ownerLogin) {

        window.location.href =
            "owner-login.html";

        return null;
    }


    try {

        const ownerData =
            JSON.parse(ownerLogin);


        if (!ownerData.ownerId) {

            alert(
                "Owner ID not found. Please login again."
            );

            localStorage.removeItem("ownerLogin");

            window.location.href =
                "owner-login.html";

            return null;
        }


        return ownerData.ownerId;


    } catch (error) {

        console.error(
            "Owner Login Data Error:",
            error
        );

        localStorage.removeItem("ownerLogin");

        window.location.href =
            "owner-login.html";

        return null;
    }

}


// =================================================
// LOAD STAFF
// =================================================

async function loadStaff() {

    container.innerHTML = "";


    const today =
        new Date().toISOString().split("T")[0];


    try {

        // =================================================
        // CURRENT OWNER ID
        // =================================================

        const ownerId =
            getOwnerId();


        if (!ownerId) {
            return;
        }


        console.log(
            "Loading Staff for Owner:",
            ownerId
        );


        // =================================================
        // GET ONLY CURRENT OWNER STAFF
        // =================================================

        const staffQuery =
            query(
                collection(db, "staff"),
                where("ownerId", "==", ownerId)
            );


        const staffSnapshot =
            await getDocs(staffQuery);


        // =================================================
        // NO STAFF
        // =================================================

        if (staffSnapshot.empty) {

            container.innerHTML = `
                <h3 style="text-align:center;color:red;">
                    No Staff Found
                </h3>
            `;

            return;
        }


        // =================================================
        // STAFF LOOP
        // =================================================

        for (
            const docSnap
            of staffSnapshot.docs
        ) {

            const staff =
                docSnap.data();


            // =================================================
            // DAILY SHEET
            // =================================================

            const dailyQuery =
                query(

                    collection(db, "dailySheets"),

                    where(
                        "staffUser",
                        "==",
                        staff.username
                    ),

                    where(
                        "date",
                        "==",
                        today
                    )

                );


            const dailySnapshot =
                await getDocs(dailyQuery);


            let status =
                "🔴 Pending";

            let color =
                "red";


            // =================================================
            // DAILY SHEET SAVED
            // =================================================

            if (!dailySnapshot.empty) {

                status =
                    "🟢 Completed";

                color =
                    "green";

            }


            // =================================================
            // STAFF CARD
            // =================================================

            container.innerHTML += `

            <div
                class="staff-card"
                onclick="openReport('${staff.username}')"
            >

                <div style="font-size:65px;">
                    👨‍💼
                </div>


                <h3>
                    ${staff.name || ""}
                </h3>


                <p>
                    ${staff.username || ""}
                </p>


                <div style="
                    margin-top:10px;
                    font-weight:bold;
                    color:${color};
                ">
                    ${status}
                </div>

            </div>

            `;

        }


    } catch (error) {

        console.error(
            "Load Staff Error:",
            error
        );


        container.innerHTML = `
            <h3 style="
                color:red;
                text-align:center;
            ">
                Failed to Load Staff
            </h3>
        `;

    }

}


// =================================================
// OPEN STAFF REPORT
// =================================================

window.openReport =
function (username) {

    window.location.href =
        "staff-report.html?staff=" +
        encodeURIComponent(username);

};


// =================================================
// LOAD STAFF
// =================================================

loadStaff();