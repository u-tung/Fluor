import { createContext } from "react"
import assert from "assert"


export type ComponentData = {
  x: number
  y: number
  argLabels: string[]
  outLabel: string | null
  name: string
  currValue: [number, number, number],
  type: "middle" | "slider" | "output"
}

type CompoAction = {
  type: "append"
  compo: ComponentData
} | {
  type: "delete"
  key: number
} | {
  type: "setCurrValues"
  currValues: Map<number, [number, number, number]>
}


let compoCounter = 0
export function compoContextReducer(
  compoContext: Map<number, ComponentData>,
  action: CompoAction
) {
  switch (action.type) {
    case "append": {
      const option: any = {}
      if (action.compo.type === "slider") {
        option.no_calculating = true
      }

      window.pywebview.api.createCompo(
        compoCounter,
        action.compo.name,
        action.compo.argLabels,
        option
      )

      const newContext = new Map(compoContext)
      newContext.set(compoCounter++, action.compo)
      return newContext
    }

    case "delete": {
      window.pywebview.api.deleteCompo(action.key)

      const newContext = new Map(compoContext)
      newContext.delete(action.key)
      return newContext
    }

    case "setCurrValues": {
      const newContext = new Map(compoContext)
      for (const [id, value] of action.currValues.entries()) {
        const compo = newContext.get(id)
        if (compo != null) {
          compo.currValue = value
        }
      }
      return newContext
    }

    default:
      assert(false, `Unknown action: ${action}`)
  }
}


export const CompoContext = createContext<Map<number, ComponentData>>(null as any)
export const CompoDispatchContext = createContext<React.Dispatch<CompoAction>>(null as any)


export type ConnLine = {
  fromSlot: {compoId: number, slotLabel: string}
  toSlot: {compoId: number, slotLabel: string}
}

export type DraggingConnLine = {
  fromSlot: {compoId: number, slotLabel: string}
  toPos: {x: number, y: number}
}

type ConnLinesAction = {
  type: "deleteCompoConnLines"
  compoId: number
} | {
  type: "deleteSlotConnLines",
  slot: {compoId: number; slotLabel?: string}
} | {
  type: "append",
  connLine: ConnLine
}

export function connLinesReducer(
  connLines: ConnLine[], action: ConnLinesAction
): ConnLine[] {
  switch (action.type) {
    case "deleteCompoConnLines": {
      const { compoId } = action
      return connLines.filter(line => {
        const result = (
          !slotEqual({compoId}, line.fromSlot) &&
          !slotEqual({compoId}, line.toSlot)
        )
        if (!result) {
          window.pywebview.api.disconnectCompo({
            compoId: line.toSlot.compoId,
            name: line.toSlot.slotLabel
          })
        }
        return result
      })
    }

    case "deleteSlotConnLines": {
      return connLines.filter(line => {
        const result = (
          !slotEqual(action.slot, line.fromSlot) &&
          !slotEqual(action.slot, line.toSlot)
        )
        if (!result) {
          window.pywebview.api.disconnectCompo({
            compoId: line.toSlot.compoId,
            name: line.toSlot.slotLabel
          })
        }
        return result
      })
    }

    case "append": {
      const connLine = action.connLine
      window.pywebview.api.connectCompo(
        connLine.fromSlot.compoId, {
          name: connLine.toSlot.slotLabel,
          compoId: connLine.toSlot.compoId
        }
      )
      return [...connLines, action.connLine]
    }

    default:
      assert(false, `Unknown action: ${action}`)
  }
}


function slotEqual(
    slot1: { compoId: number; slotLabel?: string },
    slot2: { compoId: number; slotLabel: string }
) {
  return slot1.compoId === slot2.compoId &&
    (slot1.slotLabel == null || slot1.slotLabel === slot2.slotLabel)
}

export const ConnLinesContext = createContext<ConnLine[]>(null as any)
export const ConnLinesDispatchContext = createContext<
    React.Dispatch<ConnLinesAction>
>(null as any)
