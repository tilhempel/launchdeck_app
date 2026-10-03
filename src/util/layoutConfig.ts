import type { Component } from "svelte";
import YAML from "yaml";
import { z } from "zod";
import ChangeVolume from "../components/VolumeControls/ChangeVolume.svelte";
import GridElement from "../pages/GridElement.svelte";
import MuteButton from "../components/VolumeControls/MuteButton.svelte";
import VolumeSlider from "../components/VolumeControls/VolumeSlider.svelte";

export interface UIElement {
    component: Component<any>,
    props?: Record<string, unknown>,
    children?: UIElement[]
}

interface GridItem {
    component: Component<any>,
    children?: UIElement[],
    props: {
        row: number,
        column: number,
        rowSpan?: number,
        columnSpan?: number
    }
}
interface GridConfig {
    rows: number,
    columns: number
}

// =========================
// single action element schemas
// =========================
const ElementSchema = z.object({
    position: z.object({
        row: z.number(),
        column: z.number(),
        rowSpan: z.number().optional(),
        columnSpan: z.number().optional()
    }),
    type: z.string()
})
type Element = z.infer<typeof ElementSchema>

const VolumeButtonSchema = ElementSchema.extend({
    type: z.literal("changeVolume"),
    target: z.object({
        type: z.enum(["Sink", "Source", "Application"]),
        value: z.union([z.string(), z.number()])
    }),
    value: z.number()
})
type VolumeButtonType = z.infer<typeof VolumeButtonSchema>

const MuteButtonSchema = ElementSchema.extend({
    type: z.literal("mute"),
    target: z.object({
        type: z.enum(["Sink", "Source", "Application"]),
        value: z.union([z.string(), z.number()])
    })
});
type MuteButtonType = z.infer<typeof MuteButtonSchema>

const VolumeSliderSchema = ElementSchema.extend({
    type: z.literal("volumeSlider"),
    target: z.object({
        type: z.enum(["Sink", "Source", "Application"]),
        value: z.union([z.string(), z.number()])
    }),
    vertical: z.boolean()
});

type VolumeSliderType = z.infer<typeof VolumeSliderSchema>


const ElementUnionSchema = z.discriminatedUnion("type", [
    VolumeButtonSchema,
    MuteButtonSchema,
    VolumeSliderSchema
])

// =================
// general config/page schemas
// =================

const PageSchema = z.object({
    name: z.string(),
    grid: z.object({
        rows: z.number(),
        columns: z.number()
    }),
    elements: z.array(ElementUnionSchema)
})
type Page = z.infer<typeof PageSchema>

const ConfigSchema = z.object({
    pages: z.array(PageSchema)
})
type Config = z.infer<typeof ConfigSchema>

const text = `
pages:
  - name: root
    grid:
      rows: 5
      columns: 5
    elements:
      - type: changeVolume
        target: 
          type: Sink
          value: default
        value: 5
        position:
          row: 1
          column: 1
      - type: mute
        target:
            type: Sink
            value: default
        position:
            row: 1
            column: 2
      - type: volumeSlider
        target:
            type: Sink
            value: default
        vertical: false
        position:
            row: 1
            column: 3
            columnSpan: 2
      - type: volumeSlider
        target:
            type: Sink
            value: default
        vertical: true
        position:
            row: 2
            column: 1
            rowSpan: 2
`



export function parseConfig(path: String): Map<string, [GridConfig, GridItem[]]> {
    let layout = new Map<string, [GridConfig, GridItem[]]>();
    const data = YAML.parse(text)

    const res = ConfigSchema.safeParse(data)
    if (!res.success) {
        console.error("Could not parse config file: " + res.error)
        return layout;
    }
    const config = res.data
    
    for (let page of config.pages) {
        let [name, config, components] = parsePage(page)
        layout.set(name, [config, components]);
    }
    return layout;
}

function parsePage(p: Page): [string, GridConfig, GridItem[]] {
    let elems: GridItem[] = []
    

    for(let e of p.elements) {
        let uiElem: UIElement;
        switch (e.type) {
            case "changeVolume":
                uiElem = parseVolumeButton(e)
                break;
            case "mute":
                uiElem = parseMuteButton(e)
                break;
            case "volumeSlider":
                uiElem = parseVolumeSlider(e)
                break;
            default:
                continue;
        }
        elems.push({
            component: GridElement,
            props: {
                row: e.position.row,
                column: e.position.column,
                rowSpan: e.position.rowSpan,
                columnSpan: e.position.columnSpan,
            },
            children: [uiElem]
        });
        
    }
    
    
    return [
        p.name,
        p.grid,
        elems
    ]
}

function parseVolumeButton(b: VolumeButtonType): UIElement {
    return {
        component: ChangeVolume,
        props: {
            isDefaultDevice: b.target.value == "default",
            target: b.target.value == "default" ? 0 : b.target.value
        }
    }
}

function parseMuteButton(b: MuteButtonType): UIElement {
    return {
        component: MuteButton,
        props: {
            isDefaultDevice: b.target.value == "default",
            target: b.target.value == "default" ? 0 : b.target.value,
            deviceType: b.target.type
        }
    }
}

function parseVolumeSlider(s: VolumeSliderType): UIElement {
    return {
        component: VolumeSlider,
        props: {
            isDefaultDevice: s.target.value == "default",
            target: s.target.value == "default" ? 0 : s.target.value,
            deviceType: s.target.type,
            vertical: s.vertical
        }
    }
}