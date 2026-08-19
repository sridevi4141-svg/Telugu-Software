import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================
// GET HTML ELEMENT
// =====================================

const requestsContainer =
    document.getElementById("requestsContainer");


// =====================================
// LOAD ACCOUNT REQUESTS
// =====================================

async function loadAccountRequests() {

    try {

        requestsContainer.innerHTML = `
            <div class="loading">
                Loading account requests...
            </div>
        `;


        const requestsQuery = query(
            collection(db, "accountRequests"),
            orderBy("createdAt", "desc")
        );


        const snapshot =
            await getDocs(requestsQuery);


        // =================================
        // NO REQUESTS
        // =================================

        if (snapshot.empty) {

            requestsContainer.innerHTML = `
                <div class="empty-message">
                    <h3>No Account Requests</h3>
                    <p>
                        There are no account requests at the moment.
                    </p>
                </div>
            `;

            return;
        }


        requestsContainer.innerHTML = "";


        // =================================
        // DISPLAY REQUESTS
        // =================================

        snapshot.forEach((requestDoc) => {

            const data = requestDoc.data();

            const requestId =
                requestDoc.id;


            // Only show pending requests

            if (
                data.status !== "Pending Approval"
            ) {

                return;
            }


            // =================================
            // CREATE CARD
            // =================================

            const card =
                document.createElement("div");

            card.className =
                "request-card";


            card.innerHTML = `

                <h3>
                    ${escapeHtml(data.name || "No Name")}
                </h3>


                <div class="status">
                    Pending Approval
                </div>


                <div class="request-details">

                    <div>
                        <strong>Mobile:</strong>
                        ${escapeHtml(data.mobile || "-")}
                    </div>


                    <div>
                        <strong>Username:</strong>
                        ${escapeHtml(data.username || "-")}
                    </div>


                    <div>
                        <strong>Requested:</strong>
                        ${formatDate(data.createdAt)}
                    </div>

                </div>


                <div class="action-buttons">

                    <button
                        class="approve-btn"
                        data-id="${requestId}"
                    >
                        ✓ Approve
                    </button>


                    <button
                        class="reject-btn"
                        data-id="${requestId}"
                    >
                        ✕ Reject
                    </button>

                </div>

            `;


            requestsContainer.appendChild(card);

        });


        // =================================
        // BUTTON EVENTS
        // =================================

        document
            .querySelectorAll(".approve-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => approveRequest(
                        button.dataset.id
                    )
                );

            });


        document
            .querySelectorAll(".reject-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => rejectRequest(
                        button.dataset.id
                    )
                );

            });


        // If all requests were non-pending

        if (
            requestsContainer.innerHTML.trim() === ""
        ) {

            requestsContainer.innerHTML = `
                <div class="empty-message">

                    <h3>No Pending Requests</h3>

                    <p>
                        All account requests have been processed.
                    </p>

                </div>
            `;

        }


    } catch (error) {

        console.error(
            "Error loading account requests:",
            error
        );


        requestsContainer.innerHTML = `
            <div class="empty-message">

                <h3>Error Loading Requests</h3>

                <p>
                    ${escapeHtml(error.message)}
                </p>

            </div>
        `;

    }

}


// =====================================
// APPROVE REQUEST
// =====================================

async function approveRequest(requestId) {

    const confirmApprove =
        confirm(
            "Are you sure you want to approve this account?"
        );


    if (!confirmApprove) {
        return;
    }


    try {

        const requestRef =
            doc(
                db,
                "accountRequests",
                requestId
            );


        await updateDoc(
            requestRef,
            {

                status: "Approved",

                approvedAt: new Date()

            }
        );


        alert(
            "Account request approved successfully!"
        );


        // Reload list

        loadAccountRequests();


    } catch (error) {

        console.error(
            "Approval error:",
            error
        );


        alert(
            "Error approving account.\n\n" +
            error.message
        );

    }

}


// =====================================
// REJECT REQUEST
// =====================================

async function rejectRequest(requestId) {

    const confirmReject =
        confirm(
            "Are you sure you want to reject this account?"
        );


    if (!confirmReject) {
        return;
    }


    try {

        const requestRef =
            doc(
                db,
                "accountRequests",
                requestId
            );


        await updateDoc(
            requestRef,
            {

                status: "Rejected",

                rejectedAt: new Date()

            }
        );


        alert(
            "Account request rejected."
        );


        // Reload list

        loadAccountRequests();


    } catch (error) {

        console.error(
            "Reject error:",
            error
        );


        alert(
            "Error rejecting account.\n\n" +
            error.message
        );

    }

}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(timestamp) {

    if (!timestamp) {
        return "-";
    }


    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);


        return date.toLocaleString();

    } catch (error) {

        return "-";

    }

}


// =====================================
// HTML SECURITY
// =====================================

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// =====================================
// BACK BUTTON
// =====================================

document
    .getElementById("backButton")
    .addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );


// =====================================
// START
// =====================================

loadAccountRequests();