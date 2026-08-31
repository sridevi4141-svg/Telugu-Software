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


// =====================================================
// CUSTOMER ID
// =====================================================

const params = new URLSearchParams(window.location.search);

const customerId = params.get("id");

if (!customerId) {

    alert("కస్టమర్ ఐడీ కనుగొనబడలేదు");

    throw new Error("Customer ID Missing");
}


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let selectedWeek = 0;
let selectedPaymentType = "";


// =====================================================
// LOAD CUSTOMER
// =====================================================

async function loadCustomer() {

    try {

        const customerRef =
            doc(
                db,
                "customers",
                customerId
            );

        const customerSnap =
            await getDoc(customerRef);


        if (!customerSnap.exists()) {

            alert("కస్టమర్ కనుగొనబడలేదు");

            return;
        }


        // IMPORTANT:
        // data ని first తీసుకోవాలి
        const data =
            customerSnap.data();


        console.log(
            "CUSTOMER DATA:",
            data
        );


        // =================================================
        // CUSTOMER DETAILS
        // =================================================

        const customerName =
            document.getElementById(
                "customerName"
            );

        const customerVillage =
            document.getElementById(
                "customerVillage"
            );


        if (customerName) {

            customerName.innerText =
                data.customerName || "";

        }


        if (customerVillage) {

            customerVillage.innerText =
                data.village || "";

        }


        // =================================================
        // PHOTO
        // =================================================

        const customerPhoto =
            document.getElementById(
                "customerPhoto"
            );


        if (
            customerPhoto &&
            data.photo
        ) {

            customerPhoto.src =
                data.photo;

        }


        // =================================================
        // LOAN DETAILS
        // =================================================

        const amount =
            Number(
                data.amount || 0
            );

        const toPay =
            Number(
                data.toPay || 0
            );

        const weeks =
            Number(
                data.weeks || 0
            );

        const weeklyPayment =
            Number(
                data.weeklyPayment || 0
            );


        // =================================================
        // ALREADY PAID DETAILS
        // =================================================

        const alreadyPaid =
            Number(
                data.alreadyPaid || 0
            );

        const alreadyPaidWeeks =
            Number(
                data.alreadyPaidWeeks || 0
            );


        console.log(
            "Already Paid:",
            alreadyPaid
        );

        console.log(
            "Already Paid Weeks:",
            alreadyPaidWeeks
        );


        // =================================================
        // INPUTS
        // =================================================

        const amountInput =
            document.getElementById(
                "amount"
            );

        const toPayInput =
            document.getElementById(
                "toPay"
            );

        const weeksInput =
            document.getElementById(
                "weeks"
            );

        const weeklyInput =
            document.getElementById(
                "weeklyPayment"
            );

        const alreadyPaidInput =
            document.getElementById(
                "alreadyPaid"
            );

        const alreadyPaidWeeksInput =
            document.getElementById(
                "alreadyPaidWeeks"
            );


        if (amountInput)
            amountInput.value =
                amount || "";


        if (toPayInput)
            toPayInput.value =
                toPay || "";


        if (weeksInput)
            weeksInput.value =
                weeks || "";


        if (weeklyInput)
            weeklyInput.value =
                weeklyPayment || "";


        if (alreadyPaidInput)
            alreadyPaidInput.value =
                alreadyPaid || "";


        if (alreadyPaidWeeksInput)
            alreadyPaidWeeksInput.value =
                alreadyPaidWeeks || "";


        // =================================================
        // SUMMARY
        // =================================================

        updateSummary(
            amount,
            toPay
        );


        // =================================================
        // WEEKLY TABLE
        // =================================================

        await createWeeks(
            weeks
        );


    } catch (error) {

        console.error(
            "కస్టమర్ లోడ్ లోపం:",
            error
        );

        alert(
            "కస్టమర్ వివరాలు లోడ్ కాలేదు: " +
            error.message
        );

    }

}


loadCustomer();


// =====================================================
// SUMMARY
// =====================================================

