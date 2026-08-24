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

const params =
    new URLSearchParams(window.location.search);

const customerId =
    params.get("id");

if (!customerId) {

    alert("కస్టమర్ ఐడీ కనుగొనబడలేదు");

    throw new Error("Customer ID Missing");

}


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let selectedWeek = 0;
let selectedMonth = 0;
let selectedDay = 0;

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

            alert("Customer Not Found");

            return;
        }


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

        const monthlyPayment =
            Number(
                data.monthlyPayment || 0
            );

        const dailyPayment =
            Number(
                data.dailyPayment || 0
            );


        // =================================================
        // SET INPUT VALUES
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

        const monthlyInput =
            document.getElementById(
                "monthlyPayment"
            );

        const dailyInput =
            document.getElementById(
                "dailyPayment"
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


        if (monthlyInput)
            monthlyInput.value =
                monthlyPayment || "";


        if (dailyInput)
            dailyInput.value =
                dailyPayment || "";


        // =================================================
        // UPDATE SUMMARY
        // =================================================

        updateSummary(
            amount,
            toPay
        );


        // =================================================
        // LOAD ALL COLLECTION TABLES
        // =================================================

        await createWeeks(
            weeks
        );

        await createMonthlyPayments();

        await createDailyPayments();


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

// =====================================================
// UPDATE SUMMARY - ACTUAL PAYMENTS FROM FIRESTORE
// =====================================================

async function updateSummary() {

    try {

        const payments = await getCustomerPayments();

        // ---------------------------------------------
        // TOTAL ACTUAL PAID
        // Weekly + Monthly + Daily
        // ---------------------------------------------

        let totalPaid = 0;

        payments.forEach(payment => {

            totalPaid += Number(payment.amount || 0);

        });


        // ---------------------------------------------
        // CURRENT LOAN AMOUNT
        // ---------------------------------------------

        const amount =
            Number(
                document.getElementById("amount")?.value
            ) || 0;


        // ---------------------------------------------
        // CURRENT BALANCE
        // ---------------------------------------------

        const balance =
            Number(
                document.getElementById("toPay")?.value
            ) || 0;


        // ---------------------------------------------
        // DISPLAY PAID
        // ---------------------------------------------

        const paidDisplay =
            document.getElementById(
                "paidAmountTotal"
            );


        if (paidDisplay) {

            paidDisplay.innerText =
                "₹" +
                totalPaid.toLocaleString("en-IN");

        }


        // ---------------------------------------------
        // DISPLAY BALANCE
        // ---------------------------------------------

        const balanceDisplay =
            document.getElementById(
                "remainingBalance"
            );


        if (balanceDisplay) {

            balanceDisplay.innerText =
                "₹" +
                balance.toLocaleString("en-IN");

        }


        console.log(
            "================================"
        );

        console.log(
            "Loan Amount:",
            amount
        );

        console.log(
            "Actual Total Paid:",
            totalPaid
        );

        console.log(
            "Current Balance:",
            balance
        );

        console.log(
            "================================"
        );

    }
    catch(error) {

        console.error(
            "Summary Error:",
            error
        );

    }

}


// =====================================================
// CALCULATE PAYMENTS
// =====================================================

window.calculatePayments = function () {

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


// =====================================================
// OLD FUNCTION SUPPORT
// =====================================================

window.calculateWeekly =
    window.calculatePayments;


// =====================================================
// SAVE LOAN
// =====================================================

window.saveLoan = async function () {

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

    } catch (error) {

        alert(
            "Owner Login Invalid"
        );

        return;
    }


    if (
        !owner ||
        !owner.ownerId
    ) {

        alert(
            "Owner Login Invalid"
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


    const monthlyPayment =
        Number(
            document.getElementById(
                "monthlyPayment"
            )?.value
        ) || 0;


    const dailyPayment =
        Number(
            document.getElementById(
                "dailyPayment"
            )?.value
        ) || 0;


    if (
        amount <= 0 ||
        toPay <= 0
    ) {

        alert(
            "దయచేసి Loan Amount మరియు Remaining Amount నమోదు చేయండి"
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


        // =================================================
        // CHECK CUSTOMER
        // =================================================

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


        // =================================================
        // OWNER CHECK
        // =================================================

        if (
            customer.ownerId &&
            customer.ownerId !== ownerId
        ) {

            alert(
                "You cannot modify this customer."
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

                monthlyPayment:
                    monthlyPayment,

                dailyPayment:
                    dailyPayment,

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

                monthlyPayment:
                    monthlyPayment,

                dailyPayment:
                    dailyPayment,

                date:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                createdDate:
                    new Date()

            }
        );


        alert(
            "Loan Details Saved Successfully"
        );


        await loadCustomer();


    } catch (error) {

        console.error(
            "Save Loan Error:",
            error
        );

        alert(
            "Loan Save Failed: " +
            error.message
        );

    }

};


// =====================================================
// GET ALL PAYMENTS
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

        if (
            value.seconds
        ) {

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
// CREATE WEEKLY TABLE
// =====================================================

async function createWeeks(
    totalWeeks
) {

    const tbody =
        document.getElementById(
            "paymentTable"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const weekly =
        Number(
            document.getElementById(
                "weeklyPayment"
            )?.value
        ) || 0;


    const loanAmount =
        Number(
            document.getElementById(
                "amount"
            )?.value
        ) || 0;


    const balance =
        Number(
            document.getElementById(
                "toPay"
            )?.value
        ) || 0;


    if (
        totalWeeks <= 0 ||
        weekly <= 0
    ) {

        return;

    }


    try {

        const payments =
            await getCustomerPayments();


        const weeklyPayments = {};


        payments.forEach(
            payment => {

                if (
                    payment.paymentType ===
                    "weekly" ||
                    payment.week
                ) {

                    const week =
                        Number(
                            payment.week || 0
                        );


                    if (week > 0) {

                        weeklyPayments[week] =
                            (
                                weeklyPayments[week] ||
                                0
                            ) +
                            Number(
                                payment.amount || 0
                            );

                    }

                }

            }
        );


        // =================================================
        // OLD LOAN SUPPORT
        // =================================================

        const actualPaid =
            Math.max(
                loanAmount -
                balance,
                0
            );


        let oldPaid =
            actualPaid;


        for (
            let i = 1;
            i <= totalWeeks;
            i++
        ) {

            if (
                weeklyPayments[i] ===
                undefined &&
                oldPaid > 0
            ) {

                const amount =
                    Math.min(
                        weekly,
                        oldPaid
                    );


                weeklyPayments[i] =
                    amount;


                oldPaid -=
                    amount;

            }

        }


        // =================================================
        // CREATE ROWS
        // =================================================

        for (
            let i = 1;
            i <= totalWeeks;
            i++
        ) {

            const paid =
                Number(
                    weeklyPayments[i] || 0
                );


            const remaining =
                Math.max(
                    weekly -
                    paid,
                    0
                );


            let status = "";
            let action = "";


            if (
                paid >= weekly
            ) {

                status =
                    `<span class="paid">✅ Paid</span>`;

                action =
                    `<button disabled>Paid</button>`;

            }

            else if (
                paid > 0
            ) {

                status =
                    `<span class="pending">🟠 Partial</span>`;

                action = `
                    <button
                        class="pay-btn"
                        onclick="openPayment(
                            'weekly',
                            ${i},
                            ${remaining}
                        )">
                        Pay
                    </button>
                `;

            }

            else {

                status =
                    `<span class="pending">🟠 Pending</span>`;

                action = `
                    <button
                        class="pay-btn"
                        onclick="openPayment(
                            'weekly',
                            ${i},
                            ${weekly}
                        )">
                        Pay
                    </button>
                `;

            }


            tbody.innerHTML += `

                <tr>

                    <td>
                        Week ${i}
                    </td>

                    <td>

                        ₹${paid.toLocaleString("en-IN")}

                        ${
                            paid > 0 &&
                            paid < weekly
                            ?
                            `<br>
                             <small>
                             Balance ₹${remaining.toLocaleString("en-IN")}
                             </small>`
                            :
                            ""
                        }

                    </td>

                    <td>
                        ${getPaymentDate(
                            payments,
                            "weekly",
                            i
                        )}
                    </td>

                    <td>
                        ${status}
                    </td>

                    <td>
                        ${action}
                    </td>

                </tr>

            `;

        }


        updateSummary(
            loanAmount,
            balance
        );


    } catch (error) {

        console.error(
            "createWeeks Error:",
            error
        );

    }

}


// =====================================================
// PAYMENT DATE
// =====================================================

function getPaymentDate(
    payments,
    type,
    period
) {

    const payment =
        payments
            .filter(
                p =>
                    (
                        p.paymentType === type ||
                        (
                            type === "weekly" &&
                            p.week
                        )
                    ) &&
                    Number(
                        p.week ||
                        p.month ||
                        p.day
                    ) === Number(period)
            )
            .sort(
                (a, b) =>
                    getTime(b.paymentDate) -
                    getTime(a.paymentDate)
            )[0];


    if (!payment)
        return "-";


    return formatDate(
        payment.paymentDate
    );

}


function getTime(value) {

    if (!value)
        return 0;


    if (value.seconds)
        return value.seconds * 1000;


    return new Date(value).getTime();

}


// =====================================================
// CREATE MONTHLY TABLE
// =====================================================

async function createMonthlyPayments() {

    const tbody =
        document.getElementById(
            "monthlyPaymentTable"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const monthly =
        Number(
            document.getElementById(
                "monthlyPayment"
            )?.value
        ) || 0;


    if (monthly <= 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    Monthly payment not set
                </td>
            </tr>
        `;

        return;
    }


    try {

        const payments =
            await getCustomerPayments();


        const monthlyPayments = {};


        payments.forEach(
            payment => {

                if (
                    payment.paymentType ===
                    "monthly"
                ) {

                    const month =
                        Number(
                            payment.month || 0
                        );


                    if (month > 0) {

                        monthlyPayments[month] =
                            (
                                monthlyPayments[month] ||
                                0
                            ) +
                            Number(
                                payment.amount || 0
                            );

                    }

                }

            }
        );


        // 12 months

        for (
            let month = 1;
            month <= 12;
            month++
        ) {

            const paid =
                Number(
                    monthlyPayments[month] ||
                    0
                );


            const remaining =
                Math.max(
                    monthly -
                    paid,
                    0
                );


            let status;
            let action;


            if (
                paid >= monthly
            ) {

                status =
                    `<span class="paid">✅ Paid</span>`;

                action =
                    `<button disabled>Paid</button>`;

            }

            else if (
                paid > 0
            ) {

                status =
                    `<span class="pending">🟠 Partial</span>`;

                action = `
                    <button
                        class="pay-btn"
                        onclick="openPayment(
                            'monthly',
                            ${month},
                            ${remaining}
                        )">
                        Pay
                    </button>
                `;

            }

            else {

                status =
                    `<span class="pending">🟠 Pending</span>`;

                action = `
                    <button
                        class="pay-btn"
                        onclick="openPayment(
                            'monthly',
                            ${month},
                            ${monthly}
                        )">
                        Pay
                    </button>
                `;

            }


            tbody.innerHTML += `

                <tr>

                    <td>
                        Month ${month}
                    </td>

                    <td>
                        ₹${paid.toLocaleString("en-IN")}
                    </td>

                    <td>
                        ${getPaymentDate(
                            payments,
                            "monthly",
                            month
                        )}
                    </td>

                    <td>
                        ${status}
                    </td>

                    <td>
                        ${action}
                    </td>

                </tr>

            `;

        }


    } catch (error) {

        console.error(
            "Monthly Error:",
            error
        );

    }

}


// =====================================================
// CREATE DAILY TABLE
// =====================================================

async function createDailyPayments() {

    const tbody =
        document.getElementById(
            "dailyPaymentTable"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    const daily =
        Number(
            document.getElementById(
                "dailyPayment"
            )?.value
        ) || 0;


    if (daily <= 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    Daily payment not set
                </td>
            </tr>
        `;

        return;
    }


    try {

        const payments =
            await getCustomerPayments();


        const today =
            new Date();


        const daysInMonth =
            new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                0
            ).getDate();


        const dailyPayments = {};


        payments.forEach(
            payment => {

                if (
                    payment.paymentType ===
                    "daily"
                ) {

                    const day =
                        Number(
                            payment.day || 0
                        );


                    if (day > 0) {

                        dailyPayments[day] =
                            (
                                dailyPayments[day] ||
                                0
                            ) +
                            Number(
                                payment.amount || 0
                            );

                    }

                }

            }
        );


        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const paid =
                Number(
                    dailyPayments[day] ||
                    0
                );


            const remaining =
                Math.max(
                    daily -
                    paid,
                    0
                );


            let status;
            let action;


            if (
                paid >= daily
            ) {

                status =
                    `<span class="paid">✅ Paid</span>`;

                action =
                    `<button disabled>Paid</button>`;

            }

            else if (
                paid > 0
            ) {

                status =
                    `<span class="pending">🟠 Partial</span>`;

                action = `
                    <button
                        class="pay-btn"
                        onclick="openPayment(
                            'daily',
                            ${day},
                            ${remaining}
                        )">
                        Pay
                    </button>
                `;

            }

            else {

                status =
                    `<span class="pending">🟠 Pending</span>`;

                action = `
                    <button
                        class="pay-btn"
                        onclick="openPayment(
                            'daily',
                            ${day},
                            ${daily}
                        )">
                        Pay
                    </button>
                `;

            }


            tbody.innerHTML += `

                <tr>

                    <td>
                        Day ${day}
                    </td>

                    <td>
                        ₹${paid.toLocaleString("en-IN")}
                    </td>

                    <td>
                        ${getPaymentDate(
                            payments,
                            "daily",
                            day
                        )}
                    </td>

                    <td>
                        ${status}
                    </td>

                    <td>
                        ${action}
                    </td>

                </tr>

            `;

        }


    } catch (error) {

        console.error(
            "Daily Error:",
            error
        );

    }

}


// =====================================================
// OPEN PAYMENT POPUP
// =====================================================

window.openPayment =
function (
    type,
    period,
    amount
) {

    selectedPaymentType =
        type;


    if (type === "weekly") {

        selectedWeek =
            Number(period);

        selectedMonth = 0;
        selectedDay = 0;

    }


    if (type === "monthly") {

        selectedMonth =
            Number(period);

        selectedWeek = 0;
        selectedDay = 0;

    }


    if (type === "daily") {

        selectedDay =
            Number(period);

        selectedWeek = 0;
        selectedMonth = 0;

    }


    const title =
        document.getElementById(
            "paymentTitle"
        );


    if (title) {

        if (type === "weekly") {

            title.innerText =
                "📅 Week " + period;

        }

        else if (
            type === "monthly"
        ) {

            title.innerText =
                "🗓️ Month " + period;

        }

        else {

            title.innerText =
                "📆 Day " + period;

        }

    }


    const paymentType =
        document.getElementById(
            "paymentType"
        );


    const paymentPeriod =
        document.getElementById(
            "paymentPeriod"
        );


    if (paymentType)
        paymentType.value =
            type;


    if (paymentPeriod)
        paymentPeriod.value =
            period;


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
// OLD openWeek SUPPORT
// =====================================================

window.openWeek =
function (
    week,
    amount
) {

    openPayment(
        "weekly",
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
// WEEKLY + MONTHLY + DAILY
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
            "Owner Login Invalid"
        );

        return;

    }


    if (
        !owner ||
        !owner.ownerId
    ) {

        alert(
            "Owner Login Invalid"
        );

        return;

    }


    const ownerId =
        owner.ownerId;


    // =================================================
    // PAYMENT AMOUNT
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
            "Enter Amount"
        );

        return;

    }


    // =================================================
    // PAYMENT TYPE
    // =================================================

    const paymentType =
        document.getElementById(
            "paymentType"
        )?.value;


    const paymentPeriod =
        Number(
            document.getElementById(
                "paymentPeriod"
            )?.value
        ) || 0;


    if (
        !paymentType ||
        paymentPeriod <= 0
    ) {

        alert(
            "Payment period not selected"
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
                "Customer Not Found"
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
                "You cannot make payment for this customer."
            );

            return;

        }


        // =================================================
        // CURRENT BALANCE
        // =================================================

        const currentBalance =
            Number(
                customer.toPay || 0
            );


        // =================================================
        // BALANCE CHECK
        // =================================================

        if (
            paidAmount >
            currentBalance
        ) {

            alert(
                "Payment cannot be greater than remaining balance ₹" +
                currentBalance.toLocaleString(
                    "en-IN"
                )
            );

            return;

        }


        // =================================================
        // PAYMENT DATA
        // =================================================

        const paymentData = {

            ownerId:
                ownerId,

            customerId:
                customerId,

            paymentType:
                paymentType,

            amount:
                paidAmount,

            paymentDate:
                new Date(),

            status:
                "చెల్లించారు"

        };


        // =================================================
        // SAVE PERIOD
        // =================================================

        if (
            paymentType ===
            "weekly"
        ) {

            paymentData.week =
                paymentPeriod;

        }


        if (
            paymentType ===
            "monthly"
        ) {

            paymentData.month =
                paymentPeriod;

        }


        if (
            paymentType ===
            "daily"
        ) {

            paymentData.day =
                paymentPeriod;

        }


        // =================================================
        // SAVE PAYMENT
        // =================================================

        await addDoc(
            collection(
                db,
                "payments"
            ),
            paymentData
        );


        // =================================================
        // UPDATE BALANCE
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
                    newBalance

            }
        );


        // =================================================
        // UPDATE INPUT
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
        // CLOSE POPUP
        // =================================================

        const paidInput =
            document.getElementById(
                "paidAmount"
            );


        if (paidInput) {

            paidInput.value =
                "";

        }


        closePopup();


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            "Payment Saved Successfully"
        );


        // =================================================
        // REFRESH EVERYTHING
        // =================================================

        await createWeeks(
            Number(
                document.getElementById(
                    "weeks"
                )?.value
            ) || 0
        );


        await createMonthlyPayments();

        await createDailyPayments();


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
            "Payment Save Error:",
            error
        );


        alert(
            "Payment Failed: " +
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


// =====================================================
// COLLECTION SWITCH
// =====================================================

window.showCollection =
function (type) {

    const weekly =
        document.getElementById(
            "weeklyCollection"
        );

    const monthly =
        document.getElementById(
            "monthlyCollection"
        );

    const daily =
        document.getElementById(
            "dailyCollection"
        );


    if (weekly)
        weekly.style.display =
            "none";


    if (monthly)
        monthly.style.display =
            "none";


    if (daily)
        daily.style.display =
            "none";


    // =================================================
    // BUTTONS
    // =================================================

    document
        .querySelectorAll(
            ".collection-btn"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "active"
                )
        );


    if (
        type === "weekly"
    ) {

        if (weekly)
            weekly.style.display =
                "block";


        document
            .getElementById(
                "weeklyBtn"
            )
            ?.classList.add(
                "active"
            );

    }


    if (
        type === "monthly"
    ) {

        if (monthly)
            monthly.style.display =
                "block";


        document
            .getElementById(
                "monthlyBtn"
            )
            ?.classList.add(
                "active"
            );

    }


    if (
        type === "daily"
    ) {

        if (daily)
            daily.style.display =
                "block";


        document
            .getElementById(
                "dailyBtn"
            )
            ?.classList.add(
                "active"
            );

    }

};