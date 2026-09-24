// Volume related functions
function pwVolToPerc(volume: number) {
    return Math.cbrt(volume) * 100.0
}
export function PipewireVolumeToPercent(channelVolumes: number[]): number {
    return Math.max(...channelVolumes.map((vol) => pwVolToPerc(vol)))
}

export interface Device {
    name: String,
    description: String,
    id: number,
    mute?: boolean,
    channel_volumes?: number[]
}

export interface Application {
    app_name: String,
    node_name: String,
    binary: String,
    media_name: String,
    id: number,
    mute?: boolean,
    channel_volumes?: number[]
}



// incoming events
export interface VolumeUpdateEvent {
    class: String,
    emitter: Device | Application
}

export interface DefaultDeviceUpdateEvent {
    id: number,
    class: String,
    name: String
}


// outgoing events
export interface BasicVolumeEvent {
    payload: {
        action: string,
        data: {
            target: number | string
        }
    }
}

export interface VolumeChangeEvent {
    payload: {
        action: string,
        data: {
            target: number | string
            delta: number
        }
    }
}
export interface VolumeSetEvent {
    payload: {
        action: string,
        data: {
            target: number | string
            value: number
        }
    }
}