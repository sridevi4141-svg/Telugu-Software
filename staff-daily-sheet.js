import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =================================================
// OWNER LOGIN
// =================================================

const ownerData =
    localStorage.getItem("ownerLogin");

if (!ownerData) {

    alert(
        "Owner login session not found. Please login again."
    );

    window.location.href =
        "owner-login.html";

    throw new Error(
        "Owner login not found"
    );
}


let owner;

try {

    owner = JSON.parse(ownerData);

} catch (error) {

    localStorage.removeItem("ownerLogin");

    alert("Invalid Owner Login");

    window.location.href =
        "owner-login.html";

    throw error;
}


if (!owner || !owner.ownerId) {

    alert("Invalid Owner Login");

    localStorage.removeItem("ownerLogin");

    window.location.href =
        "owner-login.html";

    throw new Error(
        "Invalid owner login"
    );
}


const ownerId =
    owner.ownerId;


console.log(
    "CURRENT OWNER ID:",
    ownerId
);


// =================================================
// TODAY'S DATE
// =================================================

const today =
    new Date()
        .toISOString()
        .split("T")[0];


document.getElementById(
    "todayDate"
).value = today;


// =================================================
// OWNER NAME
// =================================================

const ownerName =
    owner.name ||
    owner.username ||
    "";


// If HTML has ownerName
const ownerNameElement =
    document.getElementById("ownerName");

if (ownerNameElement) {

    ownerNameElement.value =
        ownerName;

}


// If your HTML still has staffName
const staffNameElement =
    document.getElementById("staffName");

if (staffNameElement) {

    staffNameElement.value =
        ownerName;

}


// =================================================
// TOTALS
// =================================================

let totalLoan = 0;

let totalCollection = 0;


// =================================================
// LOAD TODAY'S LOANS
// =================================================

async function loadTodayLoan() {

    totalLoan = 0;


    const q = query(

        collection(
            db,
            "dailyLoans"
        ),

        where(
            "ownerId",
            "==",
            ownerId
        ),

        where(
            "date",
            "==",
            today
        )

    );


    const snap =
        await getDocs(q);


    snap.forEach((docSnap) => {

        const data =
            docSnap.data();


        totalLoan +=
            Number(
                data.loanAmount || 0
            );

    });


    document.getElementById(
        "totalLoan"
    ).innerHTML =
        "₹ " + totalLoan;


    calculateClosing();

}


// =================================================
// LOAD TODAY'S COLLECTION
// =================================================

async function loadTodayCollection() {

    totalCollection = 0;


    const q = query(

        collection(
            db,
            "payments"
        ),

        where(
            "ownerId",
            "==",
            ownerId
        )

    );


    const snap =
        await getDocs(q);


    snap.forEach((docSnap) => {

        const data =
            docSnap.data();


        if (!data.paymentDate) {
            return;
        }


        let paymentDate;


        // Firestore Timestamp
        if (
            data.paymentDate.seconds
        ) {

            paymentDate =
                new Date(
                    data.paymentDate.seconds *
                    1000
                )
                .toISOString()
                .split("T")[0];

        }

        // JavaScript Date / string
        else {

            paymentDate =
                new Date(
                    data.paymentDate
                )
                .toISOString()
                .split("T")[0];

        }


        if (
            paymentDate === today
        ) {

            totalCollection +=
                Number(
                    data.amount || 0
                );

        }

    });


    document.getElementById(
        "totalCollection"
    ).innerHTML =
        "₹ " + totalCollection;


    calculateClosing();

}


// =================================================
// CALCULATE CLOSING CASH
// =================================================

function calculateClosing() {

    const openingCash =
        Number(
            document.getElementById(
                "openingCash"
            ).value
        ) || 0;


    const expenses =
        Number(
            document.getElementById(
                "expenses"
            ).value
        ) || 0;


    /*
        Closing Cash Formula

        Opening Cash
        - Today's Loan
        + Today's Collection
        - Expenses
    */

    const closingCash =
        openingCash
        - totalLoan
        + totalCollection
        - expenses;


    document.getElementById(
        "closingCash"
    ).innerHTML =
        "₹ " + closingCash;

}


// =================================================
// INPUT EVENTS
// =================================================

document.getElementById(
    "openingCash"
)
.addEventListener(
    "input",
    calculateClosing
);


document.getElementById(
    "expenses"
)
.addEventListener(
    "input",
    calculateClosing
);


// =================================================
// SAVE DAILY SHEET
// =================================================

window.saveDailySheet =
async function () {

    try {

        // =========================================
        // OPENING CASH
        // =========================================

        const openingCash =
            Number(
                document.getElementById(
                    "openingCash"
                ).value
            ) || 0;


        // =========================================
        // EXPENSES
        // =========================================

        const expenses =
            Number(
                document.getElementById(
                    "expenses"
                ).value
            ) || 0;


        // =========================================
        // NOTES
        // =========================================

        const notes =
            document.getElementById(
                "notes"
            ).value || "";


        // =========================================
        // REFRESH TOTALS
        // =========================================

        await loadTodayLoan();

        await loadTodayCollection();


        // =========================================
        // CALCULATE CLOSING
        // =========================================

        const closingCash =
            openingCash
            - totalLoan
            + totalCollection
            - expenses;


        document.getElementById(
            "closingCash"
        ).innerHTML =
            "₹ " + closingCash;


        // =========================================
        // DEBUG
        // =========================================

        console.log(
            "================ DAILY SHEET ================"
        );

        console.log(
            "Owner ID:",
            ownerId
        );

        console.log(
            "Owner Name:",
            ownerName
        );

        console.log(
            "Date:",
            today
        );

        console.log(
            "Opening Cash:",
            openingCash
        );

        console.log(
            "Today's Loan:",
            totalLoan
        );

        console.log(
            "Today's Collection:",
            totalCollection
        );

        console.log(
            "Expenses:",
            expenses
        );

        console.log(
            "Closing Cash:",
            closingCash
        );


        // =========================================
        // SAVE DAILY SHEET
        // =========================================

        await addDoc(

            collection(
                db,
                "dailySheets"
            ),

            {

                // -------------------------------
                // OWNER SEPARATION
                // -------------------------------

                ownerId:
                    ownerId,

                ownerName:
                    ownerName,


                // -------------------------------
                // DATE
                // -------------------------------

                date:
                    today,


                // -------------------------------
                // CASH DETAILS
                // -------------------------------

                openingCash:
                    openingCash,

                totalLoan:
                    Number(
                        totalLoan || 0
                    ),

                totalCollection:
                    Number(
                        totalCollection || 0
                    ),

                expenses:
                    expenses,

                closingCash:
                    closingCash,


                // -------------------------------
                // NOTES
                // -------------------------------

                notes:
                    notes,


                // -------------------------------
                // STATUS
                // -------------------------------

                status:
                    "Completed",


                // -------------------------------
                // CREATED TIME
                // -------------------------------

                createdAt:
                    new Date()

            }

        );


        // =========================================
        // SUCCESS
        // =========================================

        alert(
            "✅ Daily Sheet Saved Successfully"
        );


    } catch (error) {

        console.error(
            "Save Daily Sheet Error:",
            error
        );


        alert(
            "❌ Save Failed: " +
            error.message
        );

    }

};


// =================================================
// PAGE LOAD
// =================================================

async function initPage() {

    try {

        await loadTodayLoan();

        await loadTodayCollection();

        calculateClosing();

    } catch (error) {

        console.error(
            "Daily Sheet Load Error:",
            error
        );


        alert(
            "Daily Sheet Load Failed: " +
            error.message
        );

    }

}


initPage();