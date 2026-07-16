import Logo from "@/assets/Logo.png";
import { useLanguage } from "@/shared/LanguageContext";

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="border-t border-gray-100 bg-primary-100 py-16">
            <div className="justify-content mx-auto w-5/6 gap-16 md:flex">
                <div className="mt-16 basis-1/2 md:mt-0">
                    <img alt="logo" src={Logo} />
                    <p className="my-5 text-gray-500">
                        {t("footer_desc")}
                    </p>
                    <p>{t("footer_rights")}</p>
                </div>
                <div className="mt-16 basis-1/4 md:mt-0">
                    <h4 className="font-bold uppercase tracking-wide">{t("footer_links")}</h4>
                    <p className="my-5 text-gray-500">{t("footer_classes")}</p>
                    <p className="my-5 text-gray-500">{t("footer_coaching")}</p>
                    <p className="text-gray-500">{t("footer_membership")}</p>
                </div>
                <div className="mt-16 basis-1/4 md:mt-0">
                    <h4 className="font-bold uppercase tracking-wide">{t("footer_contact")}</h4>
                    <p className="my-5 text-gray-500">{t("footer_contact_desc")}</p>
                    <p>{t("footer_phone")}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
