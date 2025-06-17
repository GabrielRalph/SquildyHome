import { signout } from "./Firebase/user.js";
import { SvgPlus } from "../SvgPlus/4.js";

const CHECK_OUT_TEMPLATE = `
<div class = "row">
    <div class = "top-col gap-2">
        <h1 class = "top-h1">
            Choose your pricing plan
        </h1>
        <h3>
            Unlock premium content, more powerful <br>
                AAC tools, and AI features
        </h3>
        <div>
            Empower your organisation and scale your <br> 
            connections with Squidly's all-in-one telepractice <br>
            solution. Benefit from enterprise-level security and <br>
            real-time assistive technology tools and collaboration.
        </div>
        <div class = "centered">
            <div key = "slider" class = "slider my-shadow">
                <input key = "checkbox" type = "checkbox">
                <div></div>
                <span>Monthly</span>
                <span>Yearly</span>
            </div>
        </div>
    </div>
    <div class = "centered-col">
        <div class = "plan-card my-shadow">
            <div class = "top-col gap-05">
                <h2>Squidly Pro</h2>
                <span key = "period">Monthly Package</span>
                <h1 class = "price"><b key = "price">$35.00</b><span>AUD</span></h1>
                <ul>
                    <li>Meetings up to 480<br> minutes per month</li>
                    <li>Advanced custom session<br>editors and accessibility tool</li>
                    <li>Plan and schedule sessions</li>
                    <li>Ongoing customer support</li>
                </ul>
            </div>
            <div class = "col gap-05">
                <div><input min="1" max="999" value = 1 type = "number" key = "seats"><span> seats</span></div>
                <button key = "start">START FREE TRIAL</button>
                <div class ="small">7 day free trial.</div>
            </div>
        </div>
    </div>
</div>

`
export class CheckoutMenu extends SvgPlus {
    constructor() {
        super("checkout-menu");
        this.innerHTML = CHECK_OUT_TEMPLATE;

        /** @type {Object<string, HTMLElement>} */
        let els = {};
        this.querySelectorAll("[key]").forEach(e => els[e.getAttribute("key")] = e);
        let {checkbox, price, period, seats, start, slider} = els;
        this.seatsInput = seats;
        this.checkbox = checkbox;

        slider.addEventListener("touchend", () => {
            checkbox.checked = !checkbox.checked
        })

        checkbox.addEventListener("input", () => {
            let isMonthly = !checkbox.checked;
            price.innerHTML = isMonthly ? "$35.00" : "$400.00";
            period.innerHTML = isMonthly ? "Monthly Package" : "Yearly Package";
        });

        this.start = start;
        start.onclick = () => {
            if (this.seats > 0 && this.seats < 1000) {
                this.dispatchEvent(new Event("start"))
            }
        }

        this.createChild("div", {content: "Sign out.", class: "signout click-text", events: {click: signout}})
    }

    set isTrial(bool){
        this.start.innerHTML = bool ? "Start Free Trial" : "Purchase Subscription"
        this.toggleAttribute("trial", bool);
    }   

    get seats() {
        return parseInt(this.seatsInput.value);
    }

    get period(){
        return this.checkbox.checked ? "yearly" : "monthly";
    }
}
