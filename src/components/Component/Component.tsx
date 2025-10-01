import React, { useRef, useState } from "react"
import assert from "assert"

import "./component.scss"


interface ComponentBaseProps
  extends Omit<React.HTMLProps<HTMLDivElement>, "onDrag" | "onChange"> {
  onDrag?: (offset: { x: number; y: number }) => any
  onClose?: () => any
  name: string
  compoId: number
}


interface SliderComponentProps extends ComponentBaseProps {
  onEnterSlot?: (slot: {label: string, type: "in" | "out"}) => any
  onLeaveSlot?: (slot: {label: string, type: "in" | "out"}) => any
  onDownSlot?: (slot: {label: string, type: "in" | "out"}) => any
  onUpSlot?: (slot: {label: string, type: "in" | "out"}) => any
  onChange?: (value: [number, number, number]) => any
  out: {label: string, color: [number, number, number]} | null
}


interface ComponentProps extends ComponentBaseProps {
  onEnterSlot?: (slot: {label: string, type: "in" | "out"}) => any
  onLeaveSlot?: (slot: {label: string, type: "in" | "out"}) => any
  onDownSlot?: (slot: {label: string, type: "in" | "out"}) => any
  onUpSlot?: (slot: {label: string, type: "in" | "out"}) => any
  out: {label: string, color: [number, number, number]} | null,
  args: {label: string, color: [number, number, number]}[],
}

interface OutputComponentProps extends ComponentBaseProps {
  onEnterSlot?: (slot: {label: string, type: "in" | "out"}) => any
  onLeaveSlot?: (slot: {label: string, type: "in" | "out"}) => any
  onDownSlot?: (slot: {label: string, type: "in" | "out"}) => any
  onUpSlot?: (slot: {label: string, type: "in" | "out"}) => any
  args: {label: string, color: [number, number, number]}[]
}

export function ComponentBase({
  compoId,
  onDrag = () => null,
  onClose = () => null,
  name,
  children,
  ...props
}: ComponentBaseProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  function onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    assert(ref.current != null)
    const rootRect = ref.current.getBoundingClientRect()
    onDrag({ x: event.clientX - rootRect.x, y: event.clientY - rootRect.y })
  }

  return (
    <div ref={ref} data-compo-id={compoId} className="component" {...props}>
      <div onMouseDown={onMouseDown} className="header">
        <h3 className="title">{name}</h3>
        <span onClick={onClose} className="closing-icon">
          ✕
        </span>
      </div>
      <div className="body">
        {children}
      </div>
    </div>
  )
}

export default function Component({
  compoId,
  onDrag = () => null,
  onEnterSlot = () => null,
  onLeaveSlot = () => null,
  onDownSlot = () => null,
  onUpSlot = () => null,
  onClose = () => null,
  out,
  args,
  name,
  ...props
}: ComponentProps) {
  return (
    <ComponentBase
      compoId={compoId}
      onDrag={onDrag}
      onClose={onClose}
      name={name}
      {...props}
    >
      {out != null && (
        <Slot
          label={out.label}
          color={out.color}
          side="right"
          onDownSlot={() => onDownSlot({ label: out.label, type: "out" })}
          onEnterSlot={() => onEnterSlot({ label: out.label, type: "out" })}
          onLeaveSlot={() => onLeaveSlot({ label: out.label, type: "out" })}
          onUpSlot={() => onUpSlot({ label: out.label, type: "out" })}
        />
      )}
      {args.map((x) => (
        <Slot
          key={x.label}
          label={x.label}
          color={x.color}
          side="left-no-shower"
          onDownSlot={() => onDownSlot({ label: x.label, type: "in" })}
          onEnterSlot={() => onEnterSlot({ label: x.label, type: "in" })}
          onLeaveSlot={() => onLeaveSlot({ label: x.label, type: "in" })}
          onUpSlot={() => onUpSlot({ label: x.label, type: "in" })}
        />
      ))}
    </ComponentBase>
  )
}


export function OutputComponent({
  compoId,
  onDrag = () => null,
  onEnterSlot = () => null,
  onLeaveSlot = () => null,
  onDownSlot = () => null,
  onUpSlot = () => null,
  onClose = () => null,
  args,
  name,
  ...props
}: OutputComponentProps) {
  assert(args.length === 1)
  return (
    <ComponentBase
      compoId={compoId}
      onDrag={onDrag}
      onClose={onClose}
      name={name}
      {...props}
    >
      <Slot
        label={args[0].label}
        color={args[0].color}
        side="left"
        onDownSlot={() => onDownSlot({ label: args[0].label, type: "in" })}
        onEnterSlot={() => onEnterSlot({ label: args[0].label, type: "in" })}
        onLeaveSlot={() => onLeaveSlot({ label: args[0].label, type: "in" })}
        onUpSlot={() => onUpSlot({ label: args[0].label, type: "in" })}
      />
    </ComponentBase>
  )
}


