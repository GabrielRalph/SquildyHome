import { createUserWithEmailAndPassword, get, getUser, ref, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "./firebase-client.js";

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
              inputName = "";
              message = "Wrong email and/or password.";
              break;

          case "auth/email-already-in-use":
          case "auth/email-already-exists":
              inputName = "";
              message = "An account with this email already exists.";
              break;

          case "auth/user-not-found":
              inputName = "";
              message = "No account exists with this email, please signup first.";
              break;

          case "auth/invalid-email":
              message = "wrong email.";
              inputName = "";
              break;

          case "auth/wrong-password":
              message = "Wrong password.";
              inputName = "password";
              break;

          case "auth/too-many-requests": 
              message = "To many attempts.";
              inputName = "";

          // TODO: Check other errors
          default:
              message = errorCode;
              break;

      }
      super(message);
      this.inputName = inputName;
  }
}

async function signin(email, password) {
  try {
      await signInWithEmailAndPassword(email, password);
  } catch (error) {
      throw new LoginError(error);
  }
}

async function setUserInfo(info) {
  let User = getUser();
  if (User) {
      let infoRef = ref('users/' + User.uid + '/info');
      await update(infoRef, info);
  }
}

async function getUserInfo() {
  let info = null;
  let User = getUser();
  if (User) {
    let infoRef = ref('users/' + User.uid + '/info');
    info =( await get(infoRef)).val();
  }
  return info;
}

async function signout(){
  await signOut();
}

async function signup(email, password, firstName, lastName) {
  try {
      // Register user
      await createUserWithEmailAndPassword(Auth, email, password);

      // Set user info
      await setUserInfo({firstName, lastName});

      await sendEmailVerification();

  } catch (error) {
      throw new LoginError(error);
  }
}


export { signin, signup, signout, setUserInfo, getUserInfo, LoginError, sendPasswordResetEmail, sendEmailVerification };