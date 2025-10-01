import React, { useContext, useEffect, useReducer, useRef } from "react"
import { useState } from "react"
import { useMouse } from "@uidotdev/usehooks"
import Component, { OutputComponent, SliderComponent } from "../Component/Component"
import assert from "assert"
import Sidebar from "../Sidebar/Sidebar"

import "./main.scss"
import { CompoContext, compoContextReducer, CompoDispatchContext, ConnLine, ConnLinesContext, ConnLinesDispatchContext, connLinesReducer, DraggingConnLine } from "../context"


export default function Main() {
  // Should be executed with higher priority than compoContext
  // to prevent connLines from being deleted after the component is removed.
  const [connLines, connLinesDispatch] = useReducer(
    connLinesReducer, []
  )
  const [compoContext, compoContextDispatch] = useReducer(
    compoContextReducer, new Map()
  )

  useEffect(() => {
    window.jsApi = {
      setCurrValues: (values) => {
        compoContextDispatch({
          type: "setCurrValues",
          currValues: values
        })
      }
    }
  })

  const viewFirst = useRef(true)
  const viewRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (viewRef.current == null || viewFirst.current == false) {
      return
    }

    const viewElem = viewRef.current
    viewElem.scrollLeft = viewElem.scrollWidth/2
    viewElem.scrollTop = viewElem.scrollHeight/2
    viewFirst.current = false
  }, [viewRef.current])

  return (
    <main className="main">
      <CompoContext.Provider value={compoContext}>
        <CompoDispatchContext.Provider value={compoContextDispatch}>
          <ConnLinesContext.Provider value={connLines}>
            <ConnLinesDispatchContext.Provider value={connLinesDispatch}>
              <Sidebar entries={[
                  {name: "True", outLabel: "out", argLabels: [], type: "middle"},
                  {name: "False", outLabel: "out", argLabels: [], type: "middle"},
                  {name: "White", outLabel: "out", argLabels: [], type: "middle"},

                  {name: "Clock", outLabel: "out", argLabels: [], type: "middle"},
                  {name: "HalfClock", outLabel: "out", argLabels: [], type: "middle"},
                  {name: "Random", outLabel: "out", argLabels: [], type: "middle"},
                  {name: "TriggerRandom", outLabel: "out", argLabels: ["on"], type: "middle"},
                  {name: "SinWave", outLabel: "out", argLabels: [], type: "middle"},
                  {name: "CosWave", outLabel: "out", argLabels: [], type: "middle"},

                  {name: "Invert", outLabel: "out", argLabels: ["rgb"], type: "middle"},
                  {name: "Add", outLabel: "sum", argLabels: ["rgb1", "rgb2"], type: "middle"},
                  {name: "SafeAdd", outLabel: "sum", argLabels: ["rgb1", "rgb2"], type: "middle"},
                  {name: "Sub", outLabel: "diff", argLabels: ["rgb1", "rgb2"], type: "middle"},
                  {name: "SafeSub", outLabel: "diff", argLabels: ["rgb1", "rgb2"], type: "middle"},
                  {name: "Multiply", outLabel: "product", argLabels: ["rgb1", "rgb2"], type: "middle"},
                  {name: "SafeMultiply", outLabel: "product", argLabels: ["rgb1", "rgb2"], type: "middle"},

                  {name: "Mix", outLabel: "mixed", argLabels: ["rgb1", "rgb2"], type: "middle"},

                  {name: "Switch", outLabel: "out", argLabels: ["se", "on", "off"], type: "middle"},
                  {name: "OnlyRed", outLabel: "out", argLabels: ["rgb"], type: "middle"},
                  {name: "OnlyGreen", outLabel: "out", argLabels: ["rgb"], type: "middle"},
                  {name: "OnlyBlue", outLabel: "out", argLabels: ["rgb"], type: "middle"},
                  {name: "Compose", outLabel: "rgb", argLabels: ["r", "g", "b"], type: "middle"},

                  {name: "Slider", outLabel: "out", argLabels: [], type: "slider"},

                  {name: "LED01", outLabel: "", argLabels: ["output"], type: "output"},
                  {name: "LED02", outLabel: "", argLabels: ["output"], type: "output"},
                  {name: "LED03", outLabel: "", argLabels: ["output"], type: "output"},
                ]}
                onClickEntries={x => {
                  const viewElem = document.querySelector(".view")
                  assert(viewElem != null)

                  compoContextDispatch({type: "append", compo: {
                    name: x.name,
                    outLabel: x.outLabel,
                    argLabels: x.argLabels,
                    x: viewElem.scrollLeft + 20,
                    y: viewElem.scrollTop + 20,
                    currValue: [0,0,0],
                    type: x.type
                  }})
                }}
              />
              <div ref={viewRef} className="view">
                <Venue />
              </div>
            </ ConnLinesDispatchContext.Provider>
          </ ConnLinesContext.Provider>
        </CompoDispatchContext.Provider>
      </CompoContext.Provider>
    </main>
  )
}


