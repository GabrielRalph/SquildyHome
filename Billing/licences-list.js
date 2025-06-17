import { signout } from "./Firebase/user.js";
import { SvgPlus } from "../SvgPlus/4.js";

class LicenceIcon extends SvgPlus {
    constructor(licence) {
        super("licence-icon");
        this.createChild("div", {
            class: "title",
            content: licence.licenceName
        });
        let n_users = Object.keys(licence.users).length;
        let row = this.createChild("div", {class: "row-space"});
        let seats = row.createChild("div", {class: "seats"});
        seats.createChild("i", {content: "Seats: ", });
        seats.createChild("span", {content: n_users})
        seats.createChild("span", {content: " / "});
        seats.createChild("span", {content: licence.seats});

        row.createChild("div", {content: licence.disabled ? "Inactive" : "Active", active: !licence.disabled});
    }
}

export class LicencesList extends SvgPlus {
    constructor(){
        super("licence-list");
        let col = this.createChild("div", {class: "col-space gap-1"});
        let top = col.createChild("div", {class: "col-space gap-1"})
        this.name = top.createChild("h1")
        top.createChild("h1", {class: "large", content: "My Licences"});
        top.createChild("div", {content: "Pick up where you left off or continue <br> as another user. With Squidly creating<br>meaningful connections could never <br> be easier."});

        let c = col.createChild("div", {class: "col-centered gap-1"});
       this.button = c.createChild("button", {
            content: "Purchase Licence",
            events: {
                click: () => {
                    this.dispatchEvent(new Event("purchase"))
                }
            }
        });
        let t = c.createChild("div", {class: "centered"});
        t.createChild("span", {content: "Wrong account? Sign out&nbsp;"})
        t.createChild("span", {class: "click-text", content: "here.", events: {click: signout}})

        this.list = top.createChild("div", {class: "list"});
        this.createChild("div", {class: "filler"})
    }

    updateInfo({firstName}) {
        this.name.innerHTML = "Hi "+firstName;
    }

    set value(licences){
        this.list.innerHTML = "";
        if (licences.length == 0) {
            this.button.innerHTML = "Start Free Trial"
            this.list.createChild("div", {class: "centered", content: "<b>You don't have <br>any licences yet."})
        } else {
            this.button.innerHTML = "Purchase Licence"
            for (let licence of licences) {
                this.list.createChild(LicenceIcon, {}, licence);
            }
        }
    }
}
