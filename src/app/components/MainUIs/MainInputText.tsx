import { ReactNode } from "react"

export default function MainInputText({label}: {label: string}) {
  return (
    <input className="rounded-xs border-[1px] border-zinc-100 p-3" placeholder={ label }></input>
  )
}
