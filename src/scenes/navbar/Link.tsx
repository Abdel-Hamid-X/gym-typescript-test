import type { SelectedPage } from "@/shared/types";
import AnchorLink from "react-anchor-link-smooth-scroll"
import { useLanguage } from "@/shared/LanguageContext";

type Props = {
    page: string;
    selectedPage: SelectedPage;
    setselectedPage: (value: SelectedPage) => void;
    mobileDrawer?: boolean;
}

const Link = ({
    page,
    selectedPage,
    setselectedPage,
    mobileDrawer = false,
}: Props) => {
    const lowerCasePage = page.toLowerCase().replace(/ /g, "") as SelectedPage;
    const { t, language } = useLanguage();
    const isRtl = language === "ar";
    const isActive = selectedPage === lowerCasePage;

    const translatedPage = (() => {
        if (lowerCasePage === "home") return t("nav_home");
        if (lowerCasePage === "benefits") return t("nav_benefits");
        if (lowerCasePage === "ourclasses") return t("nav_classes");
        if (lowerCasePage === "contactus") return t("nav_contact");
        return page;
    })();

    if (mobileDrawer) {
        return (
            <AnchorLink
                className={`
                    flex w-full items-center gap-4 rounded-lg px-4 py-3.5
                    text-base font-bold uppercase tracking-widest
                    transition duration-200
                    ${isActive
                        ? "text-white bg-primary-500/10 border-l-2 border-primary-500"
                        : "text-gray-300 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                    }
                    ${isRtl ? "border-l-0 border-r-2" : "border-l-2"}
                `}
                href={`#${lowerCasePage}`}
                onClick={() => setselectedPage(lowerCasePage)}>
                {translatedPage}
            </AnchorLink>
        );
    }

    return (
        <AnchorLink
            className={`
                ${isActive ? "text-primary-500" : ""}
                uppercase tracking-wide hover:text-primary-300 transition duration-500
            `}
            href={`#${lowerCasePage}`}
            onClick={() => setselectedPage(lowerCasePage)}>
            {translatedPage}
        </AnchorLink>
    );
}

export default Link
