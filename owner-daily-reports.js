import { db } from "./firebase-config.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================
// OWNER LOGIN
// =====================================

const ownerData =
    localStorage.getItem("ownerLogin");

if (!ownerData) {

    alert("ఓనర్ లాగిన్ సెషన్ కనుగొనబడలేదు");

    window.location.href =
        "owner-login.html";

    throw new Error("ఓనర్ లాగిన్ కనుగొనబడలేదు");
}


let owner;

try {

    owner = JSON.parse(ownerData);

} catch (error) {

    localStorage.removeItem("ownerLogin");

    alert("ఓనర్ లాగిన్ వివరాలు తప్పుగా ఉన్నాయి");

    window.location.href =
        "owner-login.html";

    throw error;
}


if (!owner || !owner.ownerId) {

    alert("ఓనర్ లాగిన్ వివరాలు తప్పుగా ఉన్నాయి");

    localStorage.removeItem("ownerLogin");

    window.location.href =
        "owner-login.html";

    throw new Error("ఓనర్ లాగిన్ వివరాలు తప్పుగా ఉన్నాయి");
}


const ownerId = owner.ownerId;

console.log("OWNER ID:", ownerId);


// =====================================
// OWNER NAME
// =====================================

const ownerName =
    owner.name ||
    owner.username ||
    "";


const ownerInfo =
    document.getElementById("ownerInfo");

if (ownerInfo) {

    ownerInfo.innerHTML =
        "👤 Owner: " + ownerName;

}


// =====================================
// LOAD DAILY SHEETS
// =====================================

async function loadDailySheets() {

    const tbody =
        document.getElementById(
            "dailySheetTable"
        );

    try {

        console.log(
            "రోజువారీ షీట్లు లోడ్ అవుతున్నాయి..."
        );

        const q = query(

            collection(
                db,
                "dailySheets"
            ),

            where(
                "ownerId",
                "==",
                ownerId
            )

        );


        const snapshot =
            await getDocs(q);


        console.log(
            "Daily Sheets Found:",
            snapshot.size
        );


        tbody.innerHTML = "";


        if (snapshot.empty) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="9"
                        class="no-data">
                        No Daily Sheets Found
                    </td>
                </tr>
            `;

            return;
        }


        let serialNo = 1;


        const sheets = [];


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();

            sheets.push(data);

        });


        // Newest date first
        sheets.sort(
            (a, b) =>
                String(b.date || "")
                .localeCompare(
                    String(a.date || "")
                )
        );


        sheets.forEach((data) => {

            tbody.innerHTML += `

                <tr>

                    <td>
                        ${serialNo++}
                    </td>

                    <td>
                        ${data.date || ""}
                    </td>

                    <td class="amount">
                        ₹ ${Number(
                            data.openingCash || 0
                        )}
                    </td>

                    <td class="amount">
                        ₹ ${Number(
                            data.totalLoan || 0
                        )}
                    </td>

                    <td class="amount">
                        ₹ ${Number(
                            data.totalCollection || 0
                        )}
                    </td>

                    <td class="amount">
                        ₹ ${Number(
                            data.expenses || 0
                        )}
                    </td>

                    <td class="amount">
                        ₹ ${Number(
                            data.closingCash || 0
                        )}
                    </td>

                    <td>
                        ${data.notes || "-"}
                    </td>

                    <td>
                        ${data.status || "పూర్తయింది"}
                    </td>

                </tr>

            `;

        });

    }

    catch(error) {

        console.error(
            "Load Daily Sheets Error:",
            error
        );


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="no-data">

                    ❌ Daily Sheets Load Failed

                    <br><br>

                    ${error.message}

                </td>

            </tr>

        `;

    }

}


// =====================================
// START
// =====================================

loadDailySheets();