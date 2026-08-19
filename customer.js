import { storage, db } from "./firebase-config.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

import {
    collection,
    addDoc,deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const params = new URLSearchParams(window.location.search);
const day = params.get("day");


let latitude = "";
let longitude = "";

window.addCustomer = function () {
    window.location.href = `add-customer.html?day=${day}`;
}


window.saveCustomer = async function(){

    const serialNo = document.getElementById("serialNo").value;
    const customerName = document.getElementById("customerName").value;
    const relation = document.getElementById("relation").value;
    const village = document.getElementById("village").value;
    const phone = document.getElementById("phone").value;
    const aadhar = document.getElementById("aadhar").value;

    const file = document.getElementById("customerPhoto").files[0];
    const location = document.getElementById("location").value;

    if (
        customerName == "" ||
        relation == "" ||
        village == "" ||
        phone == "" ||
        aadhar == ""
    ) {
        alert("Please Fill All Details");
        return;
    }

    // Day Number
    const params = new URLSearchParams(window.location.search);
    const day = params.get("day");

    // Staff Details
    const staff = JSON.parse(localStorage.getItem("staffLogin"));

    // Photo Upload
   

let photoUrl = "";

if(file){

    photoUrl = await uploadPhoto(file);

}
    // Save Customer
    await addDoc(collection(db, "customers"), {

        serialNo: serialNo,
        customerName: customerName,
        relation: relation,
        village: village,
        phone: phone,
        aadhar: aadhar,

        photo: photoUrl,
        location: location,

        latitude: latitude,

        longitude: longitude,

        day: day,
        staffUser: staff.username,

        createdDate: new Date()

    });

    alert("Customer Saved Successfully");

    window.location.href = "day-customers.html?day=" + day;

}
window.getLocation = async function () {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async function (position) {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Exact coordinates
            const locationValue =
                `${lat}, ${lng}`;

            // Show coordinates in input
            document.getElementById("location").value =
                locationValue;

        },
        function (error) {

            console.log(error);

            alert("Please allow location permission");

        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
};
async function uploadPhoto(file) {

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", "finance_software");

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/dhudmqipj/image/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    return data.secure_url;
}