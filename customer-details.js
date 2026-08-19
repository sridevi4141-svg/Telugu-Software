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
window.saveLoan = async function(){

    alert("Save Button Clicked");

    const amount =
    Number(document.getElementById("amount").value);

    const toPay =
    Number(document.getElementById("toPay").value);

    const weeks =
    Number(document.getElementById("weeks").value);

    const weeklyPayment =
    Number(document.getElementById("weeklyPayment").value);

    if(amount==0 || toPay==0 || weeks==0){

        alert("Please Fill All Details");

        return;

    }

    try{

        await updateDoc(

            doc(db,"customers",customerId),

            {

                amount,

                toPay,

                weeks,

                weeklyPayment

            }

        );
const customerSnap = await getDoc(
    doc(db, "customers", customerId)
);

const customer = customerSnap.data();

const staff = JSON.parse(
    localStorage.getItem("staffLogin")
);

await addDoc(collection(db, "dailyLoans"), {

    customerId: customerId,

    serialNo: customer.serialNo,

    customerName: customer.customerName,

    loanAmount: Number(amount),

    staffUser: staff.username,

    date: new Date().toISOString().split("T")[0],

    createdDate: new Date()

});
        alert("Loan Details Saved Successfully");

    }catch(error){

        console.log(error);

        alert("Save Failed");

    }

}

// Create Week Cards
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

    const paidAmount = Number(
        document.getElementById("paidAmount").value
    ) || 0;

    if (paidAmount <= 0) {

        alert("Enter Amount");

        return;
    }


    try {

        // ============================
        // Get Customer
        // ============================

        const customerRef = doc(
            db,
            "customers",
            customerId
        );

        const customerSnap =
            await getDoc(customerRef);


        if (!customerSnap.exists()) {

            alert("Customer Not Found");

            return;
        }


        const customer =
            customerSnap.data();


        // ============================
        // Current Balance
        // ============================

        const currentBalance =
            Number(customer.toPay || 0);


        // ============================
        // Check Balance
        // ============================

        if (paidAmount > currentBalance) {

            alert(
                "Payment cannot be greater than remaining balance ₹"
                + currentBalance
            );

            return;
        }


        // ============================
        // Selected Week
        // ============================

        const weekNumber =
            Number(selectedWeek) || 1;


        // ============================
        // Staff
        // ============================

        const staff =
            JSON.parse(
                localStorage.getItem("staffLogin")
            );


        if (!staff) {

            alert("Staff Login Not Found");

            return;
        }


        // ============================
        // SAVE FULL PAYMENT
        // ============================

        await addDoc(
            collection(db, "payments"),
            {

                customerId:
                    customerId,

                week:
                    weekNumber,

                amount:
                    paidAmount,

                paymentDate:
                    new Date(),

                staffUser:
                    staff.username,

                status:
                    "Paid"

            }
        );


        // ============================
        // Update Customer Balance
        // ============================

        const newBalance =
            currentBalance - paidAmount;


        await updateDoc(
            customerRef,
            {

                toPay:
                    newBalance

            }
        );


        // ============================
        // Update Balance Textbox
        // ============================

        document.getElementById(
            "toPay"
        ).value = newBalance;


        // ============================
        // Clear Payment Input
        // ============================

        document.getElementById(
            "paidAmount"
        ).value = "";


        // ============================
        // Success
        // ============================

        alert(
            "Payment Saved Successfully"
        );


        closePopup();


        // ============================
        // Reload Customer
        // ============================

        await loadCustomer();


        // ============================
        // Reload Weekly Table
        // ============================

        const totalWeeks =
            Number(
                document.getElementById("weeks").value
            ) || 0;


        await createWeeks(
            totalWeeks
        );


    } catch (error) {

        console.error(
            "Payment Error:",
            error
        );

        alert(
            "Payment Failed"
        );

    }

};