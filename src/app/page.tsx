import Image from "next/image";
import { getAllEntries, getSessionByID } from "./lib/db";
import MainButton from "./components/MainUIs/MainButton";
import { formatInterval, formatTimestamp } from "./lib/utils";
import MainInputText from "./components/MainUIs/MainInputText";
import AddEntry from "./components/Modals/AddEntry";
import Entries from "./components/Modals/Entries";

export default async function Home() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full px-10 py-20">
        <div className="w-full flex flex-col">
          <AddEntry/>
        </div>
      </div>
      <Entries/>
    </div>
  );
}
