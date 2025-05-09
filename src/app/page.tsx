import Image from "next/image";
import MainButton from "./components/MainUIs/MainButton";
import { formatInterval, formatTimestamp } from "./lib/utils";
import MainInputText from "./components/MainUIs/MainInputText";
import AddEntry from "./components/Sections/AddEntry";
import Entries from "./components/Sections/Entries";

export default async function Home() {
  return (
    <div className="w-full h-full flex flex-col px-12 md:px-20">
      <div className="w-full py-20">
        <div className="w-full flex flex-col">
          <AddEntry/>
        </div>
      </div>
      <Entries />
    </div>
  );
}
