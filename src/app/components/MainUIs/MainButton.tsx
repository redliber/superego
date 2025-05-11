import { ReactNode } from "react";

export default function MainButton({children, onClickHandler, buttonType="default", ...rest}: {children: ReactNode, onClickHandler: () => void, [key: string]: any, buttonType?: string}) {
  const composition = buttonType == "default" ? ' bg-zinc-200 outline-1 outline-zinc-200 text-black ' : buttonType == "bordered" ? ' outline-1 outline-zinc-200 text-white ' : ' bg-amber-400 text-black border-[1px] '
  return (
    <div className={`
      ${ composition }
      text-sm
      my-2 py-2 px-3 max-w-52 cursor-pointer rounded-xs
      text-center font-black
       hover:scale-105 active:bg-zinc-100 active:scale-95
      transition duration-200 ease-in-out
      `} onClick={onClickHandler} {...rest}>
      {children}
    </div>
  )
}
