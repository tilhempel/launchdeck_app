import type { Component } from "svelte";
import YAML from "yaml";
import { z } from "zod";
import ChangeVolume from "../components/VolumeControls/ChangeVolume.svelte";
import GridElement from "../pages/GridElement.svelte";
import MuteButton from "../components/VolumeControls/MuteButton.svelte";
import VolumeSlider from "../components/VolumeControls/VolumeSlider.svelte";
import PageChangeButton from "../components/Controls/PageChangeButton.svelte";
import { islands } from "../components/InfoIsland/InfoHandler.svelte";

export interface UIElement {
    component: Component<any>,
    props?: Record<string, unknown>,
    children?: UIElement[]
}

export interface GridItem {
    component: Component<any>,
    children?: UIElement[],
    props: {
        row: number,
        column: number,
        rowSpan?: number,
        columnSpan?: number
    }
}
export interface GridConfig {
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

const PageChangeButtonSchema = ElementSchema.extend({
    type: z.literal("pageChangeButton"),
    target: z.string()
})

type PageChangeButtonType = z.infer<typeof PageChangeButtonSchema>


const ElementUnionSchema = z.discriminatedUnion("type", [
    VolumeButtonSchema,
    MuteButtonSchema,
    VolumeSliderSchema,
    PageChangeButtonSchema
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



export function parseConfig(path: string): Map<string, [GridConfig, GridItem[]]> {
    let layout = new Map<string, [GridConfig, GridItem[]]>();
    const data = YAML.parse(path)

    const res = ConfigSchema.safeParse(data)
    if (!res.success) {
        islands.error("Could not parse config file", {details: res.error})
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
            case "pageChangeButton":
                uiElem = parsePageChangeButton(e)
                break;
            default:
                islands.warning("Config Item could not be parsed", {
                    details: "Element: \n" + e
                })
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

function parsePageChangeButton(b: PageChangeButtonType): UIElement {
    return {
        component: PageChangeButton,
        props: {
            target: b.target,
            back : b.target == "back"
        }
    }
}