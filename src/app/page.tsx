import Image from "next/image";
import MainButton from "./components/MainUIs/MainButton";
import { formatInterval, formatTimestamp } from "./lib/utils";
import MainInputText from "./components/MainUIs/MainInputText";
import Main from "./components/Sections/Main";
import Entries from "./components/Sections/Entries";

export default async function Home() {
  return (
    <div className="w-full h-screen flex flex-col px-6 md:px-10 align-middle justify-center">
      <Main/>
    </div>
  );
}
