'use client'
import { useState } from "react";
import MainButton from "../MainUIs/MainButton";
import MainTimeSlider from "../MainUIs/MainTimeSlider";

export default function AddEntry() {
  const [useModal, setModal] = useState(false)
  return (
    <>
      {
        useModal && (
          <div className="w-[100vw] h-[100vh] bg-zinc-700/50 top-0 left-0 fixed">
            Testing
          </div>
        )
      }
      <div onClick={() => setModal(true)}>
        <MainButton>Start Focus</MainButton>
      </div>
        <MainTimeSlider/>
    </>
  )
}