function updateSummary(
    totalLoan,
    balance
) {

    totalLoan =
        Number(totalLoan || 0);

    balance =
        Number(balance || 0);


    const totalPaid =
        Math.max(
            totalLoan - balance,
            0
        );


    const paidDisplay =
        document.getElementById(
            "paidAmountTotal"
        );

    const balanceDisplay =
        document.getElementById(
            "remainingBalance"
        );


    if (paidDisplay) {

        paidDisplay.innerText =
            "₹" +
            totalPaid.toLocaleString(
                "en-IN"
            );

    }


    if (balanceDisplay) {

        balanceDisplay.innerText =
            "₹" +
            balance.toLocaleString(
                "en-IN"
            );

    }

}


// =====================================================
// CALCULATE WEEKLY PAYMENT
// =====================================================

window.calculatePayments =
function () {

    const toPay =
        Number(
            document.getElementById(
                "toPay"
            )?.value
        ) || 0;


    const weeks =
        Number(
            document.getElementById(
                "weeks"
            )?.value
        ) || 0;


    const weeklyInput =
        document.getElementById(
            "weeklyPayment"
        );


    if (
        toPay > 0 &&
        weeks > 0
    ) {

        const weekly =
            toPay / weeks;


        if (weeklyInput) {

            weeklyInput.value =
                weekly.toFixed(2);

        }

    }

};


window.calculateWeekly =
    window.calculatePayments;


// =====================================================
// SAVE LOAN
// =====================================================

window.saveLoan =
async function () {

    const ownerData =
        localStorage.getItem(
            "ownerLogin"
        );


    if (!ownerData) {

        alert(
            "ఓనర్ లాగిన్ సెషన్ కనుగొనబడలేదు"
        );

        window.location.href =
            "owner-login.html";

        return;
    }


    let owner;

    try {

        owner =
            JSON.parse(
                ownerData
            );

    } catch {

        alert(
            "ఓనర్ లాగిన్ వివరాలు చెల్లుబాటు కావు"
        );

        return;

    }


    if (
        !owner ||
        !owner.ownerId
    ) {

        alert(
            "ఓనర్ లాగిన్ వివరాలు చెల్లుబాటు కావు"
        );

        return;
    }


    const ownerId =
        owner.ownerId;


    const amount =
        Number(
            document.getElementById(
                "amount"
            )?.value
        ) || 0;


    const toPay =
        Number(
            document.getElementById(
                "toPay"
            )?.value
        ) || 0;


    const weeks =
        Number(
            document.getElementById(
                "weeks"
            )?.value
        ) || 0;


    const weeklyPayment =
        Number(
            document.getElementById(
                "weeklyPayment"
            )?.value
        ) || 0;


    const alreadyPaid =
        Number(
            document.getElementById(
                "alreadyPaid"
            )?.value
        ) || 0;


    const alreadyPaidWeeks =
        Number(
            document.getElementById(
                "alreadyPaidWeeks"
            )?.value
        ) || 0;


    if (
        amount <= 0 ||
        toPay <= 0 ||
        weeks <= 0 ||
        weeklyPayment <= 0
    ) {

        alert(
            "దయచేసి రుణ వివరాలను పూర్తిగా నమోదు చేయండి"
        );

        return;

    }


    if (
        alreadyPaid < 0 ||
        alreadyPaidWeeks < 0
    ) {

        alert(
            "Already Paid వివరాలు సరైనవి కావు"
        );

        return;

    }


    if (
        alreadyPaidWeeks > weeks
    ) {

        alert(
            "Already Paid Weeks మొత్తం వారాల కంటే ఎక్కువ ఉండకూడదు"
        );

        return;

    }


    try {

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
                "కస్టమర్ కనుగొనబడలేదు"
            );

            return;

        }


        const customer =
            customerSnap.data();


        // =================================================
        // OWNER CHECK
        // =================================================

        if (
            customer.ownerId &&
            customer.ownerId !== ownerId
        ) {

            alert(
                "ఈ కస్టమర్ వివరాలను మీరు మార్చలేరు."
            );

            return;

        }


        // =================================================
        // UPDATE CUSTOMER
        // =================================================

        await updateDoc(
            customerRef,
            {

                amount:
                    amount,

                toPay:
                    toPay,

                weeks:
                    weeks,

                weeklyPayment:
                    weeklyPayment,

                alreadyPaid:
                    alreadyPaid,

                alreadyPaidWeeks:
                    alreadyPaidWeeks,

                ownerId:
                    ownerId

            }
        );


        // =================================================
        // SAVE LOAN HISTORY
        // =================================================

        await addDoc(
            collection(
                db,
                "dailyLoans"
            ),
            {

                ownerId:
                    ownerId,

                customerId:
                    customerId,

                serialNo:
                    customer.serialNo || "",

                customerName:
                    customer.customerName || "",

                loanAmount:
                    amount,

                toPay:
                    toPay,

                weeks:
                    weeks,

                weeklyPayment:
                    weeklyPayment,

                alreadyPaid:
                    alreadyPaid,

                alreadyPaidWeeks:
                    alreadyPaidWeeks,

                date:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                createdDate:
                    new Date()

            }
        );


        alert(
            "రుణ వివరాలు విజయవంతంగా సేవ్ అయ్యాయి"
        );


        await loadCustomer();


    } catch (error) {

        console.error(
            "రుణ సేవ్ లోపం:",
            error
        );

        alert(
            "రుణ వివరాలు సేవ్ కాలేదు: " +
            error.message
        );

    }

};


