import { ChangeEvent, ReactEventHandler, ReactNode } from "react"

export default function MainInputText({label, onChangeHandler}: {label: string, onChangeHandler: (e: ChangeEvent<HTMLInputElement>) => void}) {
  return (
    <input className="text-2xl rounded-xs border-[1px] border-zinc-100 p-3 my-2 w-full" placeholder={ label } onChange={onChangeHandler}></input>
  )
}
