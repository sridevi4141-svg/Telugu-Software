import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Login Staff
const staff =
JSON.parse(localStorage.getItem("staffLogin"));


// Today's Date
const today =
new Date().toISOString().split("T")[0];


// Set Date
document.getElementById("todayDate").value =
today;


// Set Staff Name
document.getElementById("staffName").value =
staff.name || staff.username;


// Totals
let totalLoan = 0;
let totalCollection = 0;

async function loadTodayLoan(){

    totalLoan = 0;

    const q = query(

        collection(db,"dailyLoans"),

        where("staffUser","==",staff.username),

        where("date","==",today)

    );

    const snap = await getDocs(q);

    snap.forEach((doc)=>{

        totalLoan += Number(
            doc.data().loanAmount || 0
        );

    });

    document.getElementById("totalLoan").innerHTML =
    "₹ " + totalLoan;

}


async function loadTodayCollection(){

    totalCollection = 0;

    const q = query(
        collection(db,"payments"),
        where("staffUser","==",staff.username)
    );

    const snap = await getDocs(q);

    snap.forEach((doc)=>{

        const data = doc.data();

        if(data.paymentDate){

            const paymentDate =
                new Date(
                    data.paymentDate.seconds
                    ? data.paymentDate.seconds * 1000
                    : data.paymentDate
                ).toISOString().split("T")[0];

            if(paymentDate == today){

                totalCollection +=
                    Number(data.amount || 0);
            }
        }
    });

    document.getElementById("totalCollection").innerHTML =
        "₹ " + totalCollection;
}
// ===============================
// Closing Cash
// ===============================

function calculateClosing() {

    const openingCash =
        Number(
            document.getElementById("openingCash").value
        ) || 0;

    const expenses =
        Number(
            document.getElementById("expenses").value
        ) || 0;

    const closingCash =
    openingCash -
    totalLoan +
    totalCollection -
    expenses;

    document.getElementById("closingCash").innerHTML =
        "₹ " + closingCash;
}

document.getElementById("openingCash")
    .addEventListener("input", calculateClosing);

document.getElementById("expenses")
    .addEventListener("input", calculateClosing);

// Auto Calculate


document.getElementById("expenses")
.addEventListener("input", calculateClosing);


// ===============================
// Save Daily Sheet
// ===============================
 window.saveDailySheet = async function () {

    // Opening Cash
    const openingCash =
        Number(
            document.getElementById("openingCash").value
        ) || 0;

    // Expenses
    const expenses =
        Number(
            document.getElementById("expenses").value
        ) || 0;

    // Notes
    const notes =
        document.getElementById("notes").value || "";
        

    try {

        // Get latest Loan and Collection totals
        await loadTodayLoan();
        await loadTodayCollection();

        // Calculate Closing Cash
        const closingCash =
    openingCash -
    totalLoan +
    todayCollection -
    expenses;

        // Display Closing Cash
        document.getElementById("closingCash").innerHTML =
            "₹ " + closingCash;

        console.log("Opening Cash:", openingCash);
        console.log("Loan:", totalLoan);
        console.log("Collection:", totalCollection);
        console.log("Expenses:", expenses);
        console.log("Closing Cash:", closingCash);

        // Save Daily Sheet
        await addDoc(
            collection(db, "dailySheets"),
            {

                date: today,

                staffUser:
                    staff.username,

                staffName:
                    staff.name || staff.username,

                openingCash:
                    openingCash,

                totalLoan:
                    Number(totalLoan || 0),

                totalCollection:
                    Number(totalCollection || 0),

                expenses:
                    expenses,

                closingCash:
                    closingCash,

                notes:
                    notes,

                status:
                    "Completed",

                createdAt:
                    new Date()
            }
        );

        alert("✅ Daily Sheet Saved Successfully");

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
// ===============================
// Page Load
// ===============================

async function initPage() {

    await loadTodayLoan();

    await loadTodayCollection();

    calculateClosing();

}

initPage();
