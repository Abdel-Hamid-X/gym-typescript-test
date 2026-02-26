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
import BenefitsPageGraphic from "@/assets/BenefitsPageGraphic.png"
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
        description: "Our facilities are equipped with the latest fitness technology to help you achieve your goals."
    },
    {
        icon: <UserGroupIcon className="h-6 w-6" />,
        title: "100's of Diverse Classes",
        description: "We offer a wide variety of classes to suit all fitness levels and interests."
    },
    {
        icon: <AcademicCapIcon className="h-6 w-6" />,
        title: "Expert and Pro Trainers",
        description: "Our trainers are certified professionals who are passionate about helping you succeed."
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
                        We provide world class fitness equipment, trainers and classes to
                        get you to your ultimate fitness goals with ease. We provide true
                        care into each and every member.
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
                            mx-auto"
                        src={BenefitsPageGraphic}
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
                                        MILLIONS OF HAPPY MEMBERS GETTING {" "}
                                        <span
                                            className="
                                            text-primary-500">
                                            FIT
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
                                delay:0.2, 
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
                                Nascetur aenean massa auctor tincidunt. Iaculis potenti amet
                                egestas ultrices consectetur adipiscing ultricies enim. Pulvinar
                                fames vitae vitae quis. Quis amet vulputate tincidunt at in
                                nulla nec. Consequat sed facilisis dui sit egestas ultrices
                                tellus. Ullamcorper arcu id pretium sapien proin integer nisl.
                                Felis orci diam odio.
                            </p>
                            <p
                                className="mb-5">
                                Fringilla a sed at suspendisse ut enim volutpat. Rhoncus vel est
                                tellus quam porttitor. Mauris velit euismod elementum arcu neque
                                facilisi. Amet semper tortor facilisis metus nibh. Rhoncus sit
                                enim mattis odio in risus nunc.
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