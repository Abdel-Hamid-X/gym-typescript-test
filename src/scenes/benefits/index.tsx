import {
    SelectedPage,
} from "@/shared/types"
import type {
    BenefitType
} from "@/shared/types"
import {
    AcademicCapIcon,
    HomeModernIcon,
    UserGroupIcon
} from "@heroicons/react/24/solid"
import {
    motion,
    stagger
} from "framer-motion"
import ActionButton from '@/shared/ActionButton';
import BenefitsPage2 from "@/assets/BenefitsPage2.png"
import HText from "@/shared/HText"
import Benefit from "./Benefit"

const Container = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.2
        }
    }
}

const benefits: Array<BenefitType> = [
    {
        icon: <HomeModernIcon className="h-6 w-6" />,
        title: "State of the Art Facilities",
        description: "Industrial-grade racks, platforms, machines, and tools built for serious strength work."
    },
    {
        icon: <UserGroupIcon className="h-6 w-6" />,
        title: "100's of Diverse Classes",
        description: "Strength, hypertrophy, HIIT, boxing, and conditioning sessions for every training level."
    },
    {
        icon: <AcademicCapIcon className="h-6 w-6" />,
        title: "Expert and Pro Trainers",
        description: "Performance coaches who push technique, discipline, and measurable progression."
    },
]

type Props = {
    setselectedPage: (value: SelectedPage) => void
}

const Benefits = ({ setselectedPage }: Props) => {
    return (
        <section
            id="benefits"
            className="
                mx-auto 
                min-h-full 
                w-5/6 
                py-20">
            <motion.div
                onViewportEnter={
                    () => setselectedPage(
                        SelectedPage.Benefits
                    )
                }>
                {/* HEADER */}
                <motion.div
                    className="
                    md:w-3/5
                    md: my-5"
                    initial="hidden"
                    viewport={{
                        once: true,
                        amount: 0.5
                    }}
                    whileInView="visible"
                    transition={{
                        duration: 0.5
                    }}
                    variants={{
                        hidden: {
                            opacity: 0,
                            x: -50
                        },
                        visible: {
                            opacity: 1,
                            x: 0
                        },
                    }}>
                    <HText>MORE THAN JUST A GYM.</HText>
                    <p
                        className="
                                my-5 
                                text-sm">
                        Built for people who train with purpose. Heavy equipment, ruthless
                        conditioning, expert coaching, and classes that turn effort into
                        measurable strength.
                    </p>
                </motion.div>
                {/* BENEFITS */}
                <motion.div
                    className="
                    md:flex
                    gap-8
                    mt-5 
                    md:justify-between 
                    md:items-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{
                        once: true,
                        amount: 0.5
                    }}
                    variants={Container}>
                    {benefits.map((benefit: BenefitType) => (
                        <Benefit
                            key={benefit.title}
                            icon={benefit.icon}
                            title={benefit.title}
                            description={benefit.description}
                            setselectedPage={setselectedPage} />
                    ))}
                </motion.div>
                {/* GRAPHICS AND DESCRIPTIONS */}
                <div className="mt-16 items-center justify-between gap-20 md:mt-28 md:flex">
                    {/* GRAPHIC */}
                    <img
                        className="
                            mx-auto
                            w-full
                            max-w-[420px]
                            md:max-w-[480px]"
                        src={BenefitsPage2}
                        alt="benifits-page-graphic" />
                    {/* DESCRIPTIONS */}
                    <div>
                        {/* TITLE */}
                        <div
                            className="relative">
                            <div
                                className="
                                before:absolute
                                before:-top-20
                                before:-left-20
                                before:z-[-1]
                                before:content-abstractwaves">
                                <motion.div
                                    initial="hidden"
                                    viewport={{
                                        once: true,
                                        amount: 0.5
                                    }}
                                    whileInView="visible"
                                    transition={{
                                        duration: 0.5
                                    }}
                                    variants={{
                                        hidden: {
                                            opacity: 0,
                                            x: 50
                                        },
                                        visible: {
                                            opacity: 1,
                                            x: 0
                                        },
                                    }}>
                                    <HText>
                                        BUILT FOR PEOPLE CHASING {" "}
                                        <span
                                            className="
                                            text-primary-500">
                                            POWER
                                        </span>
                                    </HText>
                                </motion.div>
                            </div>
                        </div>
                        {/* DESCRIPTIONS */}
                        <motion.div
                            initial="hidden"
                            viewport={{
                                once: true,
                                amount: 0.5
                            }}
                            whileInView="visible"
                            transition={{
                                delay: 0.2,
                                duration: 0.5
                            }}
                            variants={{
                                hidden: {
                                    opacity: 0,
                                    x: 50
                                },
                                visible: {
                                    opacity: 1,
                                    x: 0
                                },
                            }}>
                            <p
                                className="my-5">
                                Train inside an industrial performance space built for serious
                                lifting, high-output circuits, and no-excuse consistency. Every
                                session is structured to sharpen strength, stamina, and control.
                            </p>
                            <p
                                className="mb-5">
                                From barbell work to conditioning blocks, the goal is simple:
                                move heavier, recover faster, and leave stronger than you came in.
                            </p>
                        </motion.div>
                        {/* BUTTON */}
                        <div
                            className="
                            relative
                            mt-16">
                            <div
                                className="
                                before:absolute
                                before:-bottom-20
                                before:right-40
                                before:z-[-1]
                                before:content-sparkles">
                                <ActionButton
                                    setselectedPage={setselectedPage}>
                                    Join Now
                                </ActionButton>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

export default Benefits
