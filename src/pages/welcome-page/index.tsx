import { Button } from '@nextui-org/react'
import triangleBg from '../../assets/triangles.png'

export const WelcomePage = () => {
  return (
    <>
      <div className="firstPage h-screen w-1/2 flex items-center justify-center bg-[#16162c]">
        <div className="flex gap-6 flex-col z-10">
          <h1 className="text-5xl text-left">Daniil Andreev</h1>
          <span className="text-xl ml-1 italic text-left">Frontend Developer from Saint-Peterburg</span>
          <div className="flex items-start">
            <Button size="lg" radius="sm">
              About me
            </Button>
          </div>
        </div>
      </div>

      <div className="firstPage_bg -z-10 pointer-events-none">
        <img src={triangleBg} alt="" className="h-screen w-screen absolute top-0 left-0 right-0 bottom-0" />
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60"></div>
      </div>
    </>
  )
}
