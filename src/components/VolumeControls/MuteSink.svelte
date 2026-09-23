<script lang="ts">
    import ActionButton from "../ActionButton.svelte";

    import { ws } from "../../util/websocketServer";
    import { Sinks } from "../../util/stateStore";

    interface props {
        target?: string,
        isDefaultDevice?: boolean
    }

    let { target = "", isDefaultDevice = false }: props = $props();

    let muteState = $state(false)

    if (isDefaultDevice) {
        Sinks.subscribeToDefault((dev) => {
            
            if (dev == null) return;
            if (dev.mute != undefined) muteState = dev.mute;            
        });
    } else {
        Sinks.subscribeToList(list => {
            for (let val of list.values()) {
                if (target == val.name) {
                    if (val.mute != undefined) muteState = val.mute;
                }
            }
        });
    }


    function sendToggle() {
        ws.send("volume", {
            payload: {
                action: "ToggleMuteSink",
                data: {
                    target: isDefaultDevice ? 0 : target
                }
            }
        });
        muteState = !muteState
    }


</script>

<ActionButton onclick={sendToggle}>
    <i class="fa-solid fa-volume-xmark {muteState ? 'muted' : ''}"></i><br>
</ActionButton>

<style>
    .muted {
        color: red;
    }
</style>