<script lang="ts">
    import ActionButton from "../ActionButton.svelte";
    import { ws } from "../../util/websocketServer";
    import { Applications, ApplicationState, NodeState, Sinks, Sources } from "../../util/stateStore";
    import type { Application as TApplication, Node as TNode } from "../../types/Volume";

    interface props {
        target?: string | number,
        isDefaultDevice?: boolean,
        deviceType: 'Sink' | 'Source' | 'Application',
    }

    let { target = "", isDefaultDevice = false, deviceType }: props = $props();

    let muteState = $state(false);
    let action: string;
    
    $effect(() => {
        let targetStore: NodeState|ApplicationState|undefined = (() => {
            switch (deviceType) {
                case "Application":
                    action = "ToggleAppMute"
                    return Applications;
                case "Sink":
                    action = "ToggleMuteSink"
                    return Sinks;
                case "Source":
                    action = "ToggleMuteSource"
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
                if (dev.mute != undefined) muteState = dev.mute;            
            });
        } else {
            targetStore.subscribeToList(list => {
                for (let val of list.values()) {
                    if (target == val.id || ("name" in val && (val as TNode).name == target) || ("app_name" in val && (val as TApplication).app_name == target)) {
                        if (val.mute != undefined) muteState = val.mute;
                    }
                }
            });
        }
    });

    function sendToggle() {
        ws.send("volume", {
            payload: {
                action: action,
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