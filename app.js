import { SvgPlus } from "./SvgPlus/4.js";
import {} from "./templates/Splash.js"



function delay(time){
    if (time) {
        return new Promise((resolve, reject) => setTimeout(resolve, time))
    } else {
        return new Promise((resolve, reject) => {
            window.requestAnimationFrame(resolve)
        })
    }
}

class FaderCarousel extends SvgPlus {
    constructor(el) {
        super(el);
        this.time = 3;
    }

    set time(time){
        this._time = time;
    }
    get time(){
        return this._time;
    }

    onconnect(){
        this.stop = false;
        this.start();
        this.watchSize();
    }
    ondisconnect(){
        this.stop = true;
    }
    async watchSize(){
        while(!this.stop) {
            let maxH = 0;
            let maxW = 0;
            for (let child of this.children) {
                let h = child.clientHeight;
                let w = child.clientWidth;
                if (h > maxH) maxH  = h;
                if (w > maxW) maxW  = w;
            }
            this.styles = {
                "min-width": maxW + "px",
                "min-height": maxH + "px"
            }
            await delay();
        }
    }
    async start() {
        let i = 0;
        while(!this.stop) {
            this.children[i].toggleAttribute("show", true)
            await delay(this.time * 1000);
            this.children[i].toggleAttribute("show", false)
            i = (i + 1) % this.children.length;
        }
    }

    static get observedAttributes() {return ["time"]}
}
SvgPlus.defineHTMLElement(FaderCarousel);

let pages_urls = {
    "home": "./Pages/home.html",
    "designed_for_you": "./Pages/designed for you.html",
    "about": "./Pages/about.html",
    "plans_and_pricing": "./Pages/plans and pricing.html"
}
let pages_html = {}
let proms = {}
async function loadHTML(url, key) {
    let html = await (await fetch(url)).text();
    pages_html[key] = html;
    return html;
}
for (let title in pages_urls) {
    proms[title] = loadHTML(pages_urls[title]);
}

let main = new SvgPlus(document.querySelector("main"));
main.innerHTML = await proms.home;
setTimeout(() => {
    document.querySelector("squidly-logo[full]").hide(0.3);
}, 1000)

function updateScrollWatches(){
    let scrollWatches = document.querySelectorAll("[scroll-relative]");
    for (let sw of scrollWatches) {
        let ypos = sw.getBoundingClientRect().y;
        sw.style.setProperty("--ypos", ypos);
        sw.style.setProperty("--ypos-rel", ypos/window.innerHeight);
    }
}

let scrollUpdate = false;
window.addEventListener("scroll", () => {
    scrollUpdate = true;
})
async function updateScrollWatchesA(){
    while(true){
        await delay();
        if (scrollUpdate) updateScrollWatches()
        scrollUpdate = false;
    }
}
updateScrollWatchesA();