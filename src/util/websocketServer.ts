import { writable, type Readable } from "svelte/store";
import type { DefaultDeviceUpdateEvent, BasicVolumeEvent, VolumeUpdateEvent, VolumeChangeEvent, VolumeSetEvent, Node, Application } from "../types/Volume";

import { Applications, Sinks, Sources } from "./stateStore";

export interface WSEventMap {
    Volume: VolumeUpdateEvent;
    DefaultDevice: DefaultDeviceUpdateEvent
    InitData: {
        default_sink: string,
        default_source: string,
        sinks: Node[],
        sources: Node[],
        applications: Application[]
    }
}
export interface WSMessageMap {
    volume: BasicVolumeEvent | VolumeChangeEvent | VolumeSetEvent;
}

type WSStatus = 'connecting' | 'open' | 'closed' | 'error'

interface WSState {
    status: WSStatus,
    error: Event | null
}

class TypedMessageEvent<K extends keyof WSEventMap> extends CustomEvent<WSEventMap[K]> {
  constructor(type: K, detail: WSEventMap[K]) {
    super(type as string, { detail });
  }
}

export interface WebSocketStore extends Readable<WSState> {
  send: <K extends keyof WSMessageMap>(type: K, payload: WSMessageMap[K]) => void;
  reconnect: () => void;
  addEventListener: <K extends keyof WSEventMap>(
    type: K,
    listener: (event: TypedMessageEvent<K>) => void
  ) => void;
  removeEventListener: <K extends keyof WSEventMap>(
    type: K,
    listener: (event: TypedMessageEvent<K>) => void
  ) => void;
}

function createWebSocketConnection(url: string): WebSocketStore {
    const { subscribe, update } = writable<WSState>({
        status: "connecting",
        error: null
    });
    const events = new EventTarget();

    let socket: WebSocket;

    function connect() {
        socket = new WebSocket(url);

        socket.onopen = () => update(s => ({...s, status: "open", error: null}));
        socket.onclose = () => update(s => ({...s, status: "closed"}));
        socket.onerror = (e) => update(s => ({...s, status: "error", error: e}))

        socket.onmessage = (event: MessageEvent) => {
            let data: { type: keyof WSEventMap; [key: string]: unknown}
            try {
                data = JSON.parse(event.data);
            } catch {
                console.log("Failed to parse message event data", event.data)
                return;
            }
            const { type, payload } = data; 
            switch (type) {
                case "InitData":                    
                    handleInitData(payload as WSEventMap[typeof type])
                    break;
                case "DefaultDevice":
                    Sinks.setDefault((payload as unknown as WSEventMap[typeof type]).name);
                    break;
                case "Volume":
                    let p = (payload as unknown as WSEventMap[typeof type])
                    if (p.class == "Audio/Sink") {                        
                        Sinks.updateDevice(p.emitter as Node);
                    }
                    if (p.class == "Audio/Source") {
                        Sources.updateDevice(p.emitter as Node);
                    }
                    if (p.class == "Stream/Output/Audio") {
                        Applications.updateApp(p.emitter as Application)
                    }
                    break
                default:
                    break;
            }
            // cast to unknown is a bit usafe
            events.dispatchEvent(new TypedMessageEvent(type, payload as unknown as WSEventMap[typeof type]));
        };
    }

    function send<K extends keyof WSMessageMap>(type: K, payload: WSMessageMap[K]) {
        if (socket?.readyState == WebSocket.OPEN) {
            socket.send(JSON.stringify({type, ...payload}))
        } else {
            console.error("Could niot send message: Socket not open", type, payload)
        }
    }

    function reconnect() {
        socket?.close();
        connect();
    }

    connect();

    return {
        subscribe,
        send,
        reconnect,
        addEventListener: (type, listener) => events.addEventListener(type as string, listener as EventListener),
        removeEventListener: (type, listener) => events.removeEventListener(type as string, listener as EventListener)
    }
}

export const ws = createWebSocketConnection("ws://localhost:8080")


function handleInitData(data: WSEventMap["InitData"]) {
    Sinks.setDeviceList(data.sinks)
    Sinks.setDefault(data.default_sink)
    Sources.setDeviceList(data.sources)
    Sources.setDefault(data.default_source)
    Applications.setAppList(data.applications)
}