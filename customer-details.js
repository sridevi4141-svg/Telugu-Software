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
    alert("కస్టమర్ ఐడీ కనుగొనబడలేదు");
    throw new Error("Customer ID Missing");
}

let weeksRenderId = 0;
let selectedWeek = 0;

let selectedCollectionType = "weekly";
let selectedCollectionNumber = 0;

// Load Customer
// ==========================================
// LOAD CUSTOMER
// ==========================================

async function loadCustomer() {

    if (!customerId) {
        alert("కస్టమర్ ఐడీ కనుగొనబడలేదు");
        return;
    }

    try {

        const customerRef =
            doc(db, "customers", customerId);

        const customerSnap =
            await getDoc(customerRef);

        if (!customerSnap.exists()) {

            alert("Customer Not Found");
            return;

        }

        const data =
            customerSnap.data();

        console.log("CUSTOMER DATA:", data);


        // ======================================
        // CUSTOMER BASIC DETAILS
        // ======================================

        document.getElementById("customerName").innerHTML =
            data.customerName || "";

        document.getElementById("customerVillage").innerHTML =
            data.village || "";


        // ======================================
        // CUSTOMER PHOTO
        // ======================================

        if (data.photo) {

            const photo =
                document.getElementById("customerPhoto");

            if (photo) {
                photo.src = data.photo;
            }

        }


        // ======================================
        // LOAN DETAILS
        // ======================================

        const amountInput =
            document.getElementById("amount");

        const toPayInput =
            document.getElementById("toPay");

        const weeksInput =
            document.getElementById("weeks");

        const weeklyInput =
            document.getElementById("weeklyPayment");


        // ======================================
        // CHECK WHETHER LOAN EXISTS
        // ======================================

        const loanAmount =
            Number(data.amount || 0);

        const remainingAmount =
            Number(data.toPay || 0);

        const totalWeeks =
            Number(data.weeks || 0);

        const weeklyAmount =
            Number(data.weeklyPayment || 0);


        // ======================================
        // FRESH CUSTOMER / NO LOAN
        // ======================================

        if (
            loanAmount <= 0 ||
            totalWeeks <= 0
        ) {

            if (amountInput)
                amountInput.value = "";

            if (toPayInput)
                toPayInput.value = "";

            if (weeksInput)
                weeksInput.value = "";

            if (weeklyInput)
                weeklyInput.value = "";


            // Clear weekly table
            const tbody =
                document.getElementById("paymentTable");

            if (tbody) {
                tbody.innerHTML = "";
            }

            console.log(
                "No existing loan. Fresh loan can be created."
            );

            return;
        }


        // ======================================
        // EXISTING LOAN
        // ======================================

        if (amountInput)
            amountInput.value = loanAmount;

        if (toPayInput)
            toPayInput.value = remainingAmount;

        if (weeksInput)
            weeksInput.value = totalWeeks;

        if (weeklyInput)
            weeklyInput.value = weeklyAmount;


        console.log(
            "Existing Loan:",
            loanAmount
        );

        console.log(
            "Remaining Balance:",
            remainingAmount
        );

        console.log(
            "Total Weeks:",
            totalWeeks
        );

        console.log(
            "Weekly Payment:",
            weeklyAmount
        );


        // ======================================
        // LOAD WEEKLY PAYMENT TABLE
        // ======================================

        if (
            totalWeeks > 0 &&
            weeklyAmount > 0
        ) {

            await createWeeks(
                totalWeeks
            );

        }

    } catch (error) {

        console.error(
            "Load Customer Error:",
            error
        );

        alert(
            "Customer Load Failed: " +
            error.message
        );

    }

}

loadCustomer();

