import { get, readable, writable, type Readable, type Subscriber, type Unsubscriber, type Writable } from "svelte/store";
import type { Application, Node } from "../types/Volume";

export class NodeState {
    #default: Writable<Node | null>
    #all: Writable<Map<number, Node>>
    #defaultDevID: number


    constructor(defaultDev: Node | null, deviceList: Node[]) {
        if (defaultDev != null) {
            this.#defaultDevID = defaultDev.id;
        } else {
            this.#defaultDevID = 0
        }
        this.#default = writable(defaultDev);
        this.#all = writable(new Map<number, Node>())
        if (deviceList != null) {
            this.setNodeList(deviceList)
        }
    }

    setNodeList(devices: Node[]) {
        let m = new Map<number, Node>()
        for (let dev of devices) {
            m.set(dev.id, dev)
        }
        this.#all.set(m);
    }
    setDefault(newDefault: Node | number | String) {
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
                this.#default.set(newDefault as Node);
                this.#defaultDevID = (newDefault as Node).id
        }
    }
    removeNode(target: Node | number) {
        let m = get(this.#all);
        if (typeof target ==  "number") {
            m.delete(target)
        } else {
            m.delete(target.id)
        }
        this.#all.set(m)        
    }

    updateNode(d: Node) {        
        let m = get(this.#all)

        m.set(d.id, d)
        this.#all.set(m)
        if (d.id == this.#defaultDevID) {
            this.#default.set(d)
        }
    }

    subscribeToDefault(run: Subscriber<Node | null>, invalidate?: () => void): Unsubscriber {
        return this.#default.subscribe(run, invalidate);
    }
    subscribeToList(run: Subscriber<Map<number, Node>>, invalidate?: () => void): Unsubscriber {
        return this.#all.subscribe(run, invalidate)
    }
}

export class ApplicationState {
    #list: Writable<Map<number, Application>>

    constructor(apps: Application[] | null) {
        this.#list = writable(new Map<number, Application>());
        if (apps != null) {
            this.setAppList(apps)
        }
    }

    setAppList(apps: Application[]) {
        let m = new Map<number, Application>();
        for (let app of apps) {
            m.set(app.id, app)
        }
        this.#list.set(m)
    }

    removeApp(app: Application) {
        let m = get(this.#list)
        m.delete(app.id)
        this.#list.set(m)
    }

    updateApp(app: Application) {
        let m = get(this.#list)
        m.set(app.id, app)
        this.#list.set(m)
    }

    subscribeToList(run: Subscriber<Map<number, Application>>, invalidate?: () => void): Unsubscriber {
        return this.#list.subscribe(run, invalidate)
    }

}

export const Sinks = new NodeState(null, [])
export const Sources = new NodeState(null, [])
export const Applications = new ApplicationState(null)