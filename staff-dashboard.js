const params = new URLSearchParams(window.location.search);
const day = params.get("day");

console.log("Day Customers Page URL:", window.location.href);
console.log("Day Value:", day);

document.getElementById("dayTitle").innerHTML = "Day " + day + " Customers";
if(staff){

    document.getElementById("staffWelcome").innerHTML =
    "👋 Welcome " + staff.name;

}else{

    window.location="staff-login.html";

}

function openDay(day){

    window.location =
    "day-customers.html?day=" + day;

}

function logoutStaff(){

    localStorage.removeItem("staffLogin");

    window.location="owner-login.html";

}