export function SliderComponent({
  compoId,
  onDrag = () => null,
  onEnterSlot = () => null,
  onLeaveSlot = () => null,
  onDownSlot = () => null,
  onUpSlot = () => null,
  onClose = () => null,
  onChange = () => null,
  out,
  name,
  ...props
}: SliderComponentProps) {
  return (
    <ComponentBase
      compoId={compoId}
      onDrag={onDrag}
      onClose={onClose}
      name={name}
      {...props}
    >
      {out != null && (
        <SliderSlot
          label={out.label}
          color={out.color}
          side="right"
          onDownSlot={() => onDownSlot({ label: out.label, type: "out" })}
          onEnterSlot={() => onEnterSlot({ label: out.label, type: "out" })}
          onLeaveSlot={() => onLeaveSlot({ label: out.label, type: "out" })}
          onUpSlot={() => onUpSlot({ label: out.label, type: "out" })}
          onChange={onChange}
        />
      )}
    </ComponentBase>
  )
}


function SlotBase({
  label,
  color,
  side,
  children,
  onEnterSlot = () => null,
  onLeaveSlot = () => null,
  onDownSlot = () => null,
  onUpSlot = () => null,
}: {
  label: string
  color: [number, number, number] | null
  side: "left" | "right"
  children: React.ReactNode
  onEnterSlot?: (slot: {label: string}) => any
  onLeaveSlot?: (slot: {label: string}) => any
  onDownSlot?: (slot: {label: string}) => any
  onUpSlot?: (slot: {label: string}) => any
}) {
  return (
    <span data-slot={label} className="slot">
      {side === "right" && children}
      {side === "right" && <span className="label">{label}</span>}
      <span
        className="dot"
        onMouseEnter={() => onEnterSlot({ label })}
        onMouseLeave={() => onLeaveSlot({ label })}
        onMouseDown={() => onDownSlot({ label })}
        onMouseUp={() => onUpSlot({ label })}
        style={{
          background:
            color != null ? `rgb(${color.join(",")})` : undefined,
        }}
      />
      {side === "left" && <span className="label">{label}</span>}
      {side === "left" && children}
    </span>
  )
}


function Slot({
  label,
  color,
  side,
  onEnterSlot = () => null,
  onLeaveSlot = () => null,
  onDownSlot = () => null,
  onUpSlot = () => null,
}: {
  label: string
  color: [number, number, number] | null
  side: "left" | "right" | "left-no-shower"
  onEnterSlot?: (slot: {label: string}) => any
  onLeaveSlot?: (slot: {label: string}) => any
  onDownSlot?: (slot: {label: string}) => any
  onUpSlot?: (slot: {label: string}) => any
}) {
  let showerColor = color
  if (side === "left-no-shower") {
    side = "left"
    showerColor = null
  }
  return (
    <SlotBase
      label={label}
      color={color}
      side={side}
      onEnterSlot={onEnterSlot}
      onLeaveSlot={onLeaveSlot}
      onDownSlot={onDownSlot}
      onUpSlot={onUpSlot}
    >
      <span
        className="color-shower"
        style={{
          background: showerColor != null ? `rgb(${showerColor.join(",")})` : undefined,
        }}
      />
    </SlotBase>
  )
}


function SliderSlot({
  label,
  color,
  side,
  onEnterSlot = () => null,
  onLeaveSlot = () => null,
  onDownSlot = () => null,
  onUpSlot = () => null,
  onChange = () => null
}: {
  label: string
  color: [number, number, number],
  side: "left" | "right"
  onEnterSlot?: (slot: {label: string}) => any
  onLeaveSlot?: (slot: {label: string}) => any
  onDownSlot?: (slot: {label: string}) => any
  onUpSlot?: (slot: {label: string}) => any
  onChange?: (value: [number, number, number]) => any
}) {
  const [value, setValue] = useState(0)
  const rgb = `rgb(${value},${value},${value})`

  return (
    <SlotBase label={label} color={color} side={side}
      onEnterSlot={onEnterSlot}
      onLeaveSlot={onLeaveSlot}
      onDownSlot={onDownSlot}
      onUpSlot={onUpSlot}
    >
      <input
        type="range"
        onChange={e => {
          const newValue = parseInt(e.target.value)
          setValue(newValue)
          onChange([newValue, newValue, newValue])
        }}
        className="color-slider"
        min={0}
        max={255}
        style={{
          background: `linear-gradient(
            90deg,
            ${rgb} 0%,
            ${rgb} ${value/2.55}%,
            rgba(0,0,0,0) ${value/2.55}%,
            rgba(0,0,0,0) 100%
          ), rgb(0,0,0)`
        }}
      />
    </SlotBase>
  )
}