function Venue() {
  const data = useContext(CompoContext)
  const dataDispatch = useContext(CompoDispatchContext)
  const connLines = useContext(ConnLinesContext)
  const connLinesDispatch = useContext(ConnLinesDispatchContext)

  const [mouse, ref] = useMouse()
  const [draggedCompoId, setDraggedCompoId] = useState<number | null>(null)
  const offset = React.useRef<[number, number]>([0,0])

  const hoveredCompoId = React.useRef<number | null>(null)
  const hoveredSlot = React.useRef<{ label: string; type: "in" | "out" } | null>(
    null
  )

  const draggingLine = React.useRef<DraggingConnLine | null>(null)

  if (draggedCompoId != null) {
    data.get(draggedCompoId)!.x = Math.max(0, mouse.elementX+offset.current[0])
    data.get(draggedCompoId)!.y = Math.max(0, mouse.elementY+offset.current[1])
  }

  React.useEffect(() => {
    const mouseup = () => {
      if (draggingLine.current != null && hoveredSlot.current != null) {
        assert(hoveredCompoId.current != null)

        if (hoveredCompoId.current !== draggingLine.current.fromSlot.compoId) {
          if (hoveredSlot.current.type === "in") {
            connLinesDispatch({
              type: "deleteSlotConnLines",
              slot: {
                compoId: hoveredCompoId.current,
                slotLabel: hoveredSlot.current.label
            }})
            connLinesDispatch({
              type: "append",
              connLine: {
                fromSlot: draggingLine.current.fromSlot,
                toSlot: {
                  compoId: hoveredCompoId.current,
                  slotLabel: hoveredSlot.current.label
            }}})
          }
          else {
            connLinesDispatch({
              type: "append",
              connLine: {
                toSlot: draggingLine.current.fromSlot,
                fromSlot: {
                  compoId: hoveredCompoId.current,
                  slotLabel: hoveredSlot.current.label
            }}})
          }
        }
      }
      draggingLine.current = null
      setDraggedCompoId(null)
    }
    document.addEventListener("mouseup", mouseup)
    return () => document.removeEventListener("mouseup", mouseup)
  }, [setDraggedCompoId, connLines])

  if (draggingLine.current != null) {
    draggingLine.current.toPos = {
      x: mouse.elementX,
      y: mouse.elementY
    }
  }

  return (
    <div ref={ref as any} className="venue">
      {[...data].map(([key, compo]) => {
        let Elem: typeof Component | typeof SliderComponent | typeof OutputComponent
        if (compo.type === "middle") {
          Elem = Component
        }
        else if (compo.type === "slider") {
          Elem = SliderComponent
        }
        else if (compo.type === "output") {
          Elem = OutputComponent
        }
        else {
          assert(false, `Unknown component type ${compo.type}`)
        }

        return <Elem
          onChange={compo.type === "slider"
            ? x => {window.pywebview.api.setCurrValue(key, x)}
            : undefined
          }
          onDrag={(pos) => {
            setDraggedCompoId(key)
            offset.current[0] = -pos.x
            offset.current[1] = -pos.y
          }}
          key={key}
          compoId={key}
          args={compo.argLabels.map(x => ({label: x, color: compo.currValue}))}
          out={compo.outLabel == null ? null : {label: compo.outLabel, color: compo.currValue}}
          onDownSlot={slot => {
            if (slot.type === "in") {
              connLinesDispatch({
                type: "deleteSlotConnLines",
                slot: { compoId: key, slotLabel: slot.label }
              })
            }

            draggingLine.current = {
              fromSlot: {compoId: key, slotLabel: slot.label},
              toPos: { x: mouse.elementX, y: mouse.elementY }
            }
          }}
          onEnterSlot={(x) => (hoveredSlot.current = x)}
          onLeaveSlot={() => (hoveredSlot.current = null)}
          onMouseEnter={() => (hoveredCompoId.current = key)}
          onClose={() => {
            connLinesDispatch({
              type: "deleteCompoConnLines",
              compoId: key
            })
            dataDispatch({type: "delete", key})
          }}
          name={compo.name}
          style={{ left: compo.x, top: compo.y }}
        />
      })}
      <ConnLineLayer
        connLines={
          draggingLine.current != null
            ? [...connLines, draggingLine.current]
            : connLines
        }
      />
    </div>
  )
}


