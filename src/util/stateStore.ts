import { get, readable, writable, type Readable, type Subscriber, type Unsubscriber, type Writable } from "svelte/store";
import type { Device } from "../types/Volume";

class SinkState {
    #default: Writable<Device | null>
    #all: Writable<Map<number, Device>>
    #defaultDevID: number


    constructor(defaultDev: Device | null, deviceList: Device[]) {
        if (defaultDev != null) {
            this.#defaultDevID = defaultDev.id;
        } else {
            this.#defaultDevID = 0
        }
        this.#default = writable(defaultDev);
        this.#all = writable(new Map<number, Device>())
        if (deviceList != null) {
            this.setDeviceList(deviceList)
        }
    }

    setDeviceList(devices: Device[]) {
        let m = new Map<number, Device>()
        for (let dev of devices) {
            m.set(dev.id, dev)
        }
        this.#all.set(m);
    }
    setDefault(newDefault: Device | number | String) {
        switch (typeof newDefault) {
            case "string":
                for (let v of get(this.#all).values()) {
                    if (v.name == newDefault.trim()) {
                        this.#default.set(v)
                        this.#defaultDevID = v.id
                        return
                    }
                }
                break;
            case "number":
                let newDev = get(this.#all).get(newDefault)
                if (newDev == undefined) {
                    console.error("Device not found")
                    return
                }
                this.#default.set(newDev)
                this.#defaultDevID = newDev.id
            default:
                this.#default.set(newDefault as Device);
                this.#defaultDevID = (newDefault as Device).id
        }
    }
    removeFromDeviceList(target: Device | number) {
        let m = get(this.#all);
        if (typeof target ==  "number") {
            m.delete(target)
        } else {
            m.delete(target.id)
        }
        this.#all.set(m)        
    }

    updateDevice(d: Device) {
        let m = get(this.#all)

        m.set(d.id, d)
        this.#all.set(m)
        if (d.id == this.#defaultDevID) {
            this.#default.set(d)
        }
    }

    subscribeToDefault(run: Subscriber<Device | null>, invalidate?: () => void): Unsubscriber {
        return this.#default.subscribe(run, invalidate);
    }
    subscribeToList(run: Subscriber<Map<number, Device>>, invalidate?: () => void): Unsubscriber {
        return this.#all.subscribe(run, invalidate)
    }
}

export const Sinks = new SinkState(null, [])
export const Sources = new SinkState(null, [])