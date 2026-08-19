importScripts(
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
    apiKey: "AIzaSyAvlafFAqeydgQCDKKTMRkqTf1eB8sXZJM",
    authDomain: "finance-software-2646b.firebaseapp.com",
    projectId: "finance-software-2646b",
    storageBucket: "finance-software-2646b.firebasestorage.app",
    messagingSenderId: "572169078163",
    appId: "1:572169078163:web:9a9c2696923da48b969466"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    console.log(
        "Background notification:",
        payload
    );

    const notificationTitle =
        payload.notification?.title ||
        "Finance Software";

    const notificationOptions = {
        body:
            payload.notification?.body ||
            "New notification"
    };

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});