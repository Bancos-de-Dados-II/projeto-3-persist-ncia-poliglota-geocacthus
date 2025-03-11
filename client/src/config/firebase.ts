import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyC8aSanINn19DVEwUPbJvMA6X7MwUdM0GA",
  authDomain: "geocacthus.firebaseapp.com",
  projectId: "geocacthus",
  storageBucket: "geocacthus.firebasestorage.app",
  messagingSenderId: "472816203106",
  appId: "1:472816203106:web:6191f5d5988310404f683b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth }