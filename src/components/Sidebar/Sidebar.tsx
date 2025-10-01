import React from "react"

import "./sidebar.scss"


type Entry = {
  name: string,
  argLabels: string[],
  outLabel: string | null,
  type: "middle" | "slider" | "output"
}

interface SidebarProps {
  entries: Entry[]
  onClickEntries: (entry: Entry) => any
}

export default function Sidebar({entries, onClickEntries}: SidebarProps) {
  return (
    <div className="sidebar">
      {entries.map((x) => (
        <span key={x.name} onClick={() => onClickEntries(x)} className="entry">
          {x.name}
        </span>
      ))}
    </div>
  )
}
