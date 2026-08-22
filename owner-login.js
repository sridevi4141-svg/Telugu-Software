import { db } from "./firebase-config.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =================================================
// OWNER LOGIN
// =================================================

async function loginOwner() {

    const usernameInput =
        document.getElementById("loginUsername");

    const passwordInput =
        document.getElementById("loginPassword");


    if (!usernameInput || !passwordInput) {

        alert("లాగిన్ ఫీల్డ్స్ కనుగొనబడలేదు");

        return;
    }


    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value.trim();


    if (!username || !password) {

        alert(
            "దయచేసి యూజర్ పేరు మరియు పాస్‌వర్డ్ నమోదు చేయండి"
        );

        return;
    }


    try {

        // =================================================
        // 1. CHECK OLD OWNERS COLLECTION
        // =================================================

        const ownerQuery = query(
            collection(db, "owners"),
            where("username", "==", username)
        );


        const ownerSnapshot =
            await getDocs(ownerQuery);


        if (!ownerSnapshot.empty) {

            const ownerDoc =
                ownerSnapshot.docs[0];

            const owner =
                ownerDoc.data();

            const ownerId =
                ownerDoc.id;


            console.log(
                "OWNER DOCUMENT ID:",
                ownerId
            );

            console.log(
                "OWNER DATA:",
                owner
            );


            // =================================================
            // PASSWORD
            // =================================================

            if (
                !owner.password ||
                String(owner.password) !== String(password)
            ) {

                alert("పాస్‌వర్డ్ తప్పుగా ఉంది");

                return;
            }


            // =================================================
            // SAVE OWNER LOGIN
            // =================================================

            localStorage.setItem(
                "ownerLogin",
                JSON.stringify({

                    ownerId: ownerId,

                    name: owner.name || "",

                    username: owner.username || ""

                })
            );


            alert("లాగిన్ విజయవంతమైంది");


            window.location.href =
                "owner-dashboard.html";

            return;
        }


        // =================================================
        // 2. CHECK ACCOUNT REQUESTS
        // =================================================

        const requestQuery = query(
            collection(db, "accountRequests"),
            where("username", "==", username)
        );


        const requestSnapshot =
            await getDocs(requestQuery);


        if (requestSnapshot.empty) {

            alert(
                "యూజర్ పేరు కనుగొనబడలేదు"
            );

            return;
        }


        // =================================================
        // GET ACCOUNT REQUEST
        // =================================================

        const accountDoc =
            requestSnapshot.docs[0];

        const account =
            accountDoc.data();

        const ownerId =
            accountDoc.id;


        console.log(
            "ACCOUNT REQUEST DOCUMENT ID:",
            ownerId
        );

        console.log(
            "ACCOUNT REQUEST DATA:",
            account
        );


        // =================================================
        // 3. CHECK ACCOUNT STATUS
        // =================================================

        const status =
            String(account.status || "")
                .trim()
                .toLowerCase();


        console.log(
            "ACCOUNT STATUS:",
            status
        );


        // Pending
        if (
            status === "pending approval" ||
            status === "pending"
        ) {

            alert(
                "⏳ Your account is waiting for Boss approval."
            );

            return;
        }


        // Rejected
        if (
            status === "rejected" ||
            status === "తిరస్కరించబడింది"
        ) {

            alert(
                "❌ Your account has been rejected."
            );

            return;
        }


        // =================================================
        // APPROVED
        // Accept both English and Telugu
        // =================================================

        if (
            status !== "approved" &&
            status !== "ఆమోదించబడింది"
        ) {

            alert(
                "Your account is not approved yet."
            );

            return;
        }


        // =================================================
        // 4. CHECK PASSWORD
        // =================================================

        if (
            !account.password ||
            String(account.password) !== String(password)
        ) {

            alert(
                "పాస్‌వర్డ్ తప్పుగా ఉంది"
            );

            return;
        }


        // =================================================
        // 5. LOGIN SUCCESS
        // =================================================

        localStorage.setItem(
            "ownerLogin",
            JSON.stringify({

                ownerId: ownerId,

                name: account.name || "",

                username: account.username || ""

            })
        );


        console.log(
            "OWNER LOGIN SUCCESS:",
            ownerId
        );


        alert(
            "లాగిన్ విజయవంతమైంది"
        );


        window.location.href =
            "owner-dashboard.html";


    } catch (error) {

        console.error(
            "Owner Login Error:",
            error
        );


        alert(
            "Login Failed: " +
            error.message
        );

    }

}


// =================================================
// MAKE FUNCTION AVAILABLE TO HTML
// =================================================

window.loginOwner =
    loginOwner;