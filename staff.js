import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


let editId = null;


// =================================================
// GET CURRENT OWNER
// =================================================

function getOwnerId() {

    const ownerLogin =
        localStorage.getItem("ownerLogin");

    if (!ownerLogin) {

        alert("Please Login as Owner");

        window.location.href =
            "owner-login.html";

        return null;
    }

    const ownerData =
        JSON.parse(ownerLogin);

    return ownerData.ownerId;
}


// =================================================
// SAVE STAFF
// =================================================

window.saveStaff = async function () {

    const name =
        document.getElementById("staffName").value;

    const phone =
        document.getElementById("staffPhone").value;

    const username =
        document.getElementById("staffUsername").value;

    const password =
        document.getElementById("staffPassword").value;


    if (
        name == "" ||
        phone == "" ||
        username == "" ||
        password == ""
    ) {

        alert("Please Fill All Details");

        return;
    }


    // Get current Owner ID
    const ownerId = getOwnerId();

    if (!ownerId) {
        return;
    }


    // =================================================
    // UPDATE STAFF
    // =================================================

    if (editId) {

        await updateDoc(
            doc(db, "staff", editId),
            {

                name: name,

                phone: phone,

                username: username,

                password: password,

                ownerId: ownerId

            }
        );


        alert("Staff Updated Successfully");

        editId = null;


    } else {


        // =================================================
        // ADD NEW STAFF
        // =================================================

        await addDoc(
            collection(db, "staff"),
            {

                name: name,

                phone: phone,

                username: username,

                password: password,

                ownerId: ownerId

            }
        );


        alert("Staff Saved Successfully");

    }


    // Clear fields

    document.getElementById("staffName").value = "";

    document.getElementById("staffPhone").value = "";

    document.getElementById("staffUsername").value = "";

    document.getElementById("staffPassword").value = "";


    loadStaff();

};


// =================================================
// LOAD STAFF
// =================================================

async function loadStaff() {

    const tbody =
        document.getElementById("staffTable");


    tbody.innerHTML = "";


    const ownerId = getOwnerId();

    if (!ownerId) {
        return;
    }


    // =================================================
    // ONLY CURRENT OWNER STAFF
    // =================================================

    const staffQuery = query(
        collection(db, "staff"),
        where("ownerId", "==", ownerId)
    );


    const querySnapshot =
        await getDocs(staffQuery);


    querySnapshot.forEach((docSnap) => {

        const data =
            docSnap.data();


        tbody.innerHTML += `

        <tr>

            <td>${data.name || ""}</td>

            <td>${data.phone || ""}</td>

            <td>${data.username || ""}</td>

            <td>

                <button onclick="editStaff(
                    '${docSnap.id}',
                    '${data.name || ""}',
                    '${data.phone || ""}',
                    '${data.username || ""}',
                    '${data.password || ""}'
                )">
                    Edit
                </button>


                <button onclick="deleteStaff('${docSnap.id}')">
                    Delete
                </button>

            </td>

        </tr>

        `;

    });

}


// =================================================
// DELETE STAFF
// =================================================

window.deleteStaff = async function (id) {

    if (confirm("Delete Staff?")) {

        await deleteDoc(
            doc(db, "staff", id)
        );

        loadStaff();

    }

};


// =================================================
// EDIT STAFF
// =================================================

window.editStaff =
function (
    id,
    name,
    phone,
    username,
    password
) {

    editId = id;


    document.getElementById("staffName").value =
        name;

    document.getElementById("staffPhone").value =
        phone;

    document.getElementById("staffUsername").value =
        username;

    document.getElementById("staffPassword").value =
        password;

};


// =================================================
// LOAD STAFF ON PAGE OPEN
// =================================================

loadStaff();