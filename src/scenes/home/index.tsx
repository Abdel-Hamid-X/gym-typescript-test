import useMediaQuery from '@/hooks/useMediaQuery';
import ActionButton from '@/shared/ActionButton';
import HomePageText from "@/assets/HomePageText.png";
import HomePageImg from "@/assets/HomePageImg.png";
import SponsorRedBull from "@/assets/SponsorRedBull.png";
import SponsorForbes from "@/assets/SponsorForbes.png";
import SponsorFortune from "@/assets/SponsorFortune.png";
import { SelectedPage } from '@/shared/types';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import { motion } from 'framer-motion';
import { useLanguage } from '@/shared/LanguageContext';

type Props = {
    setselectedPage: (value: SelectedPage) => void;
}

const Home = ({ setselectedPage }: Props) => {
    const isAboveMediumScreens = useMediaQuery("(min-width: 1060px)");
    const { t } = useLanguage();

    return (
        <section
            id="home"
            className="gap-16 bg-gray-20 py-10 md:h-full md:pb-0"
        >
            {/* IMAGE AND MAIN HEADER */}
            <motion.div 
                className="md:flex mx-auto w-5/6 items-center justify-center md:h-5/6"            
                onViewportEnter={() => setselectedPage(SelectedPage.Home)}
            >
                {/* MAIN HEADER */}
                <div className="z-10 mt-32 md:basis-3/5">
                    {/* HEADINGS */}
                    <motion.div 
                        className="md:-mt-20"
                        initial="hidden"
                        viewport={{ once: true, amount: 0.5 }}
                        whileInView="visible"
                        transition={{ duration: 0.5 }}
                        variants={{
                            hidden: { opacity: 0, x: -50 },
                            visible: { opacity: 1, x: 0 },
                        }}
                    >
                        <div className="relative">
                            <div className="before:absolute before:-top-20 before:-left-20 before:z-[-1] md:before:content-evolvetext">
                                <img alt="home-page-text" src={HomePageText} />
                            </div>
                        </div>
                        <p className="mt-8 text-sm uppercase tracking-wide text-gray-500">
                            {t("home_desc")}
                        </p>
                    </motion.div>

                    {/* ACTIONS */}
                    <motion.div 
                        className="mt-8 flex items-center gap-8 md:justify-start"
                        initial="hidden"
                        viewport={{ once: true, amount: 0.5 }}
                        whileInView="visible"
                        transition={{ delay: 0.2, duration: 0.5 }}
                        variants={{
                            hidden: { opacity: 0, x: -50 },
                            visible: { opacity: 1, x: 0 },
                        }}
                    >
                        <ActionButton setselectedPage={setselectedPage}>
                            {t("home_join_now")}
                        </ActionButton>
                        <AnchorLink
                            className="text-sm font-bold text-primary-300 underline uppercase tracking-wide hover:text-secondary-500"
                            onClick={() => setselectedPage(SelectedPage.ContactUs)}
                            href={`#${SelectedPage.ContactUs}`}
                        >
                            <p>{t("home_learn_more")}</p>
                        </AnchorLink>
                    </motion.div>
                </div>

                {/* IMAGE */}
                <div className="flex md:basis-3/5 justify-center md:z-10 md:ml-40 md:mt-16 md:justify-items-end">
                    <img alt="home-page-graphic" src={HomePageImg} />
                </div>
            </motion.div>

            {/* SPONSORS */}
            {isAboveMediumScreens && (
                <div className="h-[150px] w-full bg-primary-100 border-y border-gray-100 py-10">
                    <div className="mx-auto w-5/6">
                        <div className="flex w-3/5 items-center justify-between gap-8">
                            <img alt="redbull-sponsor" src={SponsorRedBull} />
                            <img alt="forbes-sponsor" src={SponsorForbes} />
                            <img alt="fortune-sponsor" src={SponsorFortune} />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Home;