// =====================================================
// GET CUSTOMER PAYMENTS
// =====================================================

async function getCustomerPayments() {

    const q =
        query(
            collection(
                db,
                "payments"
            ),

            where(
                "customerId",
                "==",
                customerId
            )
        );


    const snap =
        await getDocs(q);


    const payments = [];


    snap.forEach(
        docSnap => {

            payments.push({

                id:
                    docSnap.id,

                ...docSnap.data()

            });

        }
    );


    return payments;

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(value) {

    if (!value)
        return "-";


    try {

        if (value.seconds) {

            return new Date(
                value.seconds * 1000
            ).toLocaleDateString(
                "en-IN"
            );

        }


        return new Date(
            value
        ).toLocaleDateString(
            "en-IN"
        );


    } catch {

        return "-";

    }

}


// =====================================================
// GET PAYMENT DATE
// =====================================================

function getPaymentDate(
    payments,
    week
) {

    const payment =
        payments
            .filter(
                p =>
                    p.paymentType ===
                    "weekly" &&
                    Number(
                        p.week || 0
                    ) === Number(week)
            )
            .sort(
                (a, b) =>
                    getTime(
                        b.paymentDate
                    ) -
                    getTime(
                        a.paymentDate
                    )
            )[0];


    if (!payment)
        return "-";


    return formatDate(
        payment.paymentDate
    );

}


// =====================================================
// GET TIME
// =====================================================

function getTime(value) {

    if (!value)
        return 0;


    if (value.seconds)
        return value.seconds * 1000;


    return new Date(value).getTime();

}


// =====================================================
// CREATE WEEKS
// ALREADY PAID WEEKS HIDE
// =====================================================

async function createWeeks(totalWeeks) {

    const tbody =
        document.getElementById(
            "paymentTable"
        );


    if (!tbody)
        return;


    tbody.replaceChildren();


    totalWeeks =
        Number(totalWeeks) || 0;


    const weekly =
        Number(
            document.getElementById(
                "weeklyPayment"
            )?.value
        ) || 0;


    // =================================================
    // ALREADY PAID WEEKS
    // =================================================

    const alreadyPaidWeeks =
        Number(
            document.getElementById(
                "alreadyPaidWeeks"
            )?.value
        ) || 0;


    // =================================================
    // CHECK LOAN
    // =================================================

    if (
        totalWeeks <= 0 ||
        weekly <= 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    వారపు చెల్లింపు వివరాలు లేవు
                </td>
            </tr>
        `;

        return;

    }


    try {

        // =================================================
        // GET PAYMENTS
        // =================================================

        const payments =
            await getCustomerPayments();


        // =================================================
        // WEEK WISE PAYMENTS
        // =================================================

        const weeklyPayments = {};


        payments.forEach(
            payment => {

                if (
                    payment.paymentType !==
                    "weekly"
                ) {

                    return;

                }


                const week =
                    Number(
                        payment.week || 0
                    );


                const amount =
                    Number(
                        payment.amount || 0
                    );


                if (
                    week >= 1 &&
                    week <= totalWeeks
                ) {

                    weeklyPayments[week] =
                        (
                            weeklyPayments[week] ||
                            0
                        ) +
                        amount;

                }

            }
        );


        // =================================================
        // START WEEK
        // =================================================
        // Example:
        // alreadyPaidWeeks = 12
        // Show from Week 13
        // =================================================

        const firstRemainingWeek =
            Math.max(
                alreadyPaidWeeks + 1,
                1
            );


        console.log(
            "Already Paid Weeks:",
            alreadyPaidWeeks
        );

        console.log(
            "First Week To Show:",
            firstRemainingWeek
        );


        // =================================================
        // ALL WEEKS ALREADY HIDDEN/COMPLETED
        // =================================================

        if (
            firstRemainingWeek >
            totalWeeks
        ) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5">

                        🎉 అన్ని వారాల చెల్లింపులు పూర్తయ్యాయి

                    </td>
                </tr>
            `;

            return;

        }


        // =================================================
        // SHOW WEEK 13 ONWARDS
        // =================================================

        for (
            let week = firstRemainingWeek;
            week <= totalWeeks;
            week++
        ) {


            // =================================================
            // TOTAL PAID FOR THIS WEEK
            // =================================================

            const paid =
                Number(
                    weeklyPayments[week] || 0
                );


            // =================================================
            // REMAINING FOR THIS WEEK
            // =================================================

            const remaining =
                Math.max(
                    weekly - paid,
                    0
                );


            let statusHTML =
                "";

            let actionHTML =
                "";


            // =================================================
            // FULLY PAID
            // =================================================

            if (
                paid >= weekly
            ) {

                statusHTML = `
                    <span class="paid">
                        ✅ చెల్లించారు
                    </span>
                `;


                actionHTML = `
                    <button
                        disabled>
                        చెల్లించారు
                    </button>
                `;

            }


            // =================================================
            // PARTIAL PAYMENT
            // =================================================

            else if (
                paid > 0
            ) {

                statusHTML = `
                    <span class="pending">
                        🟠 కొంత చెల్లించారు
                    </span>
                `;


                actionHTML = `
                    <button
                        class="pay-btn"
                        onclick="openPayment(
                            ${week},
                            ${remaining}
                        )">

                        చెల్లించండి

                    </button>
                `;

            }


            // =================================================
            // NOT PAID
            // =================================================

            else {

                statusHTML = `
                    <span class="pending">
                        🟠 పెండింగ్
                    </span>
                `;


                actionHTML = `
                    <button
                        class="pay-btn"
                        onclick="openPayment(
                            ${week},
                            ${weekly}
                        )">

                        చెల్లించండి

                    </button>
                `;

            }


            // =================================================
            // PAYMENT DATE
            // =================================================

            const paymentDate =
                getPaymentDate(
                    payments,
                    week
                );


            // =================================================
            // TABLE ROW
            // =================================================

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    వారం ${week}
                </td>


                <td>

                    ₹${paid.toLocaleString("en-IN")}

                    ${
                        paid > 0 &&
                        paid < weekly
                        ?
                        `
                        <br>

                        <small>
                            మిగిలినది ₹${remaining.toLocaleString("en-IN")}
                        </small>
                        `
                        :
                        ""
                    }

                </td>


                <td>
                    ${paymentDate}
                </td>


                <td>
                    ${statusHTML}
                </td>


                <td>
                    ${actionHTML}
                </td>

            `;


            tbody.appendChild(
                row
            );

        }


        // =================================================
        // CHECK LOAN COMPLETED
        // =================================================

        let completed =
            true;


        for (
            let week = 1;
            week <= totalWeeks;
            week++
        ) {

            const paid =
                Number(
                    weeklyPayments[week] || 0
                );


            // Weeks before alreadyPaidWeeks
            // are considered completed.

            if (
                week <= alreadyPaidWeeks
            ) {

                continue;

            }


            if (
                paid < weekly
            ) {

                completed =
                    false;

                break;

            }

        }


        // =================================================
        // LOAN COMPLETED MESSAGE
        // =================================================

        if (
            completed
        ) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5">

                        🎉 Loan Completed

                    </td>
                </tr>
            `;

        }


    } catch (error) {

        console.error(
            "Create Weeks Error:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td colspan="5">

                    వారపు చెల్లింపులు లోడ్ చేయడంలో సమస్య వచ్చింది

                </td>
            </tr>
        `;

    }

}

// =====================================================
// OPEN PAYMENT
// =====================================================

window.openPayment =
function (
    week,
    amount
) {

    selectedPaymentType =
        "weekly";


    selectedWeek =
        Number(week);


    const title =
        document.getElementById(
            "weekTitle"
        );


    if (title) {

        title.innerText =
            "📅 వారం " + week;

    }


    const paidAmount =
        document.getElementById(
            "paidAmount"
        );


    if (paidAmount) {

        paidAmount.value =
            amount || "";

    }


    const popup =
        document.getElementById(
            "paymentPopup"
        );


    if (popup) {

        popup.style.display =
            "block";

    }

};


// =====================================================
// OLD openWeek
// =====================================================

window.openWeek =
function (
    week,
    amount
) {

    openPayment(
        week,
        amount
    );

};


// =====================================================
// CLOSE POPUP
// =====================================================

window.closePopup =
function () {

    const popup =
        document.getElementById(
            "paymentPopup"
        );


    if (popup) {

        popup.style.display =
            "none";

    }

};


// =====================================================
// SAVE PAYMENT
// =====================================================

// =====================================================
// SAVE PAYMENT
// SUPPORTS MULTI-WEEK PAYMENT
// Example: ₹1200
// Week 13 = ₹500 Paid
// Week 14 = ₹500 Paid
// Week 15 = ₹200 Partial
// =====================================================

// =====================================================
// SAVE PAYMENT
// IMPORTANT:
// PAYMENT ALWAYS CLEARS EARLIEST PENDING WEEK FIRST
// =====================================================

window.savePayment =
async function () {

    // =================================================
    // OWNER LOGIN
    // =================================================

    const ownerData =
        localStorage.getItem(
            "ownerLogin"
        );


    if (!ownerData) {

        alert(
            "ఓనర్ లాగిన్ సెషన్ కనుగొనబడలేదు"
        );

        window.location.href =
            "owner-login.html";

        return;

    }


    let owner;


    try {

        owner =
            JSON.parse(
                ownerData
            );

    } catch {

        alert(
            "ఓనర్ లాగిన్ వివరాలు చెల్లుబాటు కావు"
        );

        return;

    }


    if (
        !owner ||
        !owner.ownerId
    ) {

        alert(
            "ఓనర్ లాగిన్ వివరాలు చెల్లుబాటు కావు"
        );

        return;

    }


    const ownerId =
        owner.ownerId;


    // =================================================
    // ENTERED PAYMENT AMOUNT
    // =================================================

    const paidAmount =
        Number(
            document.getElementById(
                "paidAmount"
            )?.value
        ) || 0;


    if (
        paidAmount <= 0
    ) {

        alert(
            "దయచేసి చెల్లింపు మొత్తాన్ని నమోదు చేయండి"
        );

        return;

    }


    try {

        // =================================================
        // CUSTOMER
        // =================================================

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


        if (
            !customerSnap.exists()
        ) {

            alert(
                "కస్టమర్ కనుగొనబడలేదు"
            );

            return;

        }


        const customer =
            customerSnap.data();


        // =================================================
        // OWNER CHECK
        // =================================================

        if (
            customer.ownerId &&
            customer.ownerId !== ownerId
        ) {

            alert(
                "ఈ కస్టమర్ కోసం మీరు చెల్లింపు నమోదు చేయలేరు."
            );

            return;

        }


        // =================================================
        // LOAN DETAILS
        // =================================================

        const currentBalance =
            Number(
                customer.toPay || 0
            );


        const totalWeeks =
            Number(
                customer.weeks || 0
            );


        const weeklyAmount =
            Number(
                customer.weeklyPayment || 0
            );


        const alreadyPaidWeeks =
            Number(
                customer.alreadyPaidWeeks || 0
            );


        // =================================================
        // VALIDATION
        // =================================================

        if (
            currentBalance <= 0
        ) {

            alert(
                "🎉 ఈ లోన్ ఇప్పటికే పూర్తిగా చెల్లించబడింది."
            );

            await createWeeks(
                totalWeeks
            );

            return;

        }


        if (
            paidAmount >
            currentBalance
        ) {

            alert(
                "చెల్లింపు మిగిలిన మొత్తం ₹" +
                currentBalance.toLocaleString(
                    "en-IN"
                ) +
                " కంటే ఎక్కువ ఉండకూడదు"
            );

            return;

        }


        if (
            totalWeeks <= 0 ||
            weeklyAmount <= 0
        ) {

            alert(
                "వారపు లోన్ వివరాలు సరిగా లేవు"
            );

            return;

        }


        // =================================================
        // GET ALL EXISTING PAYMENTS
        // =================================================

        const payments =
            await getCustomerPayments();


        // =================================================
        // WEEK-WISE PAYMENT TOTAL
        // =================================================

        const weeklyPayments = {};


        payments.forEach(
            payment => {

                if (
                    payment.paymentType !==
                    "weekly"
                ) {

                    return;

                }


                const week =
                    Number(
                        payment.week || 0
                    );


                const amount =
                    Number(
                        payment.amount || 0
                    );


                if (
                    week >= 1 &&
                    week <= totalWeeks
                ) {

                    weeklyPayments[week] =
                        (
                            weeklyPayments[week] ||
                            0
                        ) +
                        amount;

                }

            }
        );


        // =================================================
        // IMPORTANT
        //
        // START FROM FIRST VISIBLE WEEK
        //
        // If alreadyPaidWeeks = 12
        // Start = Week 13
        //
        // DO NOT USE selectedWeek HERE.
        //
        // This fixes:
        //
        // Week 19 = ₹300 paid
        // Week 21 = ₹200 paid
        //
        // ₹700 payment:
        //
        // ₹200 -> Week 19
        // ₹500 -> Week 21
        // =================================================

        let paymentToDistribute =
            paidAmount;


        let currentWeek =
            Math.max(
                alreadyPaidWeeks + 1,
                1
            );


        // =================================================
        // STORE WHAT WAS PAID
        // FOR SUCCESS MESSAGE
        // =================================================

        const savedPayments = [];


        // =================================================
        // FIND AND CLEAR PENDING WEEKS
        // =================================================

        while (
            paymentToDistribute > 0 &&
            currentWeek <= totalWeeks
        ) {

            const alreadyPaid =
                Number(
                    weeklyPayments[
                        currentWeek
                    ] || 0
                );


            // =================================================
            // THIS WEEK REMAINING
            // =================================================

            const weekRemaining =
                Math.max(
                    weeklyAmount -
                    alreadyPaid,
                    0
                );


            // =================================================
            // WEEK ALREADY FULLY PAID
            // SKIP IT
            // =================================================

            if (
                weekRemaining <= 0
            ) {

                currentWeek++;

                continue;

            }


            // =================================================
            // AMOUNT TO APPLY TO THIS WEEK
            // =================================================

            const amountForWeek =
                Math.min(
                    paymentToDistribute,
                    weekRemaining
                );


            // =================================================
            // NEW TOTAL FOR THIS WEEK
            // =================================================

            const newWeekTotal =
                alreadyPaid +
                amountForWeek;


            // =================================================
            // STATUS
            // =================================================

            const paymentStatus =
                newWeekTotal >= weeklyAmount
                    ? "చెల్లించారు"
                    : "కొంత చెల్లించారు";


            // =================================================
            // SAVE PAYMENT
            // =================================================

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
                        "weekly",

                    week:
                        currentWeek,

                    amount:
                        amountForWeek,

                    paymentDate:
                        new Date(),

                    status:
                        paymentStatus

                }
            );


            // =================================================
            // UPDATE LOCAL WEEK TOTAL
            // =================================================

            weeklyPayments[
                currentWeek
            ] =
                newWeekTotal;


            // =================================================
            // SAVE FOR SUCCESS MESSAGE
            // =================================================

            savedPayments.push({

                week:
                    currentWeek,

                amount:
                    amountForWeek,

                totalPaid:
                    newWeekTotal,

                remaining:
                    Math.max(
                        weeklyAmount -
                        newWeekTotal,
                        0
                    )

            });


            // =================================================
            // REDUCE REMAINING PAYMENT
            // =================================================

            paymentToDistribute -=
                amountForWeek;


            // =================================================
            // MOVE TO NEXT WEEK
            //
            // If current week is fully paid,
            // go to next week.
            //
            // If partial, payment is finished
            // because paymentToDistribute becomes 0.
            // =================================================

            if (
                weeklyPayments[
                    currentWeek
                ] >= weeklyAmount
            ) {

                currentWeek++;

            }

        }


        // =================================================
        // SAFETY CHECK
        // =================================================

        if (
            paymentToDistribute > 0
        ) {

            alert(
                "చెల్లింపు మొత్తం మొత్తం వారాలకు సరిపడలేదు."
            );

            return;

        }


        // =================================================
        // UPDATE LOAN BALANCE
        // =================================================

        const newBalance =
            Math.max(
                currentBalance -
                paidAmount,
                0
            );


        await updateDoc(
            customerRef,
            {

                toPay:
                    newBalance,

                ownerId:
                    ownerId

            }
        );


        // =================================================
        // UPDATE TO PAY INPUT
        // =================================================

        const toPayInput =
            document.getElementById(
                "toPay"
            );


        if (toPayInput) {

            toPayInput.value =
                newBalance;

        }


        // =================================================
        // CLEAR PAYMENT INPUT
        // =================================================

        const paidInput =
            document.getElementById(
                "paidAmount"
            );


        if (paidInput) {

            paidInput.value =
                "";

        }


        // =================================================
        // CLOSE POPUP
        // =================================================

        closePopup();


        // =================================================
        // SUCCESS MESSAGE
        // =================================================

        let message =
            "✅ చెల్లింపు విజయవంతంగా సేవ్ చేయబడింది\n\n";


        savedPayments.forEach(
            item => {

                if (
                    item.totalPaid >=
                    weeklyAmount
                ) {

                    message +=
                        "వారం " +
                        item.week +
                        " → ₹" +
                        item.amount.toLocaleString(
                            "en-IN"
                        ) +
                        " → ✅ Paid\n";

                } else {

                    message +=
                        "వారం " +
                        item.week +
                        " → ₹" +
                        item.amount.toLocaleString(
                            "en-IN"
                        ) +
                        " → 🟠 Partial\n" +
                        "మిగిలినది → ₹" +
                        item.remaining.toLocaleString(
                            "en-IN"
                        ) +
                        "\n";

                }

            }
        );


        // =================================================
        // LOAN COMPLETED
        // =================================================

        if (
            newBalance === 0
        ) {

            message +=
                "\n🎉 Loan Completed";

        }


        alert(
            message
        );


        // =================================================
        // REFRESH WEEKS
        // =================================================

        await createWeeks(
            totalWeeks
        );


        // =================================================
        // UPDATE SUMMARY
        // =================================================

        updateSummary(
            Number(
                document.getElementById(
                    "amount"
                )?.value
            ) || 0,

            newBalance
        );


    } catch (error) {

        console.error(
            "చెల్లింపు సేవ్ లోపం:",
            error
        );


        alert(
            "చెల్లింపు సేవ్ కాలేదు: " +
            error.message
        );

    }

};
// =====================================================
// OLD saveWeekPayment SUPPORT
// =====================================================

window.saveWeekPayment =
async function () {

    await savePayment();

};