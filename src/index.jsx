import React from "react"
import Main from "./components/Main/Main"
import { createRoot } from "react-dom/client"

import "./index.scss"

const App = function() {
  return (<Main />)
}

// pywebview shim
// window.pywebview = {
//   api: {
//     createCompo: () => null,
//     deleteCompo: () => null,
//     connectCompo: () => null,
//     disconnectCompo: () => null,
//     disconnectCompo: () => null,
//     setCurrValue: () => null,
//   }
// }

const element = document.getElementById('app')
const root = createRoot(element)
root.render(<App />)
