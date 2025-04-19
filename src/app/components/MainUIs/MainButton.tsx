import { ReactNode } from "react";

export default function MainButton({children}: {children: ReactNode}) {
  return (
    <div className="cursor-pointer rounded-xs border-[1px] border-zinc-100 p-3 hover:bg-zinc-500 hover:scale-105 active:bg-zinc-100 active:scale-95 transition duration-100 ease-in-out">
      {children}
    </div>
  )
}
