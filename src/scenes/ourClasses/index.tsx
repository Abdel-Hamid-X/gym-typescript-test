import { useRef, useCallback } from "react"
import { SelectedPage } from "@/shared/types"
import { motion } from "framer-motion"
import HText from "@/shared/HText"
import Class from "./Class"
import { useAuth } from "@/auth/AuthContext"
import { useLanguage } from "@/shared/LanguageContext"

const SCROLL_STEP = 380

type Props = {
    setselectedPage: (value: SelectedPage) => void;
}

const OurClasses = ({ setselectedPage }: Props) => {
    const { gymClasses, coaches } = useAuth()
    const { t, language } = useLanguage()
    const isRtl = language === "ar";
    const sliderRef = useRef<HTMLUListElement>(null)

    // --- mouse drag ---
    const isDragging = useRef(false)
    const dragStartX = useRef(0)
    const scrollStartX = useRef(0)

    const onPointerDown = useCallback((e: React.PointerEvent<HTMLUListElement>) => {
        if (!sliderRef.current) return
        isDragging.current = true
        dragStartX.current = e.clientX
        scrollStartX.current = sliderRef.current.scrollLeft
        sliderRef.current.setPointerCapture(e.pointerId)
        sliderRef.current.style.cursor = "grabbing"
        sliderRef.current.style.userSelect = "none"
    }, [])

    const onPointerMove = useCallback((e: React.PointerEvent<HTMLUListElement>) => {
        if (!isDragging.current || !sliderRef.current) return
        const delta = e.clientX - dragStartX.current
        sliderRef.current.scrollLeft = scrollStartX.current - delta
    }, [])

    const stopDrag = useCallback(() => {
        if (!sliderRef.current) return
        isDragging.current = false
        sliderRef.current.style.cursor = "grab"
        sliderRef.current.style.userSelect = ""
    }, [])

    // --- scroll wheel → horizontal ---
    const onWheel = useCallback((e: React.WheelEvent<HTMLUListElement>) => {
        if (!sliderRef.current) return
        if (e.deltaY !== 0) {
            e.preventDefault()
            sliderRef.current.scrollLeft += e.deltaY
        }
    }, [])

    // --- keyboard arrow keys ---
    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
        if (!sliderRef.current) return
        if (e.key === "ArrowRight") {
            e.preventDefault()
            sliderRef.current.scrollTo({
                left: sliderRef.current.scrollLeft + (isRtl ? -SCROLL_STEP : SCROLL_STEP),
                behavior: "smooth"
            })
        } else if (e.key === "ArrowLeft") {
            e.preventDefault()
            sliderRef.current.scrollTo({
                left: sliderRef.current.scrollLeft - (isRtl ? -SCROLL_STEP : SCROLL_STEP),
                behavior: "smooth"
            })
        }
    }, [isRtl])

    return (
        <section
            className="w-full bg-primary-100 py-40"
            id="ourclasses">
            <motion.div
                onViewportEnter={() => setselectedPage(SelectedPage.OurClasses)}>
                {/* HEADER */}
                <motion.div
                    className="mx-auto w-5/6"
                    initial="hidden"
                    viewport={{ once: true, amount: 0.5 }}
                    whileInView="visible"
                    transition={{ duration: 0.5 }}
                    variants={{
                        hidden: { opacity: 0, x: -50 },
                        visible: { opacity: 1, x: 0 },
                    }}>
                    <div className="md:h-3/5">
                        <HText>{t("classes_title")}</HText>
                        <p className="py-5">
                            {t("classes_desc")}
                        </p>
                    </div>
                </motion.div>

                {/* SLIDER */}
                <div className="mt-10 relative">
                    {/* fade edges */}
                    <div className={`pointer-events-none absolute top-0 h-full w-16 z-10
                        ${isRtl 
                          ? "right-0 bg-gradient-to-l from-primary-100 to-transparent" 
                          : "left-0 bg-gradient-to-r from-primary-100 to-transparent"}`} />
                    <div className={`pointer-events-none absolute top-0 h-full w-16 z-10
                        ${isRtl 
                          ? "left-0 bg-gradient-to-r from-primary-100 to-transparent" 
                          : "right-0 bg-gradient-to-l from-primary-100 to-transparent"}`} />

                    <ul
                        ref={sliderRef}
                        tabIndex={0}
                        role="list"
                        aria-label="Gym classes – use arrow keys or drag to scroll"
                        className="flex gap-6 overflow-x-scroll px-[8.33%] pb-4
                            cursor-grab focus:outline-none
                            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={stopDrag}
                        onPointerCancel={stopDrag}
                        onWheel={onWheel}
                        onKeyDown={onKeyDown}
                    >
                        {gymClasses.map((item, index) => (
                            <li
                                key={`${item.id}-${index}`}
                                onDragStart={(e) => e.preventDefault()}
                                className="shrink-0 w-[320px] sm:w-[360px] md:w-[420px]"
                            >
                                <Class
                                    name={item.name}
                                    description={item.description}
                                    image={item.image}
                                    coachName={coaches.find((coach) => coach.id === item.coachId)?.name}
                                    schedule={item.schedule}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>
        </section>
    )
}

export default OurClasses
