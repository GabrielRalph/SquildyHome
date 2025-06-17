import { CheckoutMenu } from "./checkout.js";
import { LicencesList } from "./licences-list.js";
import { SvgPlus } from "../SvgPlus/4.js";

import { addListener, watchLicences, getOwnedLicences, getClientSecretFetcher } from "./Firebase/licences.js";
import { LoginWidget } from "./login.js";
import { addAuthChangeListener, initialise } from "./Firebase/firebase-client.js";
import { getUserInfo } from "./Firebase/user.js";

const stripe = Stripe('pk_test_WmYzJXrtzE00MAhbTgAZwhaO00gjCfkWn8', {apiVersion: '2025-01-27.acacia'});

const BACKICON = `
<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 11 13">
  <polyline class="cls-1" points="5 7 0 3.5 5 0"/>s
</svg>`

export class PaymentFlow extends SvgPlus {
    modePath = [];
    constructor(el = "payment-flow") {
        super(el);
        this.createChild("div", {class: "back", content: BACKICON, events: {click: this.back.bind(this)}})
        let obs = new ResizeObserver(this.updateLandscape.bind(this));
        obs.observe(this)
        this.loginWidget = this.createChild("div", {class:"window login-widget"})
            .createChild(LoginWidget);
        this.checkout = this.createChild("div", {class:"window checkout-menu"})
            .createChild(CheckoutMenu, {events: {
            start: this.startCheckout.bind(this)
        }});
        this.licences =  this.createChild("div", {class:"window licence-list"})
            .createChild(LicencesList, {events: {
            purchase: () => this.mode = 2
        }});
        this.stripe = this.createChild("div", {class: "window stripe-mount"});
        this.load()
    }


    
    updateLandscape(){
        let iframe = this.querySelector("iframe");
        this.styles = {
            "--vmin": (Math.min(this.clientWidth, this.clientHeight) / 100) + "px"
        }
        let aspect = this.clientWidth / this.clientHeight;

        
        console.log(this.mode, aspect);
        if (iframe && this.mode == 3) {
            let isLandscape = parseFloat(iframe.style.height) < 750 && aspect > 0.6;
            this.stripe.toggleAttribute("landscape", isLandscape);
        }else if (this.mode == 2) {
            this.checkout.toggleAttribute("landscape", aspect > 1.1);
        } else if (this.mode == 1) {
            this.licences.toggleAttribute("landscape", aspect > 0.8);
        } else if (this.mode == 0) { 
            this.loginWidget.toggleAttribute("landscape", aspect > 1);

        }
    }

    async startCheckout(){
        if (this.stripeCheckout) {
            this.stripeCheckout.unmount();
            this.stripeCheckout.destroy();
        }

        const checkout = await stripe.initEmbeddedCheckout({
            fetchClientSecret: getClientSecretFetcher(this.checkout.period, this.checkout.seats),
        });
        this.stripeCheckout = checkout;
        
        // Mount Checkout
        checkout.mount(this.stripe);
        this.mode = 3;
        this.updateLandscape();
    }

    async load(){
        addAuthChangeListener(async (user) => {
            this.modePath = [];
            if (user === null || !user.emailVerified) {
                
                // let email = prompt("email");
                // let password = prompt("password");
                // signIn(email,password)
                this.mode = 0;
                if (user != null && !user.emailVerified) {
                    this.loginWidget.toggleAttribute("waiting-for-email", true);
                }
            } else {
                let [licences, info] = await Promise.all([getOwnedLicences(), getUserInfo()])
                addListener((lic) => {
                    this.licences.value = Object.values(lic)
                })
                watchLicences();
                this.licences.updateInfo(info);
                this.checkout.isTrial = licences.length == 0;
                this.mode = 1;
                this.licences.value = licences;
            }
        })

        await initialise();
    }

    back(){
        if (this.modePath.length > 1) {
            this.modePath.pop();
            this.mode = this.modePath.pop();
        }
    }

    set mode(value) {
        this.modePath.push(value);
        this._mode = value;
        this.updateLandscape();
        this.styles = {"--mode": value}
        this.setAttribute("mode", value)
        this.toggleAttribute("is-back", this.modePath.length > 1);
    }
    get mode(){
        return this._mode;
    }
}


SvgPlus.defineHTMLElement(PaymentFlow);