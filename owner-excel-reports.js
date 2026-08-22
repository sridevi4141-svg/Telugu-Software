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

    alert("ఓనర్ లాగిన్ కనుగొనబడలేదు");

    window.location.href =
        "owner-login.html";

    throw new Error("ఓనర్ లాగిన్ కనుగొనబడలేదు");

}


const owner =
    JSON.parse(ownerData);


if (!owner || !owner.ownerId) {

    alert("ఓనర్ లాగిన్ వివరాలు తప్పుగా ఉన్నాయి");

    localStorage.removeItem("ownerLogin");

    window.location.href =
        "owner-login.html";

    throw new Error("Invalid owner");

}


const ownerId =
    owner.ownerId;


console.log(
    "EXCEL OWNER ID:",
    ownerId
);


// =====================================
// OWNER NAME
// =====================================

document.getElementById(
    "ownerInfo"
).innerHTML =
"👤 Owner: " +
(
    owner.name ||
    owner.username ||
    ""
);


// =====================================
// DEFAULT DATES
// =====================================

const today =
new Date()
.toISOString()
.split("T")[0];


document.getElementById(
    "fromDate"
).value = today;


document.getElementById(
    "toDate"
).value = today;


// =====================================
// DATE VALIDATION
// =====================================

function getDates(){

    const from =
        document.getElementById(
            "fromDate"
        ).value;


    const to =
        document.getElementById(
            "toDate"
        ).value;


    if(!from || !to){

        alert("దయచేసి ప్రారంభ తేదీ మరియు ముగింపు తేదీ ఎంచుకోండి");

        return null;

    }


    if(from > to){

        alert(
            "From Date cannot be greater than To Date"
        );

        return null;

    }


    return {
        from,
        to
    };

}


// =====================================
// STATUS
// =====================================

function showStatus(message){

    document.getElementById(
        "status"
    ).innerHTML = message;

}


// =====================================
// DAILY SHEET EXCEL
// =====================================

window.downloadDailySheet =
async function(){

    const dates =
        getDates();


    if(!dates) return;


    try{

        showStatus(
            "⏳ Preparing Daily Sheet..."
        );


        const q =
        query(

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


        const snap =
            await getDocs(q);


        const rows = [];


        snap.forEach(
            (docSnap)=>{

                const data =
                    docSnap.data();


                if(
                    data.date >= dates.from &&
                    data.date <= dates.to
                ){

                    rows.push({

                        "తేదీ":
                            data.date || "",

                        "ఓనర్":
                            data.ownerName || "",

                        "ప్రారంభ నగదు":
                            Number(
                                data.openingCash || 0
                            ),

                        "Total Loan":
                            Number(
                                data.totalLoan || 0
                            ),

                        "Total Collection":
                            Number(
                                data.totalCollection || 0
                            ),

                        "ఖర్చులు":
                            Number(
                                data.expenses || 0
                            ),

                        "ముగింపు నగదు":
                            Number(
                                data.closingCash || 0
                            ),

                        "గమనికలు":
                            data.notes || "",

                        "స్థితి":
                            data.status || ""

                    });

                }

            }
        );


        if(rows.length === 0){

            alert(
                "No Daily Sheet found for selected dates."
            );

            showStatus("");

            return;

        }


        const worksheet =
            XLSX.utils.json_to_sheet(rows);


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "రోజువారీ షీట్"
        );


        XLSX.writeFile(
            workbook,
            `Daily-Sheet-${dates.from}-to-${dates.to}.xlsx`
        );


        showStatus(
            "✅ Daily Sheet Excel Downloaded"
        );


    }
    catch(error){

        console.error(error);

        showStatus(
            "❌ Error: " +
            error.message
        );

    }

};


// =====================================
// COLLECTION EXCEL
// =====================================

