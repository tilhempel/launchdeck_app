<script lang="ts">
    import Slider from "../Slider.svelte";
    import { PipewireVolumeToPercent } from "../../types/Volume";
    import { ws, type WSMessageMap, type WSEventMap } from "../../util/websocketServer";
  import { Sinks, SinkState, Sources } from "../../util/stateStore";

    interface props {
        target?: string,
        isDefaultDevice?: boolean,
        deviceType: 'Sink' | 'Source'
    }

    let { target = "", isDefaultDevice = false, deviceType }: props = $props()

    let volume = $state(50)

    let linkedState = $derived(
        deviceType === "Sink" ? Sinks : Sources
    );

    $effect(() => {
        if (isDefaultDevice) {
                linkedState.subscribeToDefault((dev) => {
                    console.log(dev);
                    
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
                action: (deviceType == "Sink") ? "SetSinkVolume" : "SetSourceVolume",
                data: {
                    target: 0,
                    value: value
                }
            }
        })
    }
</script>
<Slider min=0 max=150 step=1 showValue vertical steps={["0", "100", "150"]} value={volume}  onUpdate={(val: number) => setVolume(val)}>
    <i class="fa-solid fa-volume-high"></i>
</Slider>