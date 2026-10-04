import { writable, type Subscriber, type Unsubscriber, type Writable } from "svelte/store";
import { parseConfig, type GridConfig, type GridItem } from "./layoutConfig";


export class PageManagerClass {
    #activePage: Writable<[GridConfig, GridItem[]]>
    #config: Map<string, [GridConfig, GridItem[]]>
    #history: string[]

    constructor(config: string) {
        this.#config = parseConfig(config);
        let root = this.#config.get("root")
        if (root == undefined) {
            let emptyConfig: GridConfig = {
                rows: 0,
                columns: 0
            }
            let emptyElems: GridItem[] = []
            this.#activePage = writable([emptyConfig, emptyElems])
            this.#history = []
        } else {
            this.#history = ["root"]
            this.#activePage = writable(this.#config.get("root"))
        }
    }

    setActivePage(pageName: string) {
        if (pageName == "back") return this.goBackPage();
        let newPage = this.#config.get(pageName);
        if (newPage != undefined) {
            this.#history.push(pageName)
            this.#activePage.set(newPage);
        }
    }

    goBackPage() {
        let prevPageName = this.#history[this.#history.length - 2]
        let newPage = this.#config.get(prevPageName);
        if (newPage != undefined) {
            this.#history.pop()
            this.#activePage.set(newPage);
        }
    }

    subscribeToActivePage(run: Subscriber<[GridConfig, GridItem[]] | null>, invalidate?: () => void): Unsubscriber {
        return this.#activePage.subscribe(run, invalidate);
    }
}

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
      - type: pageChangeButton
        target: second
        position:
            row: 2
            column: 2
  - name: second
    grid:
      rows: 4
      columns: 4
    elements:
      - type: volumeSlider
        target:
            type: Sink
            value: default
        vertical: true
        position:
            row: 2
            column: 1
            rowSpan: 2
      - type: pageChangeButton
        target: back
        position:
            row: 1
            column: 1
`

export const PageManager = new PageManagerClass(text)