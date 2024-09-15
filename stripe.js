import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import { signOut, getAuth, connectAuthEmulator,signInWithRedirect, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, sendEmailVerification as _sendEmailVerification, EmailAuthProvider, reauthenticateWithCredential, updatePassword, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
import { getDatabase,connectDatabaseEmulator, child, push, ref as _ref, get, onValue, onChildAdded, onChildChanged, onChildRemoved, set, update, off } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js'
import { getStorage, ref as sref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js'
import { getFunctions, connectFunctionsEmulator, httpsCallable  } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js'

const stripe = Stripe("pk_test_WmYzJXrtzE00MAhbTgAZwhaO00gjCfkWn8")
// Gabes Firebase
export const config = {
    apiKey: "AIzaSyChiEAP1Rp1BDNFn7BQ8d0oGR65N3rXQkE",
    authDomain: "eyesee-d0a42.firebaseapp.com",
    databaseURL: "http://127.0.0.1:9000/?ns=fake-server",
    projectId: "eyesee-d0a42",
    storageBucket: "eyesee-d0a42.appspot.com",
    messagingSenderId: "56834287411",
    appId: "1:56834287411:web:999340ed2fd5165fa68046"
  };


const App = initializeApp(config);
const Database = getDatabase(App);
const Auth = getAuth();
const Functions = getFunctions(App, "asia-southeast1");

async function call(fname,data) {
    let f = httpsCallable(Functions, fname);
    return (await f(data)).data;
}

connectAuthEmulator(Auth, "http://127.0.0.1:9099")
connectFunctionsEmulator(Functions, "localhost", 5001);
// connectDatabaseEmulator(Database, "127.0.0.1:9000");

let paywindow = document.querySelector(".payment-window")
async function pay(){
    paywindow.toggleAttribute("show", true);
    let res = await call("setupBilling", {tier: "Pro"});
    console.log(res);
    if (res.id) {
        let {clientSecret} = res;
        const appearance = { /* appearance */ };
        const options = { /* options */ };
        const elements = stripe.elements({ clientSecret, appearance });
        const paymentElement = elements.create('payment', options);
        paymentElement.mount('#payment-element');

        window.ondblclick = async () => {
            await stripe.confirmSetup({
                elements,
                redirect: "if_required"
            })

            let res = await call("createSubscription", {tier: "Pro"})
            console.log(res);
            // document.querySelector("#payment-element").innerHTML = "";
        }
    }
}
window.onclick = pay
function ref(loc) {return _ref(Database, loc)}
// console.log("here");
// let p = await get(ref("pricing"))
// console.log(p.val());
// console.log("here");
// let res = await call("makePayment", {tier: "Pro"});
// console.log(res);
onAuthStateChanged(Auth, async (userData) => {
   if (userData) {
        console.log(userData);
   }
});


class LoginError extends Error {
    constructor(error) {
        let inputName = "";
        let errorCode = error;
        if (error.code) errorCode = error.code;
        // Display the error message
        let message = "";
        switch (errorCode) {
            case "auth/invalid-credential":
            case "auth/invalid-login-credentials":
                inputName = "email";
                message = "wrong email and/or password";
                break;

            case "auth/email-already-in-use":
            case "auth/email-already-exists":
                inputName = "email";
                message = "An account with this email already exists";

                break;

            case "auth/user-not-found":
                inputName = "email";
                message = "email not found";
                break;

            case "auth/invalid-email":
                message = "wrong email";
                inputName = "email";
                break;

            case "auth/wrong-password":
                message = "wrong password";
                inputName = "password";
                break;

            case "auth/too-many-requests": 
                message = "To many attempts";
                inputName = "password";

            // TODO: Check other errors
            default:
                message = errorCode;
                break;

        }
        super(message);
        this.inputName = inputName;
    }
}


export async function sendEmailVerification(){
    // Send email verification
    if (User) {
        const actionCodeSettings = {
            url: window.location.origin,
            handleCodeInApp: true
        };
        await _sendEmailVerification(User, actionCodeSettings);
    }
}
export function signout() { signOut(Auth) }

export async function signup(type, info) {
    switch (type) {
        case "email":
            let { email, password } = info;
            delete info.password;
            try {
                // Register user
                await createUserWithEmailAndPassword(Auth, email, password);

                // Set user info
                setUserInfo(info);

                // 
                await sendEmailVerification();

                signout();
            } catch (error) {
                throw new LoginError(error);
            }
            break;

        case "gmail":
            const provider = new GoogleAuthProvider();
            signInWithRedirect(Auth, provider);
            break;

        case "facebook":
            throw new LoginError("Facebook has not yet been setup.");
    }
}
export async function signin(type, info) {
    switch (type) {
        case "email":
            let { email, password } = info;
            try {
                await signInWithEmailAndPassword(Auth, email, password);
            } catch (error) {
                throw new LoginError(error);
            }
            break;

        case "gmail":
            const gprovider = new GoogleAuthProvider();
            signInWithRedirect(Auth, gprovider);
            break;

        case "facebook": 
            const fprovider = new FacebookAuthProvider();
            fprovider.addScope("email");
            fprovider.addScope("public_profile");
            signInWithRedirect(Auth, fprovider);
            break;

        case "facebook":
            throw new LoginError("Facebook has not yet been setup.");
    }
}

signin("email", {email: "gltralph@gmail.com", password: "abc123"})
