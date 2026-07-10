import type { SelectedPage } from "@/shared/types";
import AnchorLink from "react-anchor-link-smooth-scroll"
import { useLanguage } from "@/shared/LanguageContext";

type Props = {
    page: string;
    selectedPage: SelectedPage;
    setselectedPage: (value: SelectedPage) => void;
}

const Link = ({
    page,
    selectedPage,
    setselectedPage,
}: Props) => {
    const lowerCasePage = page.toLowerCase().replace(/ /g, "") as SelectedPage;
    const { t } = useLanguage();

    const translatedPage = (() => {
        if (lowerCasePage === "home") return t("nav_home");
        if (lowerCasePage === "benefits") return t("nav_benefits");
        if (lowerCasePage === "ourclasses") return t("nav_classes");
        if (lowerCasePage === "contactus") return t("nav_contact");
        return page;
    })();

  return (
    <AnchorLink 
    className={`
        ${selectedPage === lowerCasePage ? "text-primary-500" : ""}
         uppercase tracking-wide hover:text-primary-300 transition duration-500
        `}
    href={`#${lowerCasePage}`}
    onClick={() => setselectedPage(lowerCasePage)}>
      {translatedPage}
    </AnchorLink>
  )
}

export default Link
