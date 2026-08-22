import {
    db,
    auth
} from "./firebase-config.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ===============================
// Create Owner Profile
// ===============================

async function createOwner() {

    const name =
        document.getElementById("name").value.trim();

    const username =
        document.getElementById("username").value.trim();


    // Check logged-in Firebase user
    const user = auth.currentUser;


    if (!user) {

        alert("ముందుగా సైన్ ఇన్ చేయండి");

        window.location.href = "auth.html";

        return;
    }


    // Validate
    if (name === "" || username === "") {

        alert("దయచేసి అన్ని వివరాలు నమోదు చేయండి");

        return;
    }


    try {

        // Save Owner Profile
        await addDoc(
            collection(db, "owners"),
            {

                name: name,

                username: username,

                email: user.email,

                ownerId: user.uid,

                createdAt: new Date()

            }
        );


        alert(
            "Owner Profile Created Successfully"
        );


        // Go to Owner Login
        window.location.href =
            "owner-login.html";


    } catch (error) {

        console.error(
            "Create Owner Error:",
            error
        );

        alert(
            "Failed to Create Owner Profile"
        );

    }

}


window.createOwner = createOwner;