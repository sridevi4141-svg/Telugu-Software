import { db } from "./firebase-config.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// Customer ID
const params = new URLSearchParams(window.location.search);
const customerId = params.get("id");

if (!customerId) {
    alert("Customer ID Not Found");
    throw new Error("Customer ID Missing");
}

let weeksRenderId = 0;

// Load Customer
async function loadCustomer(){

    if(!customerId){

        alert("Customer ID Not Found");

        return;

    }

    try{

        const docRef = doc(db,"customers",customerId);

        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){

            const data = docSnap.data();
            console.log(data);

            document.getElementById("customerName").innerHTML =
            data.customerName || "";

            document.getElementById("customerVillage").innerHTML =
            data.village || "";

            

            if(data.photo){

                document.getElementById("customerPhoto").src =
                data.photo;

            }
            

            document.getElementById("amount").value =
            data.amount || "";

            document.getElementById("toPay").value =
            data.toPay || "";

            document.getElementById("weeks").value =
            data.weeks || "";

            document.getElementById("weeklyPayment").value =
            data.weeklyPayment || "";

            if(data.weeks){

    createWeeks(
        Number(data.weeks),
        Number(data.weeklyPayment || 0)
    );

            }

        }

    }catch(error){

        console.log(error);

    }

}

loadCustomer();

// Weekly Payment Auto
window.calculateWeekly = function(){

    const toPay =
    Number(document.getElementById("toPay").value);

    const weeks =
    Number(document.getElementById("weeks").value);

    if(toPay>0 && weeks>0){

        document.getElementById("weeklyPayment").value =
        (toPay/weeks).toFixed(2);

        createWeeks(weeks);

    }

}


// Save Loan
window.saveLoan = async function () {

    alert("Save Button Clicked");


    // ==========================================
    // OWNER LOGIN
    // ==========================================

    const ownerData =
        localStorage.getItem("ownerLogin");


    if (!ownerData) {

        alert(
            "Owner login session not found. Please login again."
        );

        window.location.href =
            "owner-login.html";

        return;
    }


    const owner =
        JSON.parse(ownerData);


    if (!owner || !owner.ownerId) {

        alert(
            "Invalid owner login session. Please login again."
        );

        localStorage.removeItem("ownerLogin");

        window.location.href =
            "owner-login.html";

        return;
    }


    const ownerId =
        owner.ownerId;


    console.log(
        "CURRENT OWNER ID:",
        ownerId
    );


    // ==========================================
    // LOAN DETAILS
    // ==========================================

    const amount =
        Number(
            document.getElementById("amount").value
        );


    const toPay =
        Number(
            document.getElementById("toPay").value
        );


    const weeks =
        Number(
            document.getElementById("weeks").value
        );


    const weeklyPayment =
        Number(
            document.getElementById("weeklyPayment").value
        );


    // ==========================================
    // VALIDATION
    // ==========================================

    if (
        amount <= 0 ||
        toPay <= 0 ||
        weeks <= 0
    ) {

        alert(
            "Please Fill All Details"
        );

        return;
    }


    try {


        // ======================================
        // CUSTOMER DOCUMENT
        // ======================================

        const customerRef =
            doc(
                db,
                "customers",
                customerId
            );


        // ======================================
        // UPDATE CUSTOMER WITH LOAN DETAILS
        // ======================================

        await updateDoc(
            customerRef,
            {

                amount: amount,

                toPay: toPay,

                weeks: weeks,

                weeklyPayment: weeklyPayment

            }
        );


        // ======================================
        // GET CUSTOMER
        // ======================================

        const customerSnap =
            await getDoc(
                customerRef
            );


        if (!customerSnap.exists()) {

            alert(
                "Customer not found"
            );

            return;
        }


        const customer =
            customerSnap.data();


        // ======================================
        // SAVE DAILY LOAN
        // ======================================

        await addDoc(
            collection(
                db,
                "dailyLoans"
            ),
            {

                ownerId: ownerId,

                customerId: customerId,

                serialNo:
                    customer.serialNo || "",

                customerName:
                    customer.customerName || "",

                loanAmount:
                    Number(amount),

                toPay:
                    Number(toPay),

                weeks:
                    Number(weeks),

                weeklyPayment:
                    Number(weeklyPayment),

                date:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                createdDate:
                    new Date()

            }
        );


        // ======================================
        // SUCCESS
        // ======================================

        alert(
            "Loan Details Saved Successfully"
        );


    } catch (error) {

        console.error(
            "Loan Save Error:",
            error
        );


        alert(
            "Save Failed: " +
            error.message
        );

    }

};// Create Week Cards
// =====================================
// Create Weekly Payment Table
// =====================================

