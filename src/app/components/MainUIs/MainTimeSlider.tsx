import React, { useState } from "react"

export default function MainTimeSlider() {
  const [useValue, setValue] = useState(25)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value)
    setValue(newValue)
  }
  return (
    <div className="flex flex-col">
      <p>{ useValue } minutes</p>
      <input
        type="range"
        min={5}
        max={60}
        step={5}
        value={useValue}
        onChange={handleChange}
        className="h-6 bg-transparent appearance-none"
        />
    </div>
  )
}
