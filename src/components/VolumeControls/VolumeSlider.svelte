<script lang="ts">
    import Slider from "../Slider.svelte";
    import { PipewireVolumeToPercent } from "../../types/Volume";
    import { ws } from "../../util/websocketServer";
    import { Applications, ApplicationState, NodeState, Sinks, Sources } from "../../util/stateStore";
    import type { Application as TApplication, Node as TNode } from "../../types/Volume";

    interface props {
        target?: string | number,
        isDefaultDevice?: boolean,
        deviceType: 'Sink' | 'Source' | 'Application',
        vertical?: boolean
    }

    let { target = 0, isDefaultDevice = false, deviceType, vertical = false}: props = $props()

    let volume = $state(50);
    let mute = $state(false);
    let actionVolume: string;
    let actionMute: string

    $effect(() => {
        let targetStore: NodeState|ApplicationState|undefined = (() => {
            switch (deviceType) {
                case "Application":
                    actionVolume = "SetAppVolume"
                    actionMute = "ToggleAppMute"
                    return Applications;
                case "Sink":
                    actionVolume = "SetSinkVolume"
                    actionMute = "ToggleMuteSink"
                    return Sinks;
                case "Source":
                    actionVolume = "SetSourceVolume"
                    actionMute = "ToggleMuteSource"
                    return Sources;
                default:
                    return undefined;
            }
        })();

        if (targetStore == undefined) return;

        if (isDefaultDevice) {
            if (deviceType == "Application") return;

            (targetStore as NodeState).subscribeToDefault((dev) => {
                if (dev == null) return;
                if (dev.channel_volumes != undefined) volume = PipewireVolumeToPercent(dev.channel_volumes);     
                if (dev.mute != undefined) mute = dev.mute;    
            });
        } else {
            targetStore.subscribeToList(list => {
                for (let val of list.values()) {
                    if (target == val.id || ("name" in val && (val as TNode).name == target) || ("app_name" in val && (val as TApplication).app_name == target)) {
                        if (val.channel_volumes != undefined) volume = PipewireVolumeToPercent(val.channel_volumes);
                        if (val.mute != undefined) mute = val.mute
                    }
                }
            });
        }
    });

    function setVolume(value: number) {
        ws.send("volume", {
            payload: {
                action: actionVolume,
                data: {
                    target: target,
                    value: value
                }
            }
        })
    }

    function toggleMute() {
        ws.send("volume", {
            payload: {
                action: actionMute,
                data: {
                    target: target
                }
            }
        })
    }
</script>
<Slider min=0 max=150 step=1 showIcon onLabelClick={toggleMute} vertical={vertical} steps={["0", "100", "150"]} value={volume}  onUpdate={(val: number) => setVolume(val)}>
    <i class="fa-solid fa-volume-high" style="{mute ? 'color: red;' : ''}"></i>
</Slider>