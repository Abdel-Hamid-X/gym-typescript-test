import { useState } from "react"
import { SelectedPage } from "@/shared/types"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import ContactUsPageGraphic from "@/assets/ContactUsPageGraphic.png"
import Htext from "@/shared/HText"
import { useAuth } from "@/auth/AuthContext"
import { useLanguage } from "@/shared/LanguageContext"

type Props = {
    setselectedPage: (value: SelectedPage) => void
}

type FormValues = {
    name: string
    email: string
    message: string
}

const ContactUs = ({ setselectedPage }: Props) => {
    const { addMessage } = useAuth()
    const { t } = useLanguage()
    const [submitted, setSubmitted] = useState(false)

    const inputStyles = `
        mb-5
        w-full
        rounded-lg
        bg-gray-100
        px-5
        py-3
        text-white
        placeholder-gray-500
        outline-primary-500`;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>()

    const onSubmit = async (data: FormValues) => {
        await addMessage(data.name, data.email, data.message)
        reset()
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 5000)
    }

    return (
        <section
            id="contactus"
            className="
        mx-auto
        w-5/6
        pt-24
        pb-32">
            <motion.div
                onViewportEnter={() => setselectedPage(SelectedPage.ContactUs)}>
                {/* HEADER */}
                <motion.div
                    className="
                    md:w-3/5"
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
                    <Htext>
                        <span className="text-primary-500">
                            {t("contact_join")}
                        </span>
                        {t("contact_shape")}
                    </Htext>
                    <p className="my-5">
                        {t("contact_desc")}
                    </p>
                </motion.div>
                {/* FORM AND IMAGE */}
                <div
                    className="
                    mt-10
                    justify-between
                    gap-8
                    md:flex">
                    <motion.div
                        className="
                        mt-10
                        basis-3/5
                        md:mt-0"
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
                                y: 50
                            },
                            visible: {
                                opacity: 1,
                                y: 0
                            },
                        }}>

                        {/* SUCCESS TOAST */}
                        {submitted && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/40 bg-green-950/60 px-5 py-4 text-green-400"
                            >
                                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-semibold">{t("contact_toast")}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <input
                                className={inputStyles}
                                type="text"
                                placeholder={t("contact_placeholder_name")}
                                {...register("name", {
                                    required: true,
                                    maxLength: 100,
                                })} />
                            {errors.name && (
                                <p className="mt-1 text-primary-500">
                                    {errors.name.type === "required" && t("contact_err_required")}
                                    {errors.name.type === "maxLength" && t("contact_err_max_char")}
                                </p>
                            )}

                            <input
                                className={inputStyles}
                                type="text"
                                placeholder={t("contact_placeholder_email")}
                                {...register("email", {
                                    required: true,
                                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                })} />
                            {errors.email && (
                                <p className="mt-1 text-primary-500">
                                    {errors.email.type === "required" && t("contact_err_required")}
                                    {errors.email.type === "pattern" && t("contact_err_email")}
                                </p>
                            )}

                            <textarea
                                className={inputStyles}
                                rows={4}
                                cols={50}
                                placeholder={t("contact_placeholder_message")}
                                {...register("message", {
                                    required: true,
                                    maxLength: 2000,
                                })} />
                            {errors.message && (
                                <p className="mt-1 text-primary-500">
                                    {errors.message.type === "required" && t("contact_err_required")}
                                    {errors.message.type === "maxLength" && t("contact_err_max_msg")}
                                </p>
                            )}
                            <button
                                type="submit"
                                className="
                                mt-5 
                                rounded-lg 
                                bg-secondary-500 
                                px-20 
                                py-3 
                                font-bold
                                uppercase
                                tracking-wide
                                text-white
                                transition 
                                duration-500 
                                hover:bg-primary-500
                                hover:text-white"
                            >
                                {t("contact_submit")}
                            </button>
                        </form>
                    </motion.div>
                    <motion.div
                        className="
                        relative
                        mt-16
                        basis-2/5
                        md:mt-0"
                        initial="hidden"
                        viewport={{
                            once: true,
                            amount: 0.5
                        }}
                        whileInView="visible"
                        transition={{
                            delay: 0.5,
                            duration: 0.5
                        }}
                        variants={{
                            hidden: {
                                opacity: 0,
                                y: 50
                            },
                            visible: {
                                opacity: 1,
                                y: 0
                            },
                        }}>
                        <div
                            className="
                            md:before:content-evolvetext
                            w-full
                            before:absolute
                            before:-bottom-20
                            before:-right-10
                            before:z-[-1]">
                            <img
                                className="w-full"
                                src={ContactUsPageGraphic}
                                alt="contact-us-page-graphic" />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}

export default ContactUs
