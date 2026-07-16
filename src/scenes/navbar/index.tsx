import { Bars3Icon, MoonIcon, SunIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import Link from "./Link";
import { SelectedPage } from "@/shared/types";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/theme/ThemeContext";
import { formatPlanName, useLanguage } from "@/shared/LanguageContext";
import { getRoleHome } from "@/auth/roleRoutes";

type Props = {
    istopofpage: boolean;
    selectedPage: SelectedPage;
    setselectedPage: (value: SelectedPage) => void;
}

const Navbar = ({
    istopofpage,
    selectedPage,
    setselectedPage,
}: Props) => {
    const flexBetween = "flex items-center justify-between";
    const { isAuthenticated, logout, user, coaches } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const isRtl = language === "ar";
    const navigate = useNavigate();
    const [isMenuToggled, setIsMenuToggled] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const isAboveMediumScreens = useMediaQuery("(min-width: 1060px)");
    const navbarBackground = istopofpage ? "" : "bg-primary-100 drop-shadow";

    // Click outside handler for dropdowns and drawers
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Clicked outside profile dropdown
            if (isProfileMenuOpen && !target.closest(".profile-menu-container")) {
                setIsProfileMenuOpen(false);
            }

            // Clicked outside mobile drawer
            if (isMenuToggled && !target.closest(".mobile-nav-drawer") && !target.closest(".mobile-hamburger-btn")) {
                setIsMenuToggled(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isProfileMenuOpen, isMenuToggled]);
    const profilePath = getRoleHome(user?.role);
    const coachProfile = coaches.find((coach) => coach.id === user?.coachId);
    const profileActionLabel = user?.role === "admin"
        ? t("nav_admin")
        : user?.role === "coach"
            ? t("coach_dashboard")
            : t("nav_profile");
    const userInitial = user?.name?.charAt(0).toUpperCase() ?? "U";
    const subscriptionLabel =
        user?.membershipStatus === "None"
            ? t("profile_status_none")
            : formatPlanName(user?.membershipStatus ?? "", language);

    const handleLogout = () => {
        logout();
        navigate("/");
        setIsMenuToggled(false);
        setIsProfileMenuOpen(false);
    };

    const themeToggle = (
        <button
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border-2
                border-primary-500
                text-primary-300
                transition
                duration-300
                hover:bg-primary-500
                hover:text-white"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            type="button">
            {theme === "dark" ? (
                <SunIcon className="h-4 w-4" />
            ) : (
                <MoonIcon className="h-4 w-4" />
            )}
        </button>
    );

    /* ── Desktop user dropdown ── */
    const desktopUserMenu = (
        <div className="group relative profile-menu-container">
            <button
                className="
                    flex h-9 w-9
                    items-center justify-center
                    overflow-hidden rounded-full
                    border-2 border-primary-500
                    bg-gray-20 font-montserrat
                    text-lg text-primary-300
                    transition duration-300
                    hover:border-secondary-500"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                type="button">
                {user?.avatarUrl ? (
                    <img alt="profile" className="h-full w-full object-cover" src={user.avatarUrl} />
                ) : (
                    userInitial
                )}
            </button>

            <div
                className={`
                    absolute top-11 w-80
                ${isRtl ? "left-0" : "right-0"}
                ${isProfileMenuOpen ? "visible opacity-100" : "invisible opacity-0"}
                z-50
                rounded-md border border-gray-100
                    bg-gray-50 p-5 shadow-2xl
                    ${isRtl ? "rtl text-right" : "ltr text-left"}
                    transition duration-200
                    group-hover:visible group-hover:opacity-100`}
                dir={isRtl ? "rtl" : "ltr"}>
                <div className={`flex items-center gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <div className="
                        flex h-16 w-16 shrink-0
                        items-center justify-center
                        overflow-hidden rounded-full
                        border-2 border-primary-500
                        bg-gray-20 font-montserrat
                        text-3xl text-primary-300">
                        {user?.avatarUrl ? (
                            <img alt="profile" className="h-full w-full object-cover" src={user.avatarUrl} />
                        ) : (
                            userInitial
                        )}
                    </div>
                    <div>
                        <p className="font-montserrat text-2xl uppercase tracking-wide text-white">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm">
                    <div>
                        <p className="font-bold uppercase tracking-wide text-gray-500">{t("profile_phone")}</p>
                        <p className="mt-1 text-white">{user?.phoneNumber || t("profile_phone_empty")}</p>
                    </div>
                    {user?.role === "coach" ? <>
                        <div><p className="font-bold uppercase tracking-wide text-gray-500">{t("coach_specialization")}</p><p className="mt-1 text-white">{coachProfile?.specialization}</p></div>
                        <div><p className="font-bold uppercase tracking-wide text-gray-500">{t("coach_bio")}</p><p className="mt-1 text-white">{coachProfile?.bio}</p></div>
                    </> : <>
                        <div><p className="font-bold uppercase tracking-wide text-gray-500">{t("profile_goals")}</p><p className="mt-1 text-white">{user?.personalGoals || t("profile_goals_empty")}</p></div>
                        <div><p className="font-bold uppercase tracking-wide text-gray-500">{t("profile_tier")}</p><p className="mt-1 text-primary-300">{subscriptionLabel}</p></div>
                    </>}
                </div>

                <div className={`mt-5 flex gap-3 border-t border-gray-100 pt-4 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <RouterLink
                        className="
                            flex-1 rounded-md bg-secondary-500
                            px-4 py-2 text-center
                            text-sm font-bold uppercase tracking-wide text-white
                            transition duration-300 hover:bg-primary-500"
                        onClick={() => { setIsMenuToggled(false); setIsProfileMenuOpen(false); }}
                        to={profilePath}>
                        {profileActionLabel}
                    </RouterLink>
                    <button
                        className="
                            flex-1 rounded-md border border-primary-500
                            px-4 py-2 text-sm font-bold uppercase tracking-wide
                            text-primary-300 transition duration-300
                            hover:bg-primary-500 hover:text-white"
                        onClick={handleLogout}
                        type="button">
                        {t("nav_logout")}
                    </button>
                </div>
            </div>
        </div>
    );

    /* ── Mobile avatar button + dropdown (shown in top bar beside hamburger) ── */
    const mobileAvatarButton = isAuthenticated ? (
        <div className="relative profile-menu-container">
            <button
                className="
                    flex h-8 w-8
                    items-center justify-center
                    overflow-hidden rounded-full
                    border-2 border-primary-500
                    bg-gray-20 font-montserrat
                    text-sm text-primary-300
                    transition duration-300
                    hover:border-secondary-500"
                onClick={() => {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                    setIsMenuToggled(false);
                }}
                type="button">
                {user?.avatarUrl ? (
                    <img alt="profile" className="h-full w-full object-cover" src={user.avatarUrl} />
                ) : (
                    userInitial
                )}
            </button>

            {isProfileMenuOpen && (
                <div className={`
                    absolute top-11
                    z-50 w-72
                    rounded-md border border-gray-100
                    bg-gray-50 p-5 shadow-2xl
                    ${isRtl ? "left-0 rtl text-right" : "right-0 ltr text-left"}`}
                    dir={isRtl ? "rtl" : "ltr"}>
                    <div className={`flex items-center gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <div className="
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            overflow-hidden rounded-full
                            border-2 border-primary-500
                            bg-gray-20 font-montserrat
                            text-lg text-primary-300">
                            {user?.avatarUrl ? (
                                <img alt="profile" className="h-full w-full object-cover" src={user.avatarUrl} />
                            ) : (
                                userInitial
                            )}
                        </div>
                        <div>
                            <p className="font-montserrat text-xl uppercase tracking-wide text-white">{user?.name}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm">
                        <div>
                            <p className="font-bold uppercase tracking-wide text-gray-500">{t("profile_phone")}</p>
                            <p className="mt-1 text-white">{user?.phoneNumber || t("profile_phone_empty")}</p>
                        </div>
                        {user?.role === "coach" ? <>
                            <div><p className="font-bold uppercase tracking-wide text-gray-500">{t("coach_specialization")}</p><p className="mt-1 text-white">{coachProfile?.specialization}</p></div>
                            <div><p className="font-bold uppercase tracking-wide text-gray-500">{t("coach_bio")}</p><p className="mt-1 text-white">{coachProfile?.bio}</p></div>
                        </> : <>
                            <div><p className="font-bold uppercase tracking-wide text-gray-500">{t("profile_goals")}</p><p className="mt-1 text-white">{user?.personalGoals || t("profile_goals_empty")}</p></div>
                            <div><p className="font-bold uppercase tracking-wide text-gray-500">{t("profile_tier")}</p><p className="mt-1 text-primary-300">{subscriptionLabel}</p></div>
                        </>}
                    </div>
                    <div className={`mt-4 flex gap-3 border-t border-gray-100 pt-4 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <RouterLink
                            className="flex-1 rounded-md bg-secondary-500 px-4 py-2 text-center text-sm font-bold uppercase tracking-wide text-white transition duration-300 hover:bg-primary-500"
                            onClick={() => { setIsMenuToggled(false); setIsProfileMenuOpen(false); }}
                            to={profilePath}>
                            {profileActionLabel}
                        </RouterLink>
                        <button
                            className="flex-1 rounded-md border border-primary-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-primary-300 transition duration-300 hover:bg-primary-500 hover:text-white"
                            onClick={handleLogout}
                            type="button">
                            {t("nav_logout")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    ) : null;

    const languageToggle = (
        <div className="flex items-center border border-primary-500 rounded-md overflow-hidden bg-gray-20 text-[10px] font-bold font-montserrat shrink-0">
            <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 transition duration-300 ${
                    language === "en"
                        ? "bg-primary-500 text-white"
                        : "text-primary-300 hover:bg-primary-500/10"
                }`}
            >
                EN
            </button>
            <button
                type="button"
                onClick={() => setLanguage("fr")}
                className={`px-2 py-1 transition duration-300 ${
                    language === "fr"
                        ? "bg-primary-500 text-white"
                        : "text-primary-300 hover:bg-primary-500/10"
                }`}
            >
                FR
            </button>
            <button
                type="button"
                onClick={() => setLanguage("ar")}
                className={`px-2 py-1 transition duration-300 ${
                    language === "ar"
                        ? "bg-primary-500 text-white"
                        : "text-primary-300 hover:bg-primary-500/10"
                }`}
            >
                AR
            </button>
        </div>
    );

    return (
        <nav
            className={`
                ${navbarBackground}
                ${flexBetween}
                fixed top-0 z-30 w-full py-4`}>
            <div className={`${flexBetween} mx-auto w-5/6`}>
                <div className={`${flexBetween} w-full gap-8`}>
                    {/* LOGO & LANGUAGE */}
                    <div className="flex items-center gap-3 shrink-0">
                        <RouterLink to="/" onClick={() => setselectedPage(SelectedPage.Home)}>
                            <img alt="logo" src={Logo} className="h-5 md:h-6 object-contain" />
                        </RouterLink>
                        {languageToggle}
                    </div>

                    {/* DESKTOP NAV */}
                    {isAboveMediumScreens ? (
                        <div className={`${flexBetween} w-full`}>
                            <div className={`${flexBetween} gap-5 text-sm`}>
                                <Link page="Home" selectedPage={selectedPage} setselectedPage={setselectedPage} />
                                <Link page="Benefits" selectedPage={selectedPage} setselectedPage={setselectedPage} />
                                <Link page="Our Classes" selectedPage={selectedPage} setselectedPage={setselectedPage} />
                                <Link page="Contact Us" selectedPage={selectedPage} setselectedPage={setselectedPage} />
                            </div>
                            <div className={`${flexBetween} gap-5`}>
                                {isAuthenticated ? (
                                    <>
                                        {user?.role === "member" && (
                                            <RouterLink
                                                className="
                                                    rounded-md border-2 border-primary-500
                                                    px-4 py-1.5 text-xs font-bold uppercase tracking-wide
                                                    text-primary-300 transition duration-300
                                                    hover:bg-primary-500 hover:text-white"
                                                to="/subscriptions">
                                                {t("nav_subscription")}
                                            </RouterLink>
                                        )}
                                        {themeToggle}
                                        {desktopUserMenu}
                                    </>
                                ) : (
                                    <>
                                        {themeToggle}
                                        <RouterLink
                                            className="uppercase tracking-wide hover:text-primary-300 transition duration-500"
                                            to="/login">
                                            {t("nav_signin")}
                                        </RouterLink>
                                        <RouterLink
                                            className="
                                                rounded-md bg-secondary-500
                                                px-10 py-2 text-white
                                                hover:bg-primary-500 hover:text-white
                                                transition duration-300
                                                uppercase font-bold tracking-wide"
                                            to="/register">
                                            {t("nav_become_member")}
                                        </RouterLink>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* MOBILE: avatar (if logged in) + hamburger */
                        <div className="flex items-center gap-3">
                            {mobileAvatarButton}
                            <button
                                className="rounded-full bg-secondary-500 p-1.5 mobile-hamburger-btn"
                                onClick={() => {
                                    setIsMenuToggled(!isMenuToggled);
                                    setIsProfileMenuOpen(false);
                                }}>
                                <Bars3Icon className="h-5 w-5 text-white" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

                    {/* MOBILE DRAWER */}
            <AnimatePresence>
                {!isAboveMediumScreens && isMenuToggled && (
                    <motion.div
                        key="mobile-drawer"
                        className={`
                            fixed top-0 z-40
                            h-screen w-[260px]
                            flex flex-col
                            bg-primary-100 drop-shadow-xl mobile-nav-drawer
                            ${isRtl ? "left-0" : "right-0"}`}
                        initial={{ x: isRtl ? "-100%" : "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: isRtl ? "-100%" : "100%" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}>

                        {/* TOP BAR: theme toggle left, close right */}
                        <div className="flex items-center justify-between px-5 pt-6 pb-4">
                            {themeToggle}
                            <button
                                aria-label="Close menu"
                                onClick={() => setIsMenuToggled(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-100/30 text-gray-400 hover:border-primary-500 hover:text-white transition duration-200">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* DIVIDER */}
                        <div className="mx-5 border-t border-white/10" />

                        {/* NAV LINKS — staggered fade-up */}
                        <nav className="flex flex-col gap-1 px-4 pt-6 flex-1">
                            {([
                                { page: "Home" as const },
                                { page: "Benefits" as const },
                                { page: "Our Classes" as const },
                                { page: "Contact Us" as const },
                            ] as const).map(({ page }, i) => (
                                <motion.div
                                    key={page}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: 0.15 + i * 0.04, ease: "easeOut" }}
                                    onClick={() => setIsMenuToggled(false)}
                                    className="w-full">
                                    <Link
                                        page={page}
                                        selectedPage={selectedPage}
                                        setselectedPage={setselectedPage}
                                        mobileDrawer
                                    />
                                </motion.div>
                            ))}
                        </nav>

                        {/* BOTTOM SECTION: auth-aware actions */}
                        <motion.div
                            className="px-5 pb-10 pt-4 border-t border-gray-100/20 mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.35 }}>
                            {isAuthenticated ? (
                                <div className="flex flex-col gap-3">
                                    <RouterLink
                                        className="
                                            flex items-center gap-3 rounded-lg
                                            border border-primary-500/30 bg-gray-20/30
                                            px-4 py-3 text-sm font-bold uppercase tracking-wide
                                            text-primary-300 transition duration-300
                                            hover:border-primary-500 hover:bg-primary-500/10"
                                        onClick={() => { setIsMenuToggled(false); setIsProfileMenuOpen(false); }}
                                        to={profilePath}>
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary-500/40 bg-gray-20 text-xs font-montserrat text-primary-300">
                                            {userInitial}
                                        </span>
                                        <span>{profileActionLabel}</span>
                                    </RouterLink>
                                    {user?.role === "member" && (
                                        <RouterLink
                                            className="
                                                rounded-lg bg-secondary-500 px-4 py-3
                                                text-center text-sm font-bold uppercase tracking-wide
                                                text-white transition duration-300 hover:bg-primary-500"
                                            onClick={() => setIsMenuToggled(false)}
                                            to="/subscriptions">
                                            {t("nav_subscription")}
                                        </RouterLink>
                                    )}
                                    <button
                                        className="
                                            rounded-lg border border-gray-100/30 px-4 py-3
                                            text-sm font-bold uppercase tracking-wide
                                            text-gray-400 transition duration-300
                                            hover:border-primary-500 hover:text-white"
                                        onClick={handleLogout}
                                        type="button">
                                        {t("nav_logout")}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <RouterLink
                                        className="
                                            rounded-lg bg-secondary-500 px-4 py-3
                                            text-center text-sm font-bold uppercase tracking-wide
                                            text-white transition duration-300 hover:bg-primary-500"
                                        onClick={() => setIsMenuToggled(false)}
                                        to="/register">
                                        {t("nav_become_member")}
                                    </RouterLink>
                                    <RouterLink
                                        className="
                                            rounded-lg border border-primary-500/40 px-4 py-3
                                            text-center text-sm font-bold uppercase tracking-wide
                                            text-primary-300 transition duration-300
                                            hover:border-primary-500 hover:bg-primary-500/10"
                                        onClick={() => setIsMenuToggled(false)}
                                        to="/login">
                                        {t("nav_signin")}
                                    </RouterLink>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
