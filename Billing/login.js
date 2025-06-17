import  { signin, signup, signout, sendPasswordResetEmail, sendEmailVerification } from "./Firebase/user.js"
import { SvgPlus } from "../SvgPlus/4.js";

const EMAIL_CHECKER = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
const VALIDATORS = {
    email: () => {
        return (email) => {if (email.match(EMAIL_CHECKER) == null) return "Invalid email"}
    },
    required: (name) => {
        return (value) => {
            if (!value) {
                return `${name} is required!`
            }
        }
    },
    lengthVerbose: (min, max, name) => {   
        let isMax = typeof max === "number";
        let isMin = typeof min === "number";
        let range = (isMax && isMin) ? `between ${min}-${max}` : (isMax ? `less than ${max}` : `more than ${min}`);
        return (field) => {
            if ((isMin && field.length < min) || (isMax && field.length > max)) {
                return `${name} must be ${range} charcters.`
            }
        }
    },
    length: (min, max, name) => {   
        let isMax = typeof max === "number";
        let isMin = typeof min === "number";
        let range = (isMax && isMin) ? `(${min}-${max})` : (isMax ? `(<${max})` : `(>${min})`);
        return (field) => {
            if (isMin && field.length < min) {
                return `Please enter more ${range}`
            } else if (isMax && field.length > max) {
                return `To many characters ${range}`
            }
        }
    }
}
function makeValidator(list) {
    let validators = list.map(a => VALIDATORS[a[0]](...a.slice(1)));
    return (value) => {
        for (let v of validators) {
            let err = v(value)
            if (err) return err;
        }
    }
}

class InputPlus extends SvgPlus {
    /** @type {HTMLInputElement} */
    input = null;
    init = false;
    validator = () => ""
    constructor(label, type, validator) {
        super("input-plus");
        if (validator instanceof Function) {
            this.validator = validator;
        }

        this.input = this.createChild("input", {type, name:label, placeholder: " ", events: {
            input: () => {
                if (this.init) this.validate()
            },
            change: () => {
                this.validate();
            }
        }});
        this.createChild("label", {content: label});
        this.errorMessage = this.createChild("error-message");
    }

    get valid(){
        return !this.input.validity.customError;
    }
    get value(){
        return this.input.value;
    }
    set value(value) {
        this.input.value = value;
    }

    setCustomValidity(msg) {
        if (typeof msg !== "string") msg = "";
        this.input.setCustomValidity(msg);
        this.errorMessage.innerHTML = msg;
    }

    validate(){
        this.init = true;
        let errorMessage = this.validator(this.value);
        this.setCustomValidity(errorMessage);
    }

}

class ForgotPassword extends SvgPlus {
    constructor(){
        super("div");

        this.class = "col gap-1 form forgot"

        
    }

    async resetPassword(){
        let email = this.inputs.email.value;
        await sendPasswordResetEmail(email);
        this.showMessage();
    }

    buildForm(){
        this.innerHTML = "";
        this.createChild("div", {class: "centered", content: "Enter your email to send a password reset link."})
        this.inputs = {
            email: this.createChild(InputPlus, {}, "Email", "text", makeValidator([["email"]])),
        }
        this.createChild("div", {class: "centered"}).createChild("button", {content: "Reset Password",
            events: {click: this.resetPassword.bind(this)}
        })
    }


    showMessage(){
        this.innerHTML = "";
        this.createChild("div", {content: "You will receive an email with a password <br> reset link shortly, please check your inbox."})
    }


}