function updateLoanSummary(totalLoan, totalPaid) {

    totalLoan = Number(totalLoan || 0);
    totalPaid = Number(totalPaid || 0);

    const remaining =
        Math.max(0, totalLoan - totalPaid);

    document.getElementById("paidAmountTotal").innerText =
        "₹" + totalPaid.toLocaleString("en-IN");

    document.getElementById("remainingBalance").innerText =
        "₹" + remaining.toLocaleString("en-IN");
}

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

    alert("సేవ్ బటన్ నొక్కబడింది");


    // ==========================================
    // OWNER LOGIN
    // ==========================================

    const ownerData =
        localStorage.getItem("ownerLogin");


    if (!ownerData) {

        alert(
            "ఓనర్ లాగిన్ సెషన్ కనుగొనబడలేదు. దయచేసి మళ్లీ లాగిన్ చేయండి."
        );

        window.location.href =
            "owner-login.html";

        return;
    }


    const owner =
        JSON.parse(ownerData);


    if (!owner || !owner.ownerId) {

        alert(
            "ఓనర్ లాగిన్ సెషన్ తప్పుగా ఉంది. దయచేసి మళ్లీ లాగిన్ చేయండి."
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
            "దయచేసి అన్ని వివరాలు నమోదు చేయండి"
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
            "సేవ్ విఫలమైంది: " +
            error.message
        );

    }

};// Create Week Cards
// =====================================
// =====================================
// CREATE WEEKLY PAYMENT TABLE
// =====================================

