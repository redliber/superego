import Image from "next/image";
import { client } from "./lib/gel";

export default async function Home() {
  const data = await client.query("select Entry {*}")
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full px-10 py-20">
        <p className="text-9xl font-black">superego</p>
      </div>
      <div className="w-full px-10 py-20 text-2xl font-bold">
        {
          data.map((entry:any) => (
            <p key={entry.id}>{JSON.stringify(entry.entryTime)}</p>
          ))
        }
      </div>
    </div>
  );
}
