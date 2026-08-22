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
  
const session =
    params.get("session");

let latitude = "";
let longitude = "";

window.addCustomer = function () {
    window.location.href = `add-customer.html?day=${day}`;
}


window.saveCustomer = async function () {

    // =================================
    // GET OWNER LOGIN
    // =================================

    const ownerData = localStorage.getItem("ownerLogin");

    if (!ownerData) {
        alert("ఓనర్ లాగిన్ సెషన్ కనుగొనబడలేదు. దయచేసి మళ్లీ లాగిన్ చేయండి.");
        window.location.href = "owner-login.html";
        return;
    }

    const owner = JSON.parse(ownerData);

    if (!owner || !owner.ownerId) {
        alert("ఓనర్ లాగిన్ సెషన్ తప్పుగా ఉంది. దయచేసి మళ్లీ లాగిన్ చేయండి.");
        localStorage.removeItem("ownerLogin");
        window.location.href = "owner-login.html";
        return;
    }

    const ownerId = owner.ownerId;

    console.log("CURRENT OWNER ID:", ownerId);


    // =================================
    // GET CUSTOMER DETAILS
    // =================================

    const serialNo =
        document.getElementById("serialNo").value;

    const customerName =
        document.getElementById("customerName").value.trim();

    const relation =
        document.getElementById("relation").value;

    const village =
        document.getElementById("village").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const aadhar =
        document.getElementById("aadhar").value.trim();


    // =================================
    // PHOTO
    // =================================

    const file =
        document.getElementById("customerPhoto").files[0];


    // =================================
    // LOCATION
    // =================================

    const location =
        document.getElementById("location").value;

    let latitude = "";
    let longitude = "";


    // =================================
    // VALIDATION
    // =================================

    if (
        customerName === "" ||
        relation === "" ||
        village === "" ||
        phone === "" ||
        aadhar === ""
    ) {

        alert("దయచేసి అన్ని వివరాలు నమోదు చేయండి");
        return;

    }


    // =================================
    // DAY NUMBER
    // =================================

    const params =
        new URLSearchParams(window.location.search);

    const day =
        params.get("day");


    // =================================
    // PHOTO UPLOAD
    // =================================

    let photoUrl = "";

    if (file) {

        photoUrl =
            await uploadPhoto(file);

    }


    // =================================
    // SAVE CUSTOMER
    // =================================

    try {

        await addDoc(
            collection(db, "customers"),
            {

                ownerId: ownerId,

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

                 session: session,

                 username: owner.username || "",

                createdDate: new Date()

            }
        );


        // =================================
        // SUCCESS
        // =================================

        alert("కస్టమర్ విజయవంతంగా సేవ్ చేయబడింది");

        window.location.href =
            "day-customers.html?day=" + day;


    } catch (error) {

        console.error(
            "కస్టమర్ సేవ్ లోపం:",
            error
        );

        alert(
            "కస్టమర్ సేవ్ విఫలమైంది: " +
            error.message
        );

    }

};

window.getLocation = async function () {

    if (!navigator.geolocation) {
        alert("లొకేషన్ సౌకర్యం ఈ బ్రౌజర్‌లో అందుబాటులో లేదు");
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

            alert("దయచేసి లొకేషన్ అనుమతి ఇవ్వండి");

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

function startVoice(inputId) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert(
            "Voice input is not supported in this browser.\n" +
            "దయచేసి Google Chrome లేదా Microsoft Edge ఉపయోగించండి."
        );
        return;
    }

    const input = document.getElementById(inputId);

    if (!input) {
        alert("ఇన్‌పుట్ ఫీల్డ్ కనుగొనబడలేదు: " + inputId);
        return;
    }

    const recognition = new SpeechRecognition();

    // Telugu
    recognition.lang = "te-IN";

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {

        console.log("🎤 Voice listening started");

        input.placeholder = "🎤 Listening... Speak now";

        input.style.border = "2px solid #2196F3";
    };

    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript;

        console.log("Voice result:", transcript);

        input.value = transcript;

        input.placeholder =
            inputId === "customerName"
                ? "కస్టమర్ పేరు"
                : "గ్రామం";

        input.style.border = "1px solid #ccc";
    };

    recognition.onerror = function (event) {

        console.log("Speech Recognition Error:", event.error);

        input.style.border = "1px solid #ccc";

        input.placeholder =
            inputId === "customerName"
                ? "కస్టమర్ పేరు"
                : "గ్రామం";

        if (event.error === "not-allowed") {

            alert(
                "Microphone permission denied.\n\n" +
                "ఈ వెబ్‌సైట్‌కు మైక్రోఫోన్ అనుమతి ఇవ్వండి."
            );

        } else if (event.error === "no-speech") {

            alert(
                "No voice detected.\n\n" +
                "🎤 నొక్కి స్పష్టంగా మాట్లాడండి."
            );

        } else if (event.error === "audio-capture") {

            alert(
                "Microphone not found.\n\n" +
                "Please check your microphone connection."
            );

        } else if (event.error === "network") {

            alert(
                "Voice service connection failed.\n\n" +
                "Please check your internet connection and try again."
            );

        } else {

            alert(
                "వాయిస్ ఇన్‌పుట్ విఫలమైంది: " +
                event.error
            );
        }
    };

    recognition.onend = function () {

        console.log("🎤 Voice listening ended");

        input.style.border = "1px solid #ccc";
    };

    try {

        recognition.start();

    } catch (error) {

        console.log("Recognition start error:", error);

        alert("మైక్రోఫోన్ ప్రారంభం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.");
    }
}


// IMPORTANT because customer.js is a module
window.startVoice = startVoice;
