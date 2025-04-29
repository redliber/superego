import { ReactNode } from "react";

export default function MainButton({children, onClickHandler, buttonType="default", ...rest}: {children: ReactNode, onClickHandler: () => void, [key: string]: any, buttonType?: string}) {
  const composition = buttonType == "default" ? ' bg-zinc-900 dark:bg-neutral-100 text-black ' : buttonType == "bordered" ? ' text-white border-2 hover:text-black ' : ' bg-amber-400 text-black '
  return (
    <div className={`
      ${ composition }
      my-2 p-4 max-w-52 cursor-pointer rounded-xs
      text-center font-black
      hover:bg-amber-400 hover:scale-x-105 hover:scale-y-110 active:bg-zinc-100 active:scale-95
      transition duration-100 ease-in-out
      `} onClick={onClickHandler} {...rest}>
      {children}
    </div>
  )
}
