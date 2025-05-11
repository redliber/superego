import React, { useEffect, useState } from "react"

export default function MainTimeSlider({onChangeCallback, useDuration, useRest}: {onChangeCallback: (value: number) => void, useDuration: number, useRest: boolean}) {
  const [generalColor, setGeneralColor] = useState('var(--color-green-400)')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value)
    onChangeCallback(newValue)
  }

  const percentage = ((useDuration - 5) / (60 - 5)) * 100;

  useEffect(() => {
    if (useRest) {
      setGeneralColor('var(--color-green-400)')
    } else {
      setGeneralColor('var(--color-amber-400)')
    }
  }, [useRest])

  return (
    <div className="flex flex-col">
      <div className="flex flex-row p-2 mb-12 justify-between">
        <p className="text-8xl font-black leading-20 overflow-hidden text-ellipsis"><span style={{color: generalColor}}>{ useRest ? 'Rest for ' : 'Work for ' }</span><br></br>{ useDuration } Minutes </p>
      </div>
      <input
        type="range"
        min={5}
        max={60}
        step={1}
        value={useDuration}
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
            ${generalColor} ${percentage}%,
            var(--color-zinc-100) ${percentage}%
          ); /* Dynamic track fill */
          border-radius: 4px;
        }
        input[type='range']::-moz-range-track {
          width: 100%;
          height: 4px;
          background: linear-gradient(
            to right,
            ${generalColor} ${percentage}%,
            var(--color-zinc-100) ${percentage}%
          );
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}
