<script lang="ts">
    import Slider from "../Slider.svelte";
    import { PipewireVolumeToPercent } from "../../types/Volume";
    import { ws } from "../../util/websocketServer";
  import { Applications, Sinks, Sources } from "../../util/stateStore";

    interface props {
        target?: string | number,
        isDefaultDevice?: boolean,
        deviceType: 'Sink' | 'Source' | 'Application',
        vertical?: boolean
    }

    let { target = 0, isDefaultDevice = false, deviceType, vertical = false}: props = $props()

    let volume = $state(50)

    let linkedState = $derived(
        deviceType === "Sink" ? Sinks : Sources
    );

    $effect(() => {
        if (deviceType == "Application") {
            Applications.subscribeToList((apps) => {
                for (let app of apps.values()) {
                    if (app.id == target) {
                        if (app.channel_volumes != undefined) volume = PipewireVolumeToPercent(app.channel_volumes);
                    }
                }
            });
            return
        }
        if (isDefaultDevice) {
                linkedState.subscribeToDefault((dev) => {
                    if (dev == null) return;
                    if (dev.channel_volumes != undefined) volume = PipewireVolumeToPercent(dev.channel_volumes);            
                });
        } else {
            linkedState.subscribeToList(list => {
                for (let val of list.values()) {
                    if (target == val.name) {
                        if (val.channel_volumes != undefined) volume = PipewireVolumeToPercent(val.channel_volumes);
                    }
                }
            });
        }
    });

    function setVolume(value: number) {
        
        ws.send("volume", {
            payload: {
                action: (deviceType == "Sink") ? "SetSinkVolume" : (deviceType == "Source") ? "SetSourceVolume" : "SetAppVolume",
                data: {
                    target: target,
                    value: value
                }
            }
        })
    }
</script>
<Slider min=0 max=150 step=1 showValue vertical={vertical} steps={["0", "100", "150"]} value={volume}  onUpdate={(val: number) => setVolume(val)}>
    <i class="fa-solid fa-volume-high"></i>
</Slider>