async function createWeeks(totalWeeks) {

    const tbody = document.getElementById("paymentTable");

    tbody.innerHTML = "";

    const weekly = Number(
        document.getElementById("weeklyPayment").value
    ) || 0;

    try {

        // ============================
        // Get All Payments
        // ============================

        const q = query(
            collection(db, "payments"),
            where("customerId", "==", customerId)
        );

        const paymentSnap = await getDocs(q);

        // ============================
        // Store Week-wise Payments
        // ============================

        const paidWeeks = {};

        const paymentDates = {};

        paymentSnap.forEach((docSnap) => {

            const payment = docSnap.data();

            const week = Number(payment.week || 0);

            const amount = Number(payment.amount || 0);

            if (!paidWeeks[week]) {
                paidWeeks[week] = 0;
            }

            paidWeeks[week] += amount;


            // Payment Date
            if (payment.paymentDate) {

                let date;

                if (payment.paymentDate.seconds) {

                    date = new Date(
                        payment.paymentDate.seconds * 1000
                    );

                } else {

                    date = new Date(
                        payment.paymentDate
                    );

                }

                paymentDates[week] =
                    date.toLocaleDateString();

            }

        });


        // ============================
        // Create Week Rows
        // ============================

        for (let i = 1; i <= totalWeeks; i++) {

            const paidAmount =
                Number(paidWeeks[i] || 0);

            const remainingAmount =
                Math.max(
                    weekly - paidAmount,
                    0
                );

            const paymentDate =
                paymentDates[i] || "-";


            // ==================================
            // FULLY PAID
            // ==================================

            if (paidAmount >= weekly) {

                tbody.innerHTML += `
                    <tr>

                        <td>${i}</td>

                        <td>
                            ₹ ${paidAmount}
                        </td>

                        <td>
                            ${paymentDate}
                        </td>

                        <td class="paid">
                            ✅ Paid
                        </td>

                        <td>

                            <button
                                disabled
                                style="
                                    background:green;
                                    color:white;
                                    border:none;
                                    padding:6px 12px;
                                    border-radius:5px;
                                "
                            >
                                Paid
                            </button>

                        </td>

                    </tr>
                `;

            }


            // ==================================
            // PARTIAL PAYMENT
            // ==================================

            else if (paidAmount > 0) {

                tbody.innerHTML += `
                    <tr>

                        <td>${i}</td>

                        <td>
                            ₹ ${paidAmount}
                            /
                            ₹ ${weekly}

                            <br>

                            <small style="color:red;">
                                Balance: ₹ ${remainingAmount}
                            </small>
                        </td>

                        <td>
                            ${paymentDate}
                        </td>

                        <td class="pending">
                            🟠 Partial
                        </td>

                        <td>

                            <button
                                class="pay-btn"
                                onclick="openWeek(${i}, ${remainingAmount})"
                            >
                                Pay
                            </button>

                        </td>

                    </tr>
                `;

            }


            // ==================================
            // NOT PAID
            // ==================================

            else {

                tbody.innerHTML += `
                    <tr>

                        <td>${i}</td>

                        <td>
                            ₹ ${weekly}
                        </td>

                        <td>
                            -
                        </td>

                        <td class="pending">
                            🟠 Pending
                        </td>

                        <td>

                            <button
                                class="pay-btn"
                                onclick="openWeek(${i}, ${weekly})"
                            >
                                Pay
                            </button>

                        </td>

                    </tr>
                `;

            }

        }

    } catch (error) {

        console.error(
            "createWeeks Error:",
            error
        );

    }

}
let selectedWeek=0;

