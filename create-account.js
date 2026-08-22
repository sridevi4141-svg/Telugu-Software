import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const form =
    document.getElementById("createAccountForm");


form.addEventListener("submit", async function (e) {

    e.preventDefault();


    // ===============================
    // GET FORM VALUES
    // ===============================

    const name =
        document.getElementById("name").value.trim();

    const mobile =
        document.getElementById("mobile").value.trim();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    // ===============================
    // CHECK MOBILE
    // ===============================

    if (!/^[0-9]{10}$/.test(mobile)) {

        alert(
            "Please enter a valid 10 digit mobile number"
        );

        return;
    }


    // ===============================
    // CHECK PASSWORD
    // ===============================

    if (password !== confirmPassword) {

        alert("పాస్‌వర్డ్‌లు సరిపోలడం లేదు");

        return;
    }


    try {

        // ===============================
        // CHECK USERNAME
        // ===============================

        const q = query(
            collection(db, "accountRequests"),
            where("username", "==", username)
        );


        const snapshot =
            await getDocs(q);


        if (!snapshot.empty) {

            alert("ఈ యూజర్ పేరు ఇప్పటికే ఉంది");

            return;
        }


        // ===============================
        // SAVE ACCOUNT REQUEST
        // ===============================

        await addDoc(
            collection(db, "accountRequests"),
            {

                name: name,

                mobile: mobile,

                username: username,

                password: password,

                status: "Pending Approval",

                createdAt: new Date()

            }
        );


        // ===============================
        // SUCCESS
        // ===============================

        alert(
            "Account request submitted successfully!\n\n" +
            "Status: Pending Approval\n\n" +
            "Manager approval is required."
        );


        form.reset();


        // Back to home
        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Create account error:",
            error
        );


        alert(
            "Error creating account.\n" +
            error.message
        );

    }

});


// ===============================
// BACK BUTTON
// ===============================

window.goBack = function () {

    window.location.href =
        "index.html";

};