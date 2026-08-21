import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    query,
    where,
    
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =================================================
// GET DAY
// =================================================

const params = new URLSearchParams(window.location.search);

const day = params.get("day");

const session = params.get("session");

console.log("DAY:", day);
console.log("SESSION:", session);


// =================================================
// OWNER LOGIN
// =================================================

const ownerData = localStorage.getItem("ownerLogin");

if (!ownerData) {

    alert("Owner login session not found. Please login again.");

    window.location.href = "owner-login.html";

    throw new Error("Owner login not found");

}

const owner = JSON.parse(ownerData);

if (!owner || !owner.ownerId) {

    alert("Invalid owner login session. Please login again.");

    localStorage.removeItem("ownerLogin");

    window.location.href = "owner-login.html";

    throw new Error("Invalid owner login");

}

const ownerId = owner.ownerId;

console.log("CURRENT OWNER ID:", ownerId);
console.log("CURRENT DAY:", day);


// =================================================
// DAY TITLE
// =================================================

const sessionName =
    session === "morning"
        ? "🌅 Morning Customers"
        : "🌆 Evening Customers";

document.getElementById("dayTitle").innerHTML =
    "Day " + day + " - " + sessionName;


// =================================================
// CUSTOMER ARRAY
// =================================================

let allCustomers = [];


// =================================================
// LOAD CUSTOMERS
// =================================================

async function loadCustomers() {

    try {

        console.log("Loading customers...");

        const q = query(
    collection(db, "customers"),
    where("day", "==", day),
    where("ownerId", "==", ownerId),
    where("session", "==", session)
);
        const querySnapshot = await getDocs(q);


        allCustomers = [];


        querySnapshot.forEach((docSnap) => {

    const data = docSnap.data();

    data.id = docSnap.id;

    allCustomers.push(data);

});


// Serial Number 1, 2, 3, 4... order

allCustomers.sort((a, b) => {

    return Number(a.serialNo || 0) -
           Number(b.serialNo || 0);

});


displayCustomers(allCustomers);

    } catch (error) {

        console.error(
            "Load Customers Error:",
            error
        );

        alert(
            "Customers load failed: " +
            error.message
        );

    }

}


// =================================================
// DISPLAY CUSTOMERS
// =================================================

function displayCustomers(customers) {

    const tbody =
        document.getElementById("customerTable");


    if (!tbody) {

        console.error(
            "customerTable not found"
        );

        return;

    }


    tbody.innerHTML = "";


    if (customers.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9"
                    style="text-align:center;padding:20px;">
                    No Customers Found
                </td>
            </tr>
        `;

        return;

    }


    customers.forEach((customer) => {


        // ==========================================
        // LOCATION
        // ==========================================

        const location =
            customer.location || "";


        let locationHTML =
            "No Location";


        if (location) {

            locationHTML = `
                <a
                    href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}"
                    target="_blank"
                    style="
                        display:inline-block;
                        padding:7px 10px;
                        background:#1565c0;
                        color:white;
                        text-decoration:none;
                        border-radius:6px;
                        font-weight:bold;
                        font-size:13px;
                    "
                >
                    📍 Map Location
                </a>
            `;

        }


        // ==========================================
        // CUSTOMER PHOTO
        // ==========================================

        let photoHTML = "No Photo";


        if (customer.photo) {

            photoHTML = `
                <img
                    src="${customer.photo}"
                    style="
                        width:70px;
                        height:70px;
                        object-fit:cover;
                        border-radius:6px;
                    "
                >
            `;

        }


        // ==========================================
        // TABLE ROW
        // ==========================================

        tbody.innerHTML += `

            <tr>

                <!-- S.NO -->

                <td>
                    ${customer.serialNo || ""}
                </td>


                <!-- CUSTOMER NAME -->

                <td>

                    <a
                        href="customer-details.html?id=${customer.id}"
                    >
                        ${customer.customerName || ""}
                    </a>

                </td>


                <!-- RELATION -->

                <td>
                    ${customer.relation || ""}
                </td>


                <!-- VILLAGE -->

                <td>
                    ${customer.village || ""}
                </td>


                <!-- PHONE -->

                <td>
                    ${customer.phone || ""}
                </td>


                <!-- AADHAAR -->

                <td>
                    ${customer.aadhar || ""}
                </td>


                <!-- PHOTO -->

                <td>
                    ${photoHTML}
                </td>


                <!-- LOCATION -->

                <td>
                    ${locationHTML}
                </td>


                <!-- ACTION -->

                <td>

                    <button
                        onclick="editCustomer('${customer.id}')"
                    >
                        Edit
                    </button>


                    <button
                        onclick="deleteCustomer('${customer.id}')"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `;

    });

}


// =================================================
// ADD CUSTOMER
// =================================================

window.addCustomer = function () {

    const params =
        new URLSearchParams(window.location.search);

    const day =
        params.get("day");

    const session =
        params.get("session");

    window.location.href =
        "add-customer.html?day=" +
        day +
        "&session=" +
        session;
};


// =================================================
// DELETE CUSTOMER
// =================================================

window.deleteCustomer = async function (id) {

    if (!confirm("Delete Customer?")) {
        return;
    }


    try {

        // ------------------------------------------
        // Check customer belongs to current owner
        // ------------------------------------------

        const customerRef =
            doc(db, "customers", id);


        // Delete
        await deleteDoc(customerRef);


        alert("Customer Deleted");


        // Reload table
        loadCustomers();


    } catch (error) {

        console.error(
            "Delete Customer Error:",
            error
        );

        alert(
            "Delete failed: " +
            error.message
        );

    }

};


// =================================================
// EDIT CUSTOMER
// =================================================

window.editCustomer = function (id) {

    window.location.href =
        "add-customer.html?id=" + id;

};


// =================================================
// SEARCH CUSTOMER
// =================================================

window.searchCustomer = function () {

    const search =
        document
            .getElementById("searchCustomer")
            .value
            .trim()
            .toLowerCase();


    const rows =
        document.querySelectorAll(
            "#customerTable tr"
        );


    rows.forEach((row) => {

        const cells =
            row.getElementsByTagName("td");


        if (cells.length > 0) {

            const serialNo =
                cells[0]
                    .innerText
                    .toLowerCase();


            const name =
                cells[1]
                    .innerText
                    .toLowerCase();


            const phone =
                cells[4]
                    .innerText
                    .toLowerCase();


            if (
                serialNo.includes(search) ||
                name.includes(search) ||
                phone.includes(search)
            ) {

                row.style.display = "";

            } else {

                row.style.display = "none";

            }

        }

    });

};


// =================================================
// PAID / UNPAID FILTER
// =================================================

window.filterCustomers = async function (type) {

    try {

        /*
         * NOTE:
         *
         * This section assumes payments collection
         * also contains ownerId.
         *
         * If payments currently only has staffUser,
         * we will modify payment saving separately.
         */


        const paymentQuery = query(

            collection(db, "payments"),

            where(
                "ownerId",
                "==",
                ownerId
            )

        );


        const paymentSnap =
            await getDocs(paymentQuery);


        const paidIds = [];


        const today =
            new Date().toLocaleDateString();


        paymentSnap.forEach((docSnap) => {

            const data =
                docSnap.data();


            let paymentDate = "";


            if (
                data.paymentDate &&
                data.paymentDate.seconds
            ) {

                paymentDate =
                    new Date(
                        data.paymentDate.seconds * 1000
                    ).toLocaleDateString();

            } else if (
                data.paymentDate
            ) {

                paymentDate =
                    new Date(
                        data.paymentDate
                    ).toLocaleDateString();

            }


            if (
                paymentDate === today &&
                data.customerId
            ) {

                paidIds.push(
                    data.customerId
                );

            }

        });


        let filteredCustomers = [];


        if (type === "paid") {

            filteredCustomers =
                allCustomers.filter(
                    customer =>
                        paidIds.includes(
                            customer.id
                        )
                );

        } else {

            filteredCustomers =
                allCustomers.filter(
                    customer =>
                        !paidIds.includes(
                            customer.id
                        )
                );

        }


        displayCustomers(
            filteredCustomers
        );


    } catch (error) {

        console.error(
            "Payment Filter Error:",
            error
        );

        alert(
            "Payment filter failed: " +
            error.message
        );

    }

};


// =================================================
// LOAD CUSTOMERS
// =================================================

loadCustomers();