export class LoginWidget extends SvgPlus {
    constructor(){
        super("login-widget");
        let banner = this.createChild("div", {class: "banner"}).createChild("div", {class: "row-space gap-1"})
        banner.createChild("div", {content: "<h1>Welcome <br>to Squidly,</h1><br> Getting started or an experienced  <br> Squidly user, sign in or sign up to<br> start your licence."})
        let bcol = banner.createChild("div", {class: "col-centered gap-1"});
        bcol.createChild("div", {class: "signin", content: "Haven't signed up yet?"})
        bcol.createChild("div", {class: "signup", content: "Already a squidly member?"})
        bcol.createChild("button", {class: "signin", content: "Sign Up", events: {click: this.setSignUpMode.bind(this)}});
        bcol.createChild("button", {class: "signup", content: "Sign In", events: {click: ()=>this.setSignUpMode(false)}});
        bcol.createChild("button", {class: "forgot", content: "Back", events: {click: ()=>this.setSignUpMode(false)}});

        let form = this.createChild("div", {class: "col gap-1 form signup"})
        let signUpOnly = form.createChild("div", {class: "row"});
        this.signUpInputs = {
            firstName: signUpOnly.createChild(InputPlus, {}, "First Name", "text", makeValidator([["required", "Your first name"], ["length", null, 128, "Your first name"]])),
            lastName: signUpOnly.createChild(InputPlus, {}, "Last Name", "text", makeValidator([["required", "Your last name"], ["length", null, 128, "Your last name"]])),
            email: form.createChild(InputPlus, {}, "Email", "text", makeValidator([["email"]])),
            password: form.createChild(InputPlus, {}, "Password", "password", makeValidator([["lengthVerbose", 6, null, "Your password"]])),
        }
        form.createChild("div", {class: "centered"}).createChild("button", {content: "Sign Up",
            events: {click: this.signUp.bind(this)}
        });
      


        let form2 = this.createChild("div", {class: "col gap-1 form signin"})
        this.signInInputs = {
            email: form2.createChild(InputPlus, {}, "Email", "text", makeValidator([["email"]])),
            password: form2.createChild(InputPlus, {}, "Password", "password", makeValidator([["lengthVerbose", 6, null, "Password"]]))
        }
        form2.createChild("div", {class: "centered"}).createChild("button", {content: "Sign In",
            events: {click: this.signIn.bind(this)}
        })
        let f = form2.createChild("div", {class: "centered"});
        f.createChild("span", {class: "click-text", content: "Forgot password?", events: {
            click: () => {
                this.toggleAttribute("forgot", true)
                this.forgotPassword.buildForm()
            }
        }})


        this.forgotPassword = this.createChild(ForgotPassword)

        let c = this.createChild("div", {class: "col gap-1 email-verification"});
        c.createChild("h2", {content: "Your account requires verification."})
        c.createChild("div", {content: `Please check your inbox<br>for the email verification link.<br> After you have been verified please <br> sign in again to continue.`});
        c.createChild("button", {content: "Sign In", events: {click: this.returnToSignIn.bind(this)}})
        let d = c.createChild("div", {content: "Can't find the email? Click "})
        d.createChild("span", {class: "click-text", content: "here", events: {click: () => sendEmailVerification()}})
        d.createChild("span", {content: " to resend."})
        this.error = this.createChild("div", {class: "centered error"});
    }

  
    async returnToSignIn(){
        await signout();
        this.toggleAttribute("waiting-for-email", false);
    }

    setSignUpMode(mode = true) {
        this.error.innerHTML = "";
        this.toggleAttribute("signup", mode)
        this.toggleAttribute("forgot", false)
    }

    validateDate(name) {
        let inputs =  this[name];
        let data = {};
        let valid = true;
        for (let k in inputs) {
            inputs[k].validate();
            if (!inputs[k].valid) {
                valid = false;
            }
            data[k] =inputs[k].value;
        }
        return [valid, data, inputs]
    }

    async signIn(){
        console.log("sign in user");
        this.toggleAttribute("processing", true)
        let [valid, data, inputs] = this.validateDate("signInInputs");
        if (valid) {
            try {
                let {email, password} = data;
                await signin(email, password);
    
                console.log("done");
                
            } catch (e) {
                if (e.inputName in inputs) {
                    inputs[e.inputName].setCustomValidity(e.message);
                } else {
                    this.error.innerHTML = e.message;
                }
            }
        }
        this.toggleAttribute("processing", false)
    }

    async signUp(){
        console.log("sign up user");
        this.toggleAttribute("processing", true)
        let [valid, data, inputs] = this.validateDate("signUpInputs");
        if (valid) {
            try {
                let {email, password, firstName, lastName} = data;
                await signup(email, password, firstName, lastName);
                this.toggleAttribute("waiting-for-email", true);

            } catch (e) {
                if (e.inputName in inputs) {
                    inputs[e.inputName].setCustomValidity(e.message);
                } else {
                    this.error.innerHTML = e.message;
                }
            }
        }
        this.toggleAttribute("processing", false)
    }

}