async function createWeeks(totalWeeks) {

    const tbody = document.getElementById("paymentTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    const weekly =
        Number(document.getElementById("weeklyPayment")?.value) || 0;

    const originalAmount =
        Number(document.getElementById("amount")?.value) || 0;

    const currentBalance =
        Number(document.getElementById("toPay")?.value) || 0;

    if (totalWeeks <= 0 || weekly <= 0) {

        document.getElementById("paidAmountTotal").innerText = "₹0";
        document.getElementById("remainingBalance").innerText =
            "₹" + currentBalance.toLocaleString("en-IN");

        return;
    }

    try {

        // =====================================
        // GET CUSTOMER PAYMENTS
        // =====================================

        const q = query(
            collection(db, "payments"),
            where("customerId", "==", customerId)
        );

        const paymentSnap = await getDocs(q);

        // =====================================
        // STORE WEEK PAYMENTS
        // =====================================

        const paidWeeks = {};
        const paymentDates = {};

        let actualPaymentsTotal = 0;

        paymentSnap.forEach((docSnap) => {

            const payment = docSnap.data();

            const week =
                Number(payment.week || 0);

            const amount =
                Number(payment.amount || 0);

            if (week <= 0 || amount <= 0) {
                return;
            }

            // Add payment to that week
            if (!paidWeeks[week]) {
                paidWeeks[week] = 0;
            }

            paidWeeks[week] += amount;

            actualPaymentsTotal += amount;

            // =================================
            // PAYMENT DATE
            // =================================

            if (payment.paymentDate) {

                let date;

                if (
                    payment.paymentDate.seconds !== undefined
                ) {

                    date = new Date(
                        payment.paymentDate.seconds * 1000
                    );

                } else {

                    date = new Date(
                        payment.paymentDate
                    );

                }

                paymentDates[week] =
                    date.toLocaleDateString("en-IN");

            }

        });


        // =====================================
        // OLD CUSTOMER SUPPORT
        // =====================================

        const totalPaidFromLoan =
            Math.max(
                originalAmount - currentBalance,
                0
            );


        // If there are NO payment documents,
        // calculate old paid amount from balance

        if (
            actualPaymentsTotal === 0 &&
            totalPaidFromLoan > 0
        ) {

            let oldPaid =
                totalPaidFromLoan;

            for (
                let week = 1;
                week <= totalWeeks;
                week++
            ) {

                if (oldPaid >= weekly) {

                    paidWeeks[week] = weekly;

                    oldPaid -= weekly;

                }
                else if (oldPaid > 0) {

                    paidWeeks[week] = oldPaid;

                    oldPaid = 0;

                }
                else {

                    paidWeeks[week] = 0;

                }

            }

        }


        // =====================================
        // CREATE WEEK ROWS
        // =====================================

        for (
            let i = 1;
            i <= totalWeeks;
            i++
        ) {

            const paidAmount =
                Number(paidWeeks[i] || 0);

            const remainingAmount =
                Math.max(
                    weekly - paidAmount,
                    0
                );

            const paymentDate =
                paymentDates[i] || "-";


            // =================================
            // FULLY PAID
            // =================================

            if (paidAmount >= weekly) {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${i}
                        </td>

                        <td>
                            ₹${paidAmount.toLocaleString("en-IN")}
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
                                    background:#4CAF50;
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


            // =================================
            // PARTIAL PAYMENT
            // =================================

            else if (paidAmount > 0) {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${i}
                        </td>

                        <td>

                            ₹${paidAmount.toLocaleString("en-IN")}
                            /
                            ₹${weekly.toLocaleString("en-IN")}

                            <br>

                            <small style="color:red;">
                                Balance:
                                ₹${remainingAmount.toLocaleString("en-IN")}
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
                                onclick="
                                    openWeek(
                                        ${i},
                                        ${remainingAmount}
                                    )
                                "
                            >
                                Pay
                            </button>

                        </td>

                    </tr>

                `;

            }


            // =================================
            // PENDING
            // =================================

            else {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${i}
                        </td>

                        <td>
                            ₹${weekly.toLocaleString("en-IN")}
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
                                onclick="
                                    openWeek(
                                        ${i},
                                        ${weekly}
                                    )
                                "
                            >
                                Pay
                            </button>

                        </td>

                    </tr>

                `;

            }

        }


        // =====================================
        // UPDATE SUMMARY
        // =====================================

        const totalPaid =
            Math.max(
                originalAmount - currentBalance,
                0
            );

        const paidDisplay =
            document.getElementById("paidAmountTotal");

        const balanceDisplay =
            document.getElementById("remainingBalance");


        if (paidDisplay) {

            paidDisplay.innerText =
                "₹" +
                totalPaid.toLocaleString("en-IN");

        }


        if (balanceDisplay) {

            balanceDisplay.innerText =
                "₹" +
                currentBalance.toLocaleString("en-IN");

        }


        console.log("Weekly table updated");
        console.log("Payments found:", actualPaymentsTotal);
        console.log("Paid weeks:", paidWeeks);

    }
    catch (error) {

        console.error(
            "createWeeks Error:",
            error
        );

    }

}// =========================================
// OPEN PAYMENT POPUP
// WEEKLY / MONTHLY / DAILY
// =========================================

window.openCollection = function(
    type,
    number,
    remainingAmount
) {

    selectedCollectionType = type;

    selectedCollectionNumber = number;

    selectedWeek = number;


    const title =
        document.getElementById("weekTitle");


    if (title) {

        if (type === "weekly") {

            title.innerHTML =
                "📅 Week " + number;

        }

        else if (type === "monthly") {

            title.innerHTML =
                "🗓️ Month " + number;

        }

        else if (type === "daily") {

            title.innerHTML =
                "📆 Day " + number;

        }

    }


    const amountInput =
        document.getElementById("paidAmount");


    if (amountInput) {

        amountInput.value =
            remainingAmount || "";

    }


    const popup =
        document.getElementById("paymentPopup");


    if (popup) {

        popup.style.display =
            "block";

    }

};


// OLD WEEKLY SUPPORT
window.openWeek = function(
    week,
    remainingAmount
) {

    openCollection(
        "weekly",
        week,
        remainingAmount
    );

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
            "ఓనర్ లాగిన్ సెషన్ కనుగొనబడలేదు. దయచేసి మళ్లీ లాగిన్ చేయండి."
        );

        window.location.href =
            "owner-login.html";

        return;
    }


    const owner =
        JSON.parse(ownerData);


    if (!owner || !owner.ownerId) {

        alert(
            "ఓనర్ లాగిన్ వివరాలు తప్పుగా ఉన్నాయి"
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

                paymentType:
    selectedCollectionType,

periodNumber:
    selectedCollectionNumber,

// Weekly compatibility
week:
    selectedCollectionType === "weekly"
        ? selectedCollectionNumber
        : 0,

amount:
    paidAmount,

                paymentDate:
                    new Date(),

                status:
                    "చెల్లించారు"

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

// =========================================
// COLLECTION TYPE SWITCH
// =========================================

// =========================================
// COLLECTION TYPE SWITCH
// WEEKLY / MONTHLY / DAILY
// =========================================

window.showCollection = async function(type) {

    const weekly =
        document.getElementById("weeklyCollection");

    const monthly =
        document.getElementById("monthlyCollection");

    const daily =
        document.getElementById("dailyCollection");

    // Hide all
    if (weekly) weekly.style.display = "none";
    if (monthly) monthly.style.display = "none";
    if (daily) daily.style.display = "none";

    // Remove active
    document
        .querySelectorAll(".collection-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    selectedCollectionType = type;

    // =====================================
    // WEEKLY
    // =====================================

    if (type === "weekly") {

        if (weekly)
            weekly.style.display = "block";

        document
            .querySelectorAll(".collection-btn")[0]
            ?.classList.add("active");

        const weeks =
            Number(
                document.getElementById("weeks")?.value
            ) || 0;

        if (weeks > 0) {
            await createWeeks(weeks);
        }
    }

    // =====================================
    // MONTHLY
    // =====================================

    if (type === "monthly") {

        if (monthly)
            monthly.style.display = "block";

        document
            .querySelectorAll(".collection-btn")[1]
            ?.classList.add("active");

        await createMonths();
    }

    // =====================================
    // DAILY
    // =====================================

    if (type === "daily") {

        if (daily)
            daily.style.display = "block";

        document
            .querySelectorAll(".collection-btn")[2]
            ?.classList.add("active");

        await createDays();
    }

};
// =========================================
// CREATE MONTHLY COLLECTION
// =========================================

async function createMonths() {

    const tbody =
        document.getElementById("monthlyPaymentTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    const currentBalance =
        Number(
            document.getElementById("toPay")?.value
        ) || 0;

    const originalAmount =
        Number(
            document.getElementById("amount")?.value
        ) || 0;

    const monthlyAmount =
        Number(
            document.getElementById("monthlyPayment")?.value
        ) || 0;


    try {

        const q = query(
            collection(db, "payments"),
            where("customerId", "==", customerId),
            where("paymentType", "==", "monthly")
        );

        const snap =
            await getDocs(q);


        const payments = {};

        const dates = {};


        snap.forEach(docSnap => {

            const data =
                docSnap.data();

            const month =
                Number(data.periodNumber || 0);

            const amount =
                Number(data.amount || 0);

            if (month > 0) {

                payments[month] =
                    (payments[month] || 0) + amount;

                if (data.paymentDate) {

                    let date;

                    if (data.paymentDate.seconds) {

                        date = new Date(
                            data.paymentDate.seconds * 1000
                        );

                    } else {

                        date = new Date(
                            data.paymentDate
                        );

                    }

                    dates[month] =
                        date.toLocaleDateString("en-IN");
                }
            }

        });


        // =====================================
        // CALCULATE MONTHS
        // =====================================

        let months = 12;

        const loanAmount =
            originalAmount;

        if (loanAmount > 0) {

            const calculatedMonthly =
                monthlyAmount > 0
                    ? monthlyAmount
                    : loanAmount / 12;

        }


        // =====================================
        // CREATE 12 MONTHS
        // =====================================

        for (let i = 1; i <= months; i++) {

            const paid =
                Number(payments[i] || 0);

            const amount =
                monthlyAmount > 0
                    ? monthlyAmount
                    : loanAmount / 12;

            const remaining =
                Math.max(amount - paid, 0);

            const date =
                dates[i] || "-";


            // FULLY PAID
            if (paid >= amount && amount > 0) {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            Month ${i}
                        </td>

                        <td>
                            ₹${paid.toLocaleString("en-IN")}
                        </td>

                        <td>
                            ${date}
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

            // PARTIAL
            else if (paid > 0) {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            Month ${i}
                        </td>

                        <td>

                            ₹${paid.toLocaleString("en-IN")}
                            /
                            ₹${amount.toLocaleString("en-IN")}

                            <br>

                            <small style="color:red">
                                Balance:
                                ₹${remaining.toLocaleString("en-IN")}
                            </small>

                        </td>

                        <td>
                            ${date}
                        </td>

                        <td class="pending">
                            🟠 Partial
                        </td>

                        <td>

                            <button
                                class="pay-btn"
                                onclick="
                                    openCollection(
                                        'monthly',
                                        ${i},
                                        ${remaining}
                                    )
                                "
                            >
                                Pay
                            </button>

                        </td>

                    </tr>

                `;

            }

            // PENDING
            else {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            Month ${i}
                        </td>

                        <td>
                            ₹${amount.toLocaleString("en-IN")}
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
                                onclick="
                                    openCollection(
                                        'monthly',
                                        ${i},
                                        ${amount}
                                    )
                                "
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
            "Monthly Collection Error:",
            error
        );

    }

}

// =========================================
// CREATE DAILY COLLECTION
// =========================================

async function createDays() {

    const tbody =
        document.getElementById("dailyPaymentTable");

    if (!tbody) return;

    tbody.innerHTML = "";


    const currentBalance =
        Number(
            document.getElementById("toPay")?.value
        ) || 0;

    const originalAmount =
        Number(
            document.getElementById("amount")?.value
        ) || 0;


    try {

        const q = query(
            collection(db, "payments"),
            where("customerId", "==", customerId),
            where("paymentType", "==", "daily")
        );

        const snap =
            await getDocs(q);


        const payments = {};

        const dates = {};


        snap.forEach(docSnap => {

            const data =
                docSnap.data();

            const day =
                Number(data.periodNumber || 0);

            const amount =
                Number(data.amount || 0);

            if (day > 0) {

                payments[day] =
                    (payments[day] || 0) + amount;

                if (data.paymentDate) {

                    let date;

                    if (data.paymentDate.seconds) {

                        date =
                            new Date(
                                data.paymentDate.seconds * 1000
                            );

                    } else {

                        date =
                            new Date(
                                data.paymentDate
                            );

                    }

                    dates[day] =
                        date.toLocaleDateString("en-IN");

                }

            }

        });


        // =====================================
        // DAILY AMOUNT
        // =====================================

        const dailyAmount =
            Number(
                document.getElementById("dailyPayment")?.value
            ) || 0;


        // =====================================
        // 30 DAYS
        // =====================================

        const totalDays = 30;


        for (
            let i = 1;
            i <= totalDays;
            i++
        ) {

            const paid =
                Number(payments[i] || 0);

            const amount =
                dailyAmount > 0
                    ? dailyAmount
                    : originalAmount / totalDays;

            const remaining =
                Math.max(
                    amount - paid,
                    0
                );

            const date =
                dates[i] || "-";


            // FULLY PAID
            if (
                paid >= amount &&
                amount > 0
            ) {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            Day ${i}
                        </td>

                        <td>
                            ₹${paid.toLocaleString("en-IN")}
                        </td>

                        <td>
                            ${date}
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

            // PARTIAL
            else if (
                paid > 0
            ) {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            Day ${i}
                        </td>

                        <td>

                            ₹${paid.toLocaleString("en-IN")}
                            /
                            ₹${amount.toLocaleString("en-IN")}

                            <br>

                            <small style="color:red">
                                Balance:
                                ₹${remaining.toLocaleString("en-IN")}
                            </small>

                        </td>

                        <td>
                            ${date}
                        </td>

                        <td class="pending">
                            🟠 Partial
                        </td>

                        <td>

                            <button
                                class="pay-btn"
                                onclick="
                                    openCollection(
                                        'daily',
                                        ${i},
                                        ${remaining}
                                    )
                                "
                            >
                                Pay
                            </button>

                        </td>

                    </tr>

                `;

            }

            // PENDING
            else {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            Day ${i}
                        </td>

                        <td>
                            ₹${amount.toLocaleString("en-IN")}
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
                                onclick="
                                    openCollection(
                                        'daily',
                                        ${i},
                                        ${amount}
                                    )
                                "
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
            "Daily Collection Error:",
            error
        );

    }

}