function getSlotPos({compoId, slotLabel}: {compoId: number, slotLabel: string}) {
  const venueElem = document.querySelector(".venue")
  assert(venueElem != null)
  const compoElem = document.querySelector(`*[data-compo-id='${compoId}']`)
  assert(compoElem != null)
  const dotElem = compoElem.querySelector(`*[data-slot='${slotLabel}'] > .dot`)
  assert(dotElem != null)

  const dotRect = dotElem.getBoundingClientRect()
  const venueRect = venueElem.getBoundingClientRect()
  return {
    x: dotRect.x + dotRect.width / 2 - venueRect.x,
    y: dotRect.y + dotRect.height / 2 - venueRect.y,
  }
}


function ConnLineLayer({
  connLines,
}: {
  connLines: (ConnLine | DraggingConnLine)[]
}) {
  const ref = React.useRef<HTMLCanvasElement | null>(null)
  const compoContext = useContext(CompoContext)

  if (ref.current != null) {
    const canvas = ref.current
    const ctx = ref.current.getContext("2d")!

    const rect = ref.current.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    ctx.lineWidth = 3

    for (const connLine of connLines) {
      const { x: x0, y: y0 } = getSlotPos(connLine.fromSlot)
      const { x: x1, y: y1 } =
        "toPos" in connLine ? connLine.toPos : getSlotPos(connLine.toSlot)

      if ("toPos" in connLine) {
        const fromCompo = compoContext.get(connLine.fromSlot.compoId)
        assert (fromCompo != null)
        ctx.strokeStyle = `rgb(${fromCompo.currValue.join(",")})`
      }
      else {
        const fromCompo = compoContext.get(connLine.fromSlot.compoId)
        const toCompo = compoContext.get(connLine.toSlot.compoId)
        assert (fromCompo != null && toCompo != null)
        const grad = ctx.createLinearGradient(x0, y0, x1, y1)

        grad.addColorStop(0, `rgb(${fromCompo.currValue.join(",")})`)
        grad.addColorStop(1, `rgb(${toCompo.currValue.join(",")})`)
        ctx.strokeStyle = grad
      }

      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.bezierCurveTo((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, x1, y1)
      ctx.stroke()
    }
  }

  return (
    <canvas
      ref={ref}
      style={{
        pointerEvents: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    />
  )
}
