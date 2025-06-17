import { get, ref, callFunction, onValue, onChildAdded, getUID, onChildRemoved} from "./firebase-client.js";

export function getClientSecretFetcher (period, seats) {
    return async () => {
        const res = await callFunction("stripe-createLicenceCheckout", {
            period,
            tier: "Pro",
            seats,
            licenceName: "my licence",
            return_url: window.location.origin,
        })
        let {errors, client_secret} = res.data;
        if (errors.length > 0) {
            console.warn(errors[0]);
        }
        console.log(res);
        
        return client_secret;
    }
};


export function refAt(...path) {
    path.forEach(e => {
        if (typeof e !== "string" || e.length == 0) throw "Path Error";
    })
    path = path.join("/")
    return ref(path);
}

export async function getAt(...path) {
    let res = null;
    try {
        res = (await get(refAt(...path))).val();
    } catch (e) {
        console.warn(`failed to get: ${path.join("/")}`);
    }

    return res;
}

let watchers = []
let listeners = []
let lid_watchers = {

}
let owned = {

}
export function addListener(cb) {
    if (cb instanceof Function) listeners.push(cb)
}
function onLicenceUpdate(){
    listeners.forEach(cb=>cb(owned))
}
function addLicenceWatchers(lid){
    lid_watchers[lid] = {
        status: onValue(refAt("licences",lid,"users",getUID(),"status"), (sn) => {
            let value = sn.val();

            if (value == "owner") {
                if (!(lid_watchers[lid]?.all instanceof Function)) {
                    console.log("wathcing", lid);
                    
                    lid_watchers[lid].all = onValue(refAt("licences",lid), (sn2) => {
                        owned[lid] = sn2.val();
                        onLicenceUpdate();
                    })
                }
            } else {
                if (lid_watchers[lid]?.all instanceof Function) {
                    lid_watchers[lid].all();
                    lid_watchers[lid].all = null;
                }
            }
        })
    }
}
function endLicenceListener(lid){
    if (lid in lid_watchers) {
        if (lid_watchers[lid]?.status instanceof Function) lid_watchers[lid]?.status()
        lid_watchers[lid].status = null;
        if (lid_watchers[lid]?.all instanceof Function) lid_watchers[lid]?.all()
        lid_watchers[lid].all = null;
        delete owned[lid];
        onLicenceUpdate();
    }
}
export async function watchLicences() {
    let usersLics = refAt("users", getUID(), "licences");
    console.log(usersLics);
    
    watchers = [
        onChildAdded(usersLics, (sn) => {
            addLicenceWatchers(sn.key);
        }),
        onChildRemoved(usersLics, (sn) => {
            endLicenceListener(sn.key);
        })
    ]
}

export function getOwned(){
    return owned;
}
export async function getOwnedLicences(){
    
    let licences = await getAt("users", getUID(), "licences");
    
    licences = licences == null ? [] : Object.keys(licences);

    let isOwned = await Promise.all(
        licences.map(async lid => await getAt("licences",lid,"users",getUID(),"status") == "owner")
    );

    let owned = licences.filter((l, i) => isOwned[i]);

    let ownedLicences = await Promise.all(owned.map(async lid => await getAt("licences", lid)))

    return ownedLicences;
}
