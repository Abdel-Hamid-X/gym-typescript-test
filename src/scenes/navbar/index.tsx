import { Bars3Icon, MoonIcon, SunIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import Link from "./Link";
import type { SelectedPage } from "@/shared/types";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/theme/ThemeContext";
import { useLanguage } from "@/shared/LanguageContext";

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
    const { isAuthenticated, logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
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
    const profilePath = user?.role === "admin" ? "/admin" : "/profile";
    const userInitial = user?.name?.charAt(0).toUpperCase() ?? "U";
    const subscriptionLabel =
        user?.membershipStatus === "None"
            ? t("profile_status_none")
            : `${user?.membershipStatus}${t("profile_status_plan")}`;

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
                h-11
                w-11
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
                <SunIcon className="h-5 w-5" />
            ) : (
                <MoonIcon className="h-5 w-5" />
            )}
        </button>
    );

    /* ── Desktop user dropdown ── */
    const desktopUserMenu = (
        <div className="group relative profile-menu-container">
            <button
                className="
                    flex h-12 w-12
                    items-center justify-center
                    overflow-hidden rounded-full
                    border-2 border-primary-500
                    bg-gray-20 font-montserrat
                    text-2xl text-primary-300
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
                    absolute right-0 top-14 w-80
                    ${isProfileMenuOpen ? "visible opacity-100" : "invisible opacity-0"}
                    z-50
                    rounded-md border border-gray-100
                    bg-gray-50 p-5 text-left shadow-2xl
                    transition duration-200
                    group-hover:visible group-hover:opacity-100`}>
                <div className="flex items-center gap-4">
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
                    <div>
                        <p className="font-bold uppercase tracking-wide text-gray-500">{t("profile_goals")}</p>
                        <p className="mt-1 text-white">{user?.personalGoals || t("profile_goals_empty")}</p>
                    </div>
                    <div>
                        <p className="font-bold uppercase tracking-wide text-gray-500">{t("profile_tier")}</p>
                        <p className="mt-1 text-primary-300">{subscriptionLabel}</p>
                    </div>
                </div>

                <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
                    <RouterLink
                        className="
                            flex-1 rounded-md bg-secondary-500
                            px-4 py-2 text-center
                            text-sm font-bold uppercase tracking-wide text-white
                            transition duration-300 hover:bg-primary-500"
                        onClick={() => { setIsMenuToggled(false); setIsProfileMenuOpen(false); }}
                        to={profilePath}>
                        {user?.role === "admin" ? t("nav_admin") : t("nav_profile")}
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
                    flex h-10 w-10
                    items-center justify-center
                    overflow-hidden rounded-full
                    border-2 border-primary-500
                    bg-gray-20 font-montserrat
                    text-lg text-primary-300
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
                <div className="
                    absolute right-0 top-14
                    z-50 w-72
                    rounded-md border border-gray-100
                    bg-gray-50 p-5 text-left shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="
                            flex h-14 w-14 shrink-0
                            items-center justify-center
                            overflow-hidden rounded-full
                            border-2 border-primary-500
                            bg-gray-20 font-montserrat
                            text-2xl text-primary-300">
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
                        <div>
                            <p className="font-bold uppercase tracking-wide text-gray-500">{t("profile_goals")}</p>
                            <p className="mt-1 text-white">{user?.personalGoals || t("profile_goals_empty")}</p>
                        </div>
                        <div>
                            <p className="font-bold uppercase tracking-wide text-gray-500">{t("profile_tier")}</p>
                            <p className="mt-1 text-primary-300">{subscriptionLabel}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3 border-t border-gray-100 pt-4">
                        <RouterLink
                            className="flex-1 rounded-md bg-secondary-500 px-4 py-2 text-center text-sm font-bold uppercase tracking-wide text-white transition duration-300 hover:bg-primary-500"
                            onClick={() => { setIsMenuToggled(false); setIsProfileMenuOpen(false); }}
                            to={profilePath}>
                            {user?.role === "admin" ? t("nav_admin") : t("nav_profile")}
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
        <div className="flex items-center border border-primary-500 rounded-md overflow-hidden bg-gray-20 text-xs font-bold font-montserrat shrink-0">
            <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 transition duration-300 ${
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
                className={`px-3 py-1.5 transition duration-300 ${
                    language === "fr"
                        ? "bg-primary-500 text-white"
                        : "text-primary-300 hover:bg-primary-500/10"
                }`}
            >
                FR
            </button>
        </div>
    );

    return (
        <nav
            className={`
                ${navbarBackground}
                ${flexBetween}
                fixed top-0 z-30 w-full py-6`}>
            <div className={`${flexBetween} mx-auto w-5/6`}>
                <div className={`${flexBetween} w-full gap-16`}>
                    {/* LOGO & LANGUAGE */}
                    <div className="flex items-center gap-4 shrink-0">
                        <RouterLink to="/" onClick={() => setselectedPage(SelectedPage.Home)}>
                            <img alt="logo" src={Logo} />
                        </RouterLink>
                        {languageToggle}
                    </div>

                    {/* DESKTOP NAV */}
                    {isAboveMediumScreens ? (
                        <div className={`${flexBetween} w-full`}>
                            <div className={`${flexBetween} gap-8 text-sm`}>
                                <Link page="Home" selectedPage={selectedPage} setselectedPage={setselectedPage} />
                                <Link page="Benefits" selectedPage={selectedPage} setselectedPage={setselectedPage} />
                                <Link page="Our Classes" selectedPage={selectedPage} setselectedPage={setselectedPage} />
                                <Link page="Contact Us" selectedPage={selectedPage} setselectedPage={setselectedPage} />
                            </div>
                            <div className={`${flexBetween} gap-8`}>
                                {isAuthenticated ? (
                                    <>
                                        {user?.role === "member" && (
                                            <RouterLink
                                                className="
                                                    rounded-md border-2 border-primary-500
                                                    px-6 py-2 text-sm font-bold uppercase tracking-wide
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
                                className="rounded-full bg-secondary-500 p-2 mobile-hamburger-btn"
                                onClick={() => {
                                    setIsMenuToggled(!isMenuToggled);
                                    setIsProfileMenuOpen(false);
                                }}>
                                <Bars3Icon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MOBILE DRAWER */}
            {!isAboveMediumScreens && isMenuToggled && (
                <div className="
                    fixed right-0 top-0 z-40
                    h-screen w-[300px]
                    overflow-y-auto
                    bg-primary-100 drop-shadow-xl mobile-nav-drawer">
                    {/* CLOSE */}
                    <div className="flex justify-end p-12">
                        <button onClick={() => setIsMenuToggled(false)}>
                            <XMarkIcon className="h-6 w-6 text-gray-400" />
                        </button>
                    </div>

                    {/* NAV LINKS */}
                    <div className="flex flex-col items-start gap-10 px-10 text-2xl">
                        <div className="self-start">{themeToggle}</div>
                        <Link page="Home" selectedPage={selectedPage} setselectedPage={setselectedPage} />
                        <Link page="Benefits" selectedPage={selectedPage} setselectedPage={setselectedPage} />
                        <Link page="Our Classes" selectedPage={selectedPage} setselectedPage={setselectedPage} />
                        <Link page="Contact Us" selectedPage={selectedPage} setselectedPage={setselectedPage} />

                        {isAuthenticated ? (
                            <>
                                {user?.role === "member" && (
                                    <RouterLink
                                        className="uppercase tracking-wide hover:text-primary-300 transition duration-500"
                                        onClick={() => setIsMenuToggled(false)}
                                        to="/subscriptions">
                                        {t("nav_subscription")}
                                    </RouterLink>
                                )}
                            </>
                        ) : (
                            <>
                                <RouterLink
                                    className="uppercase tracking-wide hover:text-primary-300 transition duration-500"
                                    onClick={() => setIsMenuToggled(false)}
                                    to="/login">
                                    {t("nav_signin")}
                                </RouterLink>
                                <RouterLink
                                    className="uppercase tracking-wide hover:text-primary-300 transition duration-500"
                                    onClick={() => setIsMenuToggled(false)}
                                    to="/register">
                                    {t("nav_become_member")}
                                </RouterLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
