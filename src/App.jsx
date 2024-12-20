import { useState } from 'react'

import Board from './components/Board'

import * as PIXI from 'pixi.js'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Board />
    </div>
  )
}

export default App;