window.downloadCollection =
async function(){

    const dates =
        getDates();


    if(!dates) return;


    try{

        showStatus(
            "⏳ Preparing Collection Excel..."
        );


        const q =
        query(

            collection(
                db,
                "payments"
            ),

            where(
                "ownerId",
                "==",
                ownerId
            )

        );


        const snap =
            await getDocs(q);


        const rows = [];


        for(
            const docSnap of snap.docs
        ){

            const data =
                docSnap.data();


            let paymentDate = "";


            if(data.paymentDate){

                if(
                    data.paymentDate.seconds
                ){

                    paymentDate =
                        new Date(
                            data.paymentDate.seconds *
                            1000
                        )
                        .toISOString()
                        .split("T")[0];

                }
                else{

                    paymentDate =
                        new Date(
                            data.paymentDate
                        )
                        .toISOString()
                        .split("T")[0];

                }

            }


            if(
                paymentDate >= dates.from &&
                paymentDate <= dates.to
            ){

                let customerName = "";
                let serialNo = "";


                if(data.customerId){

                    try{

                        const customerSnap =
                            await getDocs(

                                query(

                                    collection(
                                        db,
                                        "customers"
                                    ),

                                    where(
                                        "__name__",
                                        "==",
                                        data.customerId
                                    )

                                )

                            );

                        if(
                            !customerSnap.empty
                        ){

                            const customer =
                                customerSnap
                                .docs[0]
                                .data();


                            customerName =
                                customer.customerName ||
                                "";

                            serialNo =
                                customer.serialNo ||
                                "";

                        }

                    }
                    catch(error){

                        console.log(
                            "Customer lookup error",
                            error
                        );

                    }

                }


                rows.push({

                    "తేదీ":
                        paymentDate,

                    "Serial No":
                        serialNo,

                    "కస్టమర్ పేరు":
                        customerName,

                    "వారం":
                        Number(
                            data.week || 0
                        ),

                    "మొత్తం":
                        Number(
                            data.amount || 0
                        ),

                    "స్థితి":
                        data.status || ""

                });

            }

        }


        if(rows.length === 0){

            alert(
                "No Collection found for selected dates."
            );

            showStatus("");

            return;

        }


        const worksheet =
            XLSX.utils.json_to_sheet(rows);


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "వసూళ్లు"
        );


        XLSX.writeFile(
            workbook,
            `Collection-${dates.from}-to-${dates.to}.xlsx`
        );


        showStatus(
            "✅ Collection Excel Downloaded"
        );

    }
    catch(error){

        console.error(error);

        showStatus(
            "❌ Error: " +
            error.message
        );

    }

};


// =====================================
// LOAN EXCEL
// =====================================

window.downloadLoans =
async function(){

    const dates =
        getDates();


    if(!dates) return;


    try{

        showStatus(
            "⏳ Preparing Loan Excel..."
        );


        const q =
        query(

            collection(
                db,
                "dailyLoans"
            ),

            where(
                "ownerId",
                "==",
                ownerId
            )

        );


        const snap =
            await getDocs(q);


        const rows = [];


        snap.forEach(
            (docSnap)=>{

                const data =
                    docSnap.data();


                const loanDate =
                    data.date || "";


                if(
                    loanDate >= dates.from &&
                    loanDate <= dates.to
                ){

                    rows.push({

                        "తేదీ":
                            loanDate,

                        "Serial No":
                            data.serialNo || "",

                        "కస్టమర్ పేరు":
                            data.customerName || "",

                        "Loan Amount":
                            Number(
                                data.loanAmount || 0
                            ),

                        "స్టాఫ్":
                            data.staffUser || ""

                    });

                }

            }
        );


        if(rows.length === 0){

            alert(
                "No Loans found for selected dates."
            );

            showStatus("");

            return;

        }


        const worksheet =
            XLSX.utils.json_to_sheet(rows);


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Loans"
        );


        XLSX.writeFile(
            workbook,
            `Loans-${dates.from}-to-${dates.to}.xlsx`
        );


        showStatus(
            "✅ Loan Excel Downloaded"
        );

    }
    catch(error){

        console.error(error);

        showStatus(
            "❌ Error: " +
            error.message
        );

    }

};