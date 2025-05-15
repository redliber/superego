import React, { useEffect, useState } from "react"
import { number } from "../../../../dbschema/edgeql-js/modules/std"

export default function MainTimeSlider({onChangeCallback, useValue, useColor='var(--color-green-400)', customMax=60, customMin=5}: {onChangeCallback: (value: number) => void, useValue: number, useColor: string, customMax?:number, customMin?:number}) {

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value)
    onChangeCallback(newValue)
  }

  const percentage = ((useValue - customMin) / (customMax - customMin)) * 100;

  return (
    <div className="flex flex-col">
      <input
        type="range"
        min={customMin}
        max={customMax}
        step={1}
        value={useValue}
        onChange={handleChange}
        className="rounded-sm bg-transparent border-2 p-2 appearance-none"
        style={{
          height: `100px`
        }}
        />
      {/* Custom thumb and track styling */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-runnable-track {
          height: 100%;
        }
        input[type="range"]::-moz-range-track {
          height: 100%;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 100%;
          width: 25px;
          background-color: var(--color-zinc-800);
          cursor: pointer;
          transition: .2s ease-in-out;
        }
        input[type="range"]::-moz-range-thumb {
          height: 100%;
          width: 25px;
          background-color: var(--color-zinc-800);
          cursor: pointer;
          transition: .2s ease-in-out;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background-color: var(--color-amber-600);
        }
        input[type='range']::-webkit-slider-runnable-track {
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to right,
            ${useColor} ${percentage}%,
            var(--color-zinc-100) ${percentage}%
          ); /* Dynamic track fill */
          border-radius: 4px;
        }
        input[type='range']::-moz-range-track {
          width: 100%;
          height: 4px;
          background: linear-gradient(
            to right,
            ${useColor} ${percentage}%,
            var(--color-zinc-100) ${percentage}%
          );
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}
