import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const container =
    document.getElementById("requestsContainer");

const loading =
    document.getElementById("loading");


async function loadRequests() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "accountRequests")
            );

        loading.style.display = "none";

        container.innerHTML = "";

        let pendingCount = 0;


        snapshot.forEach((documentSnapshot) => {

            const data = documentSnapshot.data();

            // Only Pending accounts
            if (data.status !== "Pending Approval") {
                return;
            }

            pendingCount++;


            const card = document.createElement("div");

            card.className = "approval-card";

            card.innerHTML = `
                <h3>${data.name}</h3>

                <p>
                    <strong>Username:</strong>
                    ${data.username}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${data.status}
                </p>

                <div class="approval-buttons">

                    <button
                        class="approve-btn"
                        onclick="approveAccount('${documentSnapshot.id}')">
                        ✓ Approve
                    </button>

                    <button
                        class="reject-btn"
                        onclick="rejectAccount('${documentSnapshot.id}')">
                        ✕ Reject
                    </button>

                </div>
            `;

            container.appendChild(card);

        });


        if (pendingCount === 0) {

            container.innerHTML = `
                <div class="no-requests">
                    No Pending Account Requests
                </div>
            `;

        }


    } catch (error) {

        console.error(
            "Loading requests error:",
            error
        );

        loading.innerText =
            "Error loading requests";

    }

}


// ===============================
// APPROVE ACCOUNT
// ===============================

window.approveAccount = async function (id) {

    try {

        await updateDoc(
            doc(db, "accountRequests", id),
            {
                status: "Approved"
            }
        );

        alert("Account Approved Successfully");

        loadRequests();


    } catch (error) {

        console.error(error);

        alert(
            "Error approving account: " +
            error.message
        );

    }

};


// ===============================
// REJECT ACCOUNT
// ===============================

window.rejectAccount = async function (id) {

    const confirmReject =
        confirm(
            "Are you sure you want to reject this account?"
        );

    if (!confirmReject) {
        return;
    }


    try {

        await updateDoc(
            doc(db, "accountRequests", id),
            {
                status: "Rejected"
            }
        );

        alert("Account Rejected");

        loadRequests();


    } catch (error) {

        console.error(error);

        alert(
            "Error rejecting account: " +
            error.message
        );

    }

};


// ===============================
// BACK
// ===============================

window.goBack = function () {

    window.location.href = "index.html";

};


// Load accounts
loadRequests();