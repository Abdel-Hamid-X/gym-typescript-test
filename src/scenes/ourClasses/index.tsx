import { useRef, useCallback } from "react"
import { SelectedPage } from "@/shared/types"
import { ClassType } from "@/shared/types"
import Weights from '@/assets/Weights.jpg'
import image2 from '@/assets/image2.png'
import image3 from '@/assets/image3.png'
import image4 from '@/assets/image4.png'
import image5 from '@/assets/image5.png'
import image6 from '@/assets/image6.png'
import { motion } from "framer-motion"
import HText from "@/shared/HText"
import Class from "./Class"

const classes: Array<ClassType> = [
    {
        name: "Weight Training Classes",
        description:
            "Heavy compound lifts, progressive overload, and technical coaching for bigger numbers and stronger bodies.",
        image: Weights,
    },
    {
        name: "Yoga Classes",
        description:
            "Mobility and recovery sessions built to keep strong athletes moving, bracing, and lifting well.",
        image: image2,
    },
    {
        name: "Ab Core Classes",
        description:
            "Core strength, trunk stability, and loaded carries for better power transfer under pressure.",
        image: image3,
    },
    {
        name: "Adventure Classes",
        description:
            "High-output training blocks that combine endurance, agility, and grit.",
        image: image4,
    },
    {
        name: "Fitness Classes",
        description:
            "Full-body conditioning sessions for lean muscle, stamina, and relentless pace.",
        image: image5,
    },
    {
        name: "Training Classes",
        description:
            "Coach-led performance sessions focused on strength, speed, and repeatable discipline.",
        image: image6,
    },
]

const SCROLL_STEP = 380

type Props = {
    setselectedPage: (value: SelectedPage) => void;
}

const OurClasses = ({ setselectedPage }: Props) => {
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
        // Only intercept vertical wheel when the slider is in view
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
            sliderRef.current.scrollLeft += SCROLL_STEP
        } else if (e.key === "ArrowLeft") {
            e.preventDefault()
            sliderRef.current.scrollLeft -= SCROLL_STEP
        }
    }, [])

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
                        <HText>OUR CLASSES</HText>
                        <p className="py-5">
                            Pick your lane: strength, conditioning, combat-inspired circuits,
                            mobility, and performance training built for people who want results
                            they can measure.
                        </p>
                    </div>
                </motion.div>

                {/* SLIDER */}
                <div className="mt-10 relative">
                    {/* fade edges */}
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10
                        bg-gradient-to-r from-primary-100 to-transparent" />
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10
                        bg-gradient-to-l from-primary-100 to-transparent" />

                    <ul
                        ref={sliderRef}
                        tabIndex={0}
                        role="list"
                        aria-label="Gym classes – use arrow keys or drag to scroll"
                        className="flex gap-6 overflow-x-scroll px-[8.33%] pb-4
                            cursor-grab focus:outline-none
                            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        style={{ scrollBehavior: "smooth" }}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={stopDrag}
                        onPointerCancel={stopDrag}
                        onWheel={onWheel}
                        onKeyDown={onKeyDown}
                    >
                        {classes.map((item: ClassType, index) => (
                            <li
                                key={`${item.name}-${index}`}
                                /* prevent drag from triggering link/image drag */
                                onDragStart={(e) => e.preventDefault()}
                                className="shrink-0 w-[320px] sm:w-[360px] md:w-[420px]"
                            >
                                <Class
                                    name={item.name}
                                    description={item.description}
                                    image={item.image}
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
