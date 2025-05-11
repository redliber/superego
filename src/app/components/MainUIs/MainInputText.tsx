'use client'
import { ChangeEvent, ChangeEventHandler, ReactEventHandler, ReactNode, useEffect, useRef, useState } from "react"

export default function MainInputText({label='Insert Text Here', onChangeHandler, type='input'}: {label?: string, onChangeHandler?: (e:any) => void, type?: string}) {
  const textAreaRef = useRef(null)
  const [useTextArea, setTextArea] = useState(label)

  useEffect(() => {


  })

  if (type == 'input') {
    return (
      <input
        className="text-2xl placeholder:text-lg hover:font-black transition-all duration-150 ease-in-out rounded-xs border-[1px] border-zinc-100 p-3 my-2 w-full"
        placeholder={ label }
        onChange={onChangeHandler}></input>
    )
  } else if (type == 'textarea') {
    return (
      <textarea
        ref={textAreaRef}
        className="
          placeholder:text-xl text-xl focus:placeholder:text-xl
          rounded-xs border-[1px] border-zinc-100
          p-3 my-2 w-full resize-none
          transition-all placeholder:transition-all
          duration-300"
        rows={5} cols={33}
        placeholder={label}
        onChange={onChangeHandler}
        ></textarea>
    )
  }
}
