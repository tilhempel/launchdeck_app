<script lang="ts">
    import ActionButton from "../ActionButton.svelte";
    import { ws, type WSMessageMap, type WSEventMap } from "../../util/websocketServer";

    interface props {
        target?: string,
        isDefaultDevice?: boolean,
        value: number
    }

    let { target = "", isDefaultDevice = false, value = 5 }: props = $props()

    function sendVolumeChange() {
        ws.send("volume", {
            payload: {
                action: "ChangeSinkVolume",
                data: {
                    target: isDefaultDevice ? 0 : target,
                    delta: value
                }
            }
        })
    }

</script>

<ActionButton onclick={sendVolumeChange}>
    <i class="fa-solid fa-volume-high"></i><br>
</ActionButton>

<style>


</style>