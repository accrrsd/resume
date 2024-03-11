import './App.css'
import { WelcomePage } from './pages/welcome-page'

function App() {
  return (
    <>
      <WelcomePage />
      <div className="secondPage h-screen w-screen max-w-full bg-[#16162c]"></div>
      <div className="secondPage h-screen w-screen max-w-full bg-[#6b0909]"></div>
    </>
  )
}

export default App
