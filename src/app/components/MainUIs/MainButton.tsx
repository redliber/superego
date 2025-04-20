import { ReactNode } from "react";

export default function MainButton({children, onClickHandler, ...rest}: {children: ReactNode, onClickHandler: () => void, [key: string]: any}) {
  return (
    <div className="my-2 font-black max-w-52 cursor-pointer rounded-xs p-4 text-center bg-zinc-100 hover:bg-amber-400 text-black hover:scale-x-105 hover:scale-y-110 active:bg-zinc-100 active:scale-95 transition duration-100 ease-in-out" onClick={onClickHandler} {...rest}>
      {children}
    </div>
  )
}
