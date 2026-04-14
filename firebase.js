import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ==========================================
// 🔴 FIREBASE CONFIGURATION
// Replace these with your actual Firebase Project keys!
// ==========================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Toggle this to TRUE once you've pasted your keys above
export const USE_FIREBASE = false;

let app, db, auth;

// Only initialize if we are using Firebase to prevent console errors
if (USE_FIREBASE && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
}

// -----------------------------------------------------
// FIREBASE WRAPPER FUNCTIONS (Used to swap seamlessly)
// -----------------------------------------------------

export const fbDb = {
    getSarees: async () => {
        if (!USE_FIREBASE) return [];
        const querySnapshot = await getDocs(collection(db, "sarees"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    saveSaree: async (saree) => {
        if (!USE_FIREBASE) return;
        const data = { ...saree };
        delete data.id; // Firestore auto-generates ID
        await addDoc(collection(db, "sarees"), data);
    },
    updateSaree: async (id, updatedData) => {
        if (!USE_FIREBASE) return;
        const itemRef = doc(db, "sarees", id);
        await updateDoc(itemRef, updatedData);
    },
    deleteSaree: async (id) => {
        if (!USE_FIREBASE) return;
        await deleteDoc(doc(db, "sarees", id));
    }
};

export const fbAuth = {
    login: async (email, password) => {
        if (!USE_FIREBASE) return false;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    logout: async () => {
        if (!USE_FIREBASE) return;
        await signOut(auth);
    }
};
