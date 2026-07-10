import { SelectedPage } from "@/shared/types"
import type { BenefitType } from "@/shared/types"
import { AcademicCapIcon, HomeModernIcon, UserGroupIcon } from "@heroicons/react/24/solid"
import { motion } from "framer-motion"
import ActionButton from '@/shared/ActionButton';
import BenefitsPage2 from "@/assets/BenefitsPage2.png"
import HText from "@/shared/HText"
import Benefit from "./Benefit"
import { useLanguage } from "@/shared/LanguageContext";

const Container = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.2
        }
    }
}

type Props = {
    setselectedPage: (value: SelectedPage) => void
}

const Benefits = ({ setselectedPage }: Props) => {
    const { t } = useLanguage();

    const translatedBenefits: Array<BenefitType> = [
        {
            icon: <HomeModernIcon className="h-6 w-6" />,
            title: t("benefits_item_1_title"),
            description: t("benefits_item_1_desc")
        },
        {
            icon: <UserGroupIcon className="h-6 w-6" />,
            title: t("benefits_item_2_title"),
            description: t("benefits_item_2_desc")
        },
        {
            icon: <AcademicCapIcon className="h-6 w-6" />,
            title: t("benefits_item_3_title"),
            description: t("benefits_item_3_desc")
        },
    ];

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
                    <HText>{t("benefits_title_1")}</HText>
                    <p
                        className="
                                my-5 
                                text-sm">
                        {t("benefits_desc_1")}
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
                    {translatedBenefits.map((benefit: BenefitType) => (
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
                                        {t("benefits_title_2")} {" "}
                                        <span
                                            className="
                                            text-primary-500">
                                            {t("benefits_title_span")}
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
                                {t("benefits_desc_2")}
                            </p>
                            <p
                                className="mb-5">
                                {t("benefits_desc_3")}
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
                                    {t("home_join_now")}
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
