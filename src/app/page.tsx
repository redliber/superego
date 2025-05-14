import Image from "next/image";
import MainButton from "./components/MainUIs/MainButton";
import { formatInterval, formatTimestamp } from "./lib/utils";
import MainInputText from "./components/MainUIs/MainInputText";
import Main from "./components/Sections/Main";
import Entries from "./components/Sections/Entries";

export default async function Home() {
  return (
    <div className="w-full h-screen flex flex-col px-6 md:px-10 align-middle justify-center">
      <div className="flex flex-col gap-1 align-middle text-center my-12 overflow-clip">
        <p className="font-black text-5xl  hover:text-amber-500 cursor-pointer hover:scale-105 transition-all duration-150 ease-in-out active:text-amber-300 active:scale-95 select-none">superego</p>
        <p className="text-xs">Pomodoro Session Tracking App with Journals</p>
      </div>
      <Main/>
      <div className="h-full flex flex-col gap-1 align-bottom justify-center text-right mb-10">
        <p className="text-xs text-gray-600">Copyright Benjamin Bernard Chenier 2025</p>
      </div>
    </div>
  );
}
