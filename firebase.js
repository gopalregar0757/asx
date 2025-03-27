import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getDatabase, ref, push, set, onValue, get 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDrZROju2DeLYfuZHFUT108IVR44SkpcPg",
    authDomain: "nexusfreefire-69825.firebaseapp.com",
    databaseURL: "https://nexusfreefire-69825-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nexusfreefire-69825",
    storageBucket: "nexusfreefire-69825.firebasestorage.app",
    messagingSenderId: "254913381710",
    appId: "1:254913381710:web:4f9a61cfa9ef842b364a1f"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { 
  database, 
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  ref,
  push,
  set,
  get,
  onValue
};
