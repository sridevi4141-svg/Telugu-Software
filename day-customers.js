import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const params = new URLSearchParams(window.location.search);
const day = params.get("day");


let allCustomers = [];


async function loadCustomers() {

    const params = new URLSearchParams(window.location.search);
    const day = params.get("day");

    const staff = JSON.parse(localStorage.getItem("staffLogin"));

    document.getElementById("dayTitle").innerHTML =
        "Day " + day + " Customers";

    const q = query(
        collection(db, "customers"),
        where("day", "==", day),
        where("staffUser", "==", staff.username)
    );

    const querySnapshot = await getDocs(q);

    // Array clear
    allCustomers = [];

    querySnapshot.forEach((docSnap) => {

        const data = docSnap.data();

        data.id = docSnap.id;

        allCustomers.push(data);

    });

    // Table Load
    displayCustomers(allCustomers);

}

loadCustomers();

function displayCustomers(customers) {

    const tbody = document.getElementById("customerTable");

    tbody.innerHTML = "";

    customers.forEach((customer) => {

        const location = customer.location || "";

        let locationHTML = "No Location";

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

        tbody.innerHTML += `

            <tr>

                <td>
                    ${customer.serialNo || ""}
                </td>

                <td>
                    <a href="customer-details.html?id=${customer.id}">
                        ${customer.customerName || ""}
                    </a>
                </td>

                <td>
                    ${customer.relation || ""}
                </td>

                <td>
                    ${customer.village || ""}
                </td>

                <td>
                    ${customer.phone || ""}
                </td>

                <td>
                    ${customer.aadhar || ""}
                </td>

                <td>
                    ${
                        customer.photo
                        ? `<img
                            src="${customer.photo}"
                            style="
                                width:70px;
                                height:70px;
                                object-fit:cover;
                                border-radius:6px;
                            "
                          >`
                        : "No Photo"
                    }
                </td>

                <td>
                    ${locationHTML}
                </td>

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
window.addCustomer = function () {

    const params = new URLSearchParams(window.location.search);
    const day = params.get("day");

    window.location.href = "add-customer.html?day=" + day;

};
window.deleteCustomer = async function(id){

    if(confirm("Delete Customer?")){

        await deleteDoc(doc(db,"customers",id));

        alert("Customer Deleted");

        loadCustomers();

    }

}
window.editCustomer = function(id){

    window.location.href =
    "add-customer.html?id=" + id;

}

window.searchCustomer = function () {

    const search = document
        .getElementById("searchCustomer")
        .value
        .trim()
        .toLowerCase();

    const rows = document.querySelectorAll("#customerTable tr");

    rows.forEach((row) => {

        const cells = row.getElementsByTagName("td");

        if (cells.length > 0) {

            const SerialNo = cells[0].innerText.toString().toLowerCase();
            const name = cells[1].innerText.toLowerCase();
            const phone = cells[4].innerText.toLowerCase();

            if (
                SerialNo.includes(search) ||
                name.includes(search) ||
                phone.includes(search)
            ) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }

        }

    });

}

window.filterCustomers = async function(type){

    const today = new Date().toISOString().split("T")[0];

    const paidSnap = await getDocs(

        query(

            collection(db,"payments"),

            where("paymentDate","==",today),

            where("staffUser","==",staff.username)

        )

    );

    const paidIds = [];

    paidSnap.forEach((doc)=>{

        paidIds.push(doc.data().customerId);

    });

    if(type=="paid"){

        displayCustomers(

            allCustomers.filter(c =>

                paidIds.includes(c.id)

            )

        );

    }

    else{

        displayCustomers(

            allCustomers.filter(c =>

                !paidIds.includes(c.id)

            )

        );

    }

}

window.filterCustomers = async function(type){

    const staff = JSON.parse(localStorage.getItem("staffLogin"));

    const paymentSnap = await getDocs(
        query(
            collection(db, "payments"),
            where("staffUser", "==", staff.username)
        )
    );

    const paidIds = [];

    const today = new Date().toLocaleDateString();

    paymentSnap.forEach((docSnap) => {

        const data = docSnap.data();

        let paymentDate = "";

        if (data.paymentDate.seconds) {

            paymentDate = new Date(
                data.paymentDate.seconds * 1000
            ).toLocaleDateString();

        } else {

            paymentDate = new Date(
                data.paymentDate
            ).toLocaleDateString();

        }

        if (paymentDate === today) {

            paidIds.push(data.customerId);

        }

    });

    let filteredCustomers = [];

    if (type === "paid") {

        filteredCustomers = allCustomers.filter(customer =>
            paidIds.includes(customer.id)
        );

    } else {

        filteredCustomers = allCustomers.filter(customer =>
            !paidIds.includes(customer.id)
        );

    }

    displayCustomers(filteredCustomers);

}