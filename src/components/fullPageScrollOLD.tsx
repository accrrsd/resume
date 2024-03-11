/* eslint-disable @typescript-eslint/ban-types */
import { forwardRef, ReactNode, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'

type TFullPageProps = {
  initialSlide?: number
  returnActiveSlide?: Function
  returnScrollPos?: Function
  returnAllSlides?: Function
  handleArrowKey?: {
    upKey: string | string[]
    downKey: string | string[]
  } | null
  scrollErrorCatch?: Function
  wrapperClassName?: string
  slideClassName?: string
  children: ReactNode[]
}

export const FullPageScroll = forwardRef<HTMLDivElement, TFullPageProps>(
  (
    {
      initialSlide = 0,
      returnActiveSlide,
      returnAllSlides,
      returnScrollPos,
      handleArrowKey = { upKey: ['ArrowUp', 'ArrowLeft'], downKey: ['ArrowDown', 'ArrowRight'] },
      scrollErrorCatch,
      wrapperClassName,
      slideClassName,
      children,
    },
    ref
  ) => {
    const slides = useMemo(() => [] as HTMLDivElement[], [])
    const innerRef = useRef<HTMLDivElement>(null)
    const wrapperRef = (ref as RefObject<HTMLDivElement>) || innerRef

    const [active, setActive] = useState<number>(initialSlide || 0)
    const [changing, setChanging] = useState<boolean>(false)
    const [wheel, setWheel] = useState<WheelEvent | boolean>(false)

    console.log('rerer')

    //#region Utils
    useEffect(() => {
      returnAllSlides && returnAllSlides(slides)
    }, [slides, returnAllSlides])

    const downSlide = useCallback(() => setActive((prev: number) => (prev < slides.length - 1 ? prev + 1 : slides.length - 1)), [slides.length])
    const upSlide = () => setActive((prev: number) => (prev > 0 ? prev - 1 : 0))
    //#endregion

    //#region KeyHandle
    const keyHandler = useCallback(
      (e: KeyboardEvent) => {
        if (handleArrowKey) {
          const { upKey: uKey, downKey: dKey } = handleArrowKey
          if ((uKey.constructor === Array && uKey.includes(e.key)) || uKey === e.key) {
            e.preventDefault()
            upSlide()
          } else if ((dKey.constructor === Array && dKey.includes(e.key)) || dKey === e.key) {
            e.preventDefault()
            downSlide()
          }
        }
      },
      [downSlide, handleArrowKey]
    )
    useEffect(() => {
      if (handleArrowKey) {
        if (!changing) {
          document.addEventListener('keydown', keyHandler)
        } else {
          document.removeEventListener('keydown', keyHandler)
        }
        return () => {
          document.removeEventListener('keydown', keyHandler)
        }
      }
    }, [keyHandler, changing, handleArrowKey])
    //#endregion

    //#region Wheel Function
    useEffect(() => {
      if (wheel !== false && wheel instanceof WheelEvent) {
        const wheelHandler = (e: WheelEvent) => {
          if (e.deltaY > 0) {
            downSlide()
          } else {
            upSlide()
          }
        }
        wheelHandler(wheel)
      }
    }, [wheel, downSlide])

    useEffect(() => {
      if (wrapperRef.current && slides[active]) {
        const smoothScroll = (scrolled: HTMLElement, to: number) => {
          scrolled.scrollTo({
            top: to,
            behavior: 'smooth',
          })
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject('fullPageScroll error'), 1500)

            const successHandler = () => {
              if (wrapperRef?.current?.scrollTop === to) {
                wrapperRef.current.removeEventListener('scroll', successHandler)
                clearTimeout(timeout)
                resolve(null)
              }
            }

            if (wrapperRef?.current?.scrollTop === to) {
              clearTimeout(timeout)
              resolve(null)
            } else {
              wrapperRef.current?.addEventListener('scroll', successHandler)
            }
          })
        }

        const scrollHandler = (offset = slides[active].offsetTop) => {
          setChanging(true)
          smoothScroll(wrapperRef.current!, offset)
            .then(() => {
              returnScrollPos && returnScrollPos(wrapperRef.current!.scrollTop)
              returnActiveSlide && returnActiveSlide([slides[active], active])
              setChanging(false)
            })
            .catch((e) => (scrollErrorCatch && scrollErrorCatch(e)) || console.log(e))
        }

        scrollHandler()
      }
    }, [active, wrapperRef, slides, setChanging, returnScrollPos, returnActiveSlide, scrollErrorCatch])
    //#endregion

    //#region Wheel Utils
    useEffect(() => {
      const disableWheel = (e: WheelEvent) => e.preventDefault()
      const wrapper = wrapperRef.current!
      wrapper.addEventListener('wheel', disableWheel, { passive: false })
      return () => wrapper.removeEventListener('wheel', disableWheel)
    }, [wrapperRef])

    useEffect(() => {
      const page = wrapperRef.current
      if (page) {
        if (!changing) {
          page.addEventListener('wheel', setWheel)
        } else {
          page.removeEventListener('wheel', setWheel)
        }
        return () => page.removeEventListener('wheel', setWheel)
      }
    }, [wrapperRef, changing, setWheel])
    //#endregion

    return (
      <div className={wrapperClassName} ref={ref}>
        {useMemo(
          () =>
            children?.map((child, index) => {
              return (
                <div className={slideClassName} ref={(ref) => ref && (slides[index] = ref)} key={uuid()}>
                  {child}
                </div>
              )
            }),
          [children, slideClassName, slides]
        )}
      </div>
    )
  }
)