window.openWeek = function(week, remainingAmount){

    selectedWeek = week;

    document.getElementById("weekTitle").innerHTML =
        "Week " + week;

    // Remaining amount automatically fill
    document.getElementById("paidAmount").value =
        remainingAmount || "";

    document.getElementById("paymentPopup").style.display =
        "block";
};
window.closePopup=function(){

    document.getElementById("paymentPopup").style.display=
    "none";

}

// =====================================
// Save Week Payment
// Supports ₹400, ₹500, ₹700, ₹1000 etc.
// =====================================

window.saveWeekPayment = async function () {

    // ==========================================
    // OWNER LOGIN
    // ==========================================

    const ownerData =
        localStorage.getItem("ownerLogin");


    if (!ownerData) {

        alert(
            "Owner login session not found. Please login again."
        );

        window.location.href =
            "owner-login.html";

        return;
    }


    const owner =
        JSON.parse(ownerData);


    if (!owner || !owner.ownerId) {

        alert(
            "Invalid Owner Login"
        );

        localStorage.removeItem(
            "ownerLogin"
        );

        window.location.href =
            "owner-login.html";

        return;
    }


    const ownerId =
        owner.ownerId;


    console.log(
        "PAYMENT OWNER ID:",
        ownerId
    );


    // ==========================================
    // PAID AMOUNT
    // ==========================================

    const paidAmount =
        Number(
            document.getElementById(
                "paidAmount"
            ).value
        ) || 0;


    if (paidAmount <= 0) {

        alert(
            "Enter Amount"
        );

        return;
    }


    try {

        // ======================================
        // GET CUSTOMER
        // ======================================

        const customerRef =
            doc(
                db,
                "customers",
                customerId
            );


        const customerSnap =
            await getDoc(
                customerRef
            );


        if (!customerSnap.exists()) {

            alert(
                "Customer Not Found"
            );

            return;
        }


        const customer =
            customerSnap.data();


        // ======================================
        // CHECK CUSTOMER OWNER
        // ======================================

        if (
            customer.ownerId &&
            customer.ownerId !== ownerId
        ) {

            alert(
                "You cannot make payment for this customer."
            );

            return;
        }


        // ======================================
        // CURRENT BALANCE
        // ======================================

        const currentBalance =
            Number(
                customer.toPay || 0
            );


        // ======================================
        // CHECK BALANCE
        // ======================================

        if (
            paidAmount >
            currentBalance
        ) {

            alert(
                "Payment cannot be greater than remaining balance ₹"
                + currentBalance
            );

            return;
        }


        // ======================================
        // SELECTED WEEK
        // ======================================

        const weekNumber =
            Number(
                selectedWeek
            ) || 1;


        // ======================================
        // SAVE PAYMENT
        // ======================================

        await addDoc(
            collection(
                db,
                "payments"
            ),
            {

                ownerId:
                    ownerId,

                customerId:
                    customerId,

                week:
                    weekNumber,

                amount:
                    paidAmount,

                paymentDate:
                    new Date(),

                status:
                    "Paid"

            }
        );


        // ======================================
        // UPDATE CUSTOMER BALANCE
        // ======================================

        const newBalance =
            currentBalance -
            paidAmount;


        await updateDoc(
            customerRef,
            {

                toPay:
                    newBalance

            }
        );


        // ======================================
        // UPDATE BALANCE TEXTBOX
        // ======================================

        const toPayElement =
            document.getElementById(
                "toPay"
            );


        if (toPayElement) {

            toPayElement.value =
                newBalance;

        }


        // ======================================
        // CLEAR PAYMENT INPUT
        // ======================================

        document.getElementById(
            "paidAmount"
        ).value = "";


        // ======================================
        // SUCCESS
        // ======================================

        alert(
            "Payment Saved Successfully"
        );


        closePopup();


        // ======================================
        // RELOAD CUSTOMER
        // ======================================

        await loadCustomer();


        // ======================================
        // RELOAD WEEKLY TABLE
        // ======================================

        const weeksElement =
            document.getElementById(
                "weeks"
            );


        const totalWeeks =
            weeksElement
                ? Number(weeksElement.value) || 0
                : 0;


        await createWeeks(
            totalWeeks
        );


    } catch (error) {

        console.error(
            "Payment Error:",
            error
        );


        alert(
            "Payment Failed: " +
            error.message
        );

    }

};