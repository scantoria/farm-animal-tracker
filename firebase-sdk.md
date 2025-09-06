//
// npm
//

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2W0T_yXKwqiU-N0CdJdYVr4jmMWEdRgg",
  authDomain: "farmanimaltracker.firebaseapp.com",
  projectId: "farmanimaltracker",
  storageBucket: "farmanimaltracker.firebasestorage.app",
  messagingSenderId: "177150446042",
  appId: "1:177150446042:web:c6b05c712b3eb07a5f58e3",
  measurementId: "G-PKJEZHXRJG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



//
// Use a <script> tag
//
<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyB2W0T_yXKwqiU-N0CdJdYVr4jmMWEdRgg",
    authDomain: "farmanimaltracker.firebaseapp.com",
    projectId: "farmanimaltracker",
    storageBucket: "farmanimaltracker.firebasestorage.app",
    messagingSenderId: "177150446042",
    appId: "1:177150446042:web:c6b05c712b3eb07a5f58e3",
    measurementId: "G-PKJEZHXRJG"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
