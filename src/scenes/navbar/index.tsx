
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import Link from "./Link";
import type { SelectedPage } from "@/shared/types";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useAuth } from "@/auth/AuthContext";

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
    const navigate = useNavigate();
    const [
        isMenuToggled,
        setIsMenuToggled] = useState(
            false
        );
    const isAboveMediumScreens = useMediaQuery(
        "(min-width: 1060px)"
        );
    const navbarBackground = istopofpage ? "" : "bg-primary-100 drop-shadow";
    const profilePath = user?.role === "admin" ? "/admin" : "/profile";
    const userInitial = user?.name?.charAt(0).toUpperCase() ?? "U";
    const subscriptionLabel =
        user?.membershipStatus === "None"
            ? "No Active Plan"
            : `${user?.membershipStatus} Plan`;
    const handleLogout = () => {
        logout();
        navigate("/");
        setIsMenuToggled(false);
    };

    const userMenu = (
        <div className="group relative">
            <button
                className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    border-2
                    border-primary-500
                    bg-gray-20
                    font-montserrat
                    text-2xl
                    text-primary-300
                    transition
                    duration-300
                    hover:border-secondary-500"
                type="button">
                {user?.avatarUrl ? (
                    <img
                        alt="profile"
                        className="h-full w-full object-cover"
                        src={user.avatarUrl}
                    />
                ) : (
                    userInitial
                )}
            </button>

            <div
                className="
                    invisible
                    absolute
                    right-0
                    top-14
                    z-50
                    w-80
                    rounded-md
                    border
                    border-gray-100
                    bg-gray-50
                    p-5
                    text-left
                    opacity-0
                    shadow-2xl
                    transition
                    duration-200
                    group-hover:visible
                    group-hover:opacity-100">
                <div className="flex items-center gap-4">
                    <div
                        className="
                            flex
                            h-16
                            w-16
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-full
                            border-2
                            border-primary-500
                            bg-gray-20
                            font-montserrat
                            text-3xl
                            text-primary-300">
                        {user?.avatarUrl ? (
                            <img
                                alt="profile"
                                className="h-full w-full object-cover"
                                src={user.avatarUrl}
                            />
                        ) : (
                            userInitial
                        )}
                    </div>
                    <div>
                        <p className="font-montserrat text-2xl uppercase tracking-wide text-white">
                            {user?.name}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm">
                    <div>
                        <p className="font-bold uppercase tracking-wide text-gray-500">Phone Number</p>
                        <p className="mt-1 text-white">{user?.phoneNumber || "Not added yet"}</p>
                    </div>
                    <div>
                        <p className="font-bold uppercase tracking-wide text-gray-500">Personal Goals</p>
                        <p className="mt-1 text-white">{user?.personalGoals || "No goals added yet"}</p>
                    </div>
                    <div>
                        <p className="font-bold uppercase tracking-wide text-gray-500">Sub Plan</p>
                        <p className="mt-1 text-primary-300">{subscriptionLabel}</p>
                    </div>
                </div>

                <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
                    <RouterLink
                        className="
                            flex-1
                            rounded-md
                            bg-secondary-500
                            px-4
                            py-2
                            text-center
                            text-sm
                            font-bold
                            uppercase
                            tracking-wide
                            text-white
                            transition
                            duration-300
                            hover:bg-primary-500"
                        to={profilePath}>
                        {user?.role === "admin" ? "Admin" : "Profile"}
                    </RouterLink>
                    <button
                        className="
                            flex-1
                            rounded-md
                            border
                            border-primary-500
                            px-4
                            py-2
                            text-sm
                            font-bold
                            uppercase
                            tracking-wide
                            text-primary-300
                            transition
                            duration-300
                            hover:bg-primary-500
                            hover:text-white"
                        onClick={handleLogout}
                        type="button">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <nav
            className={` 
                ${navbarBackground} 
                ${flexBetween} 
                fixed 
                top-0 
                z-30 
                w-full 
                py-6`
            }>
            <div
                className={`
                    ${flexBetween} 
                    mx-auto 
                    w-5/6`
                }>
                <div
                    className={`
                        ${flexBetween} 
                        w-full 
                        gap-16`
                    }>
                    {/* LEFT SIDE */}
                    <img 
                        alt="logo" 
                        src={Logo} 
                    />
                    {/* RIGHT SIDE */}
                    {isAboveMediumScreens ? (
                        <div
                            className={`
                                ${flexBetween} 
                                w-full`
                            }>
                            <div
                                className={`
                                    ${flexBetween} 
                                    gap-8 
                                    text-sm`
                                }>
                                <Link
                                    page="Home"
                                    selectedPage={selectedPage}
                                    setselectedPage={setselectedPage} />
                                <Link
                                    page="Benefits"
                                    selectedPage={selectedPage}
                                    setselectedPage={setselectedPage} />
                                <Link
                                    page="Our Classes"
                                    selectedPage={selectedPage}
                                    setselectedPage={setselectedPage} />
                                <Link
                                    page="Contact Us"
                                    selectedPage={selectedPage}
                                    setselectedPage={setselectedPage} />
                            </div>
                            <div
                                className={`${flexBetween} gap-8`}>
                                {isAuthenticated ? (
                                    <>
                                        {user?.role === "member" && (
                                            <RouterLink
                                                className="
                                                    rounded-md
                                                    border-2
                                                    border-primary-500
                                                    px-6
                                                    py-2
                                                    text-sm
                                                    font-bold
                                                    uppercase
                                                    tracking-wide
                                                    text-primary-300
                                                    transition
                                                    duration-300
                                                    hover:bg-primary-500
                                                    hover:text-white"
                                                to="/subscriptions">
                                                Subscription
                                            </RouterLink>
                                        )}
                                        {userMenu}
                                    </>
                                ) : (
                                    <>
                                        <RouterLink
                                            className="uppercase tracking-wide hover:text-primary-300 transition duration-500"
                                            to="/login">
                                            Sign In
                                        </RouterLink>
                                        <RouterLink
                                            className="
                                                rounded-md 
                                                bg-secondary-500 
                                                px-10 
                                                py-2 
                                                text-white 
                                                hover:bg-primary-500 
                                                hover:text-white 
                                                transition 
                                                duration-300
                                                uppercase
                                                font-bold
                                                tracking-wide"
                                            to="/register">
                                            Become a member
                                        </RouterLink>
                                    </>
                                )}
                            </div>
                        </div>) : (
                        <div>
                            <button
                                className="rounded-full bg-secondary-500 p-2"
                                onClick={() => setIsMenuToggled(!isMenuToggled)}>
                                <Bars3Icon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* MOBILE MENU MODAL */}
            {!isAboveMediumScreens && isMenuToggled && (
                <div className="
                    fixed 
                    right-0 
                    bottom-0 
                    z-40 
                    h-full 
                    bg-primary-100 
                    w-[300px]
                    drop-shadow-xl">
                    {/* CLOSE ICON */}
                    <div className="
                        flex justify-end 
                        p-12">
                        <button
                            onClick={
                                () => setIsMenuToggled(!isMenuToggled)
                            }>
                            <XMarkIcon
                                className="
                            h-6 
                            w-6 
                             text-gray-400" />
                        </button>
                    </div>
                    {/* MENU ITEMS */}
                    <div
                        className="
                        ml-[33%] 
                        flex 
                        flex-col 
                        gap-10 
                        text-2xl">
                        <Link
                            page="Home"
                            selectedPage={selectedPage}
                            setselectedPage={setselectedPage} />
                        <Link
                            page="Benefits"
                            selectedPage={selectedPage}
                            setselectedPage={setselectedPage} />
                        <Link
                            page="Our Classes"
                            selectedPage={selectedPage}
                            setselectedPage={setselectedPage} />
                        <Link
                            page="Contact Us"
                            selectedPage={selectedPage}
                            setselectedPage={setselectedPage} />
                        {isAuthenticated ? (
                            <div className="flex flex-col items-start gap-6">
                                {user?.role === "member" && (
                                    <RouterLink
                                        className="uppercase tracking-wide hover:text-primary-300 transition duration-500"
                                        onClick={() => setIsMenuToggled(false)}
                                        to="/subscriptions">
                                        Subscription
                                    </RouterLink>
                                )}
                                {userMenu}
                            </div>
                        ) : (
                            <>
                                <RouterLink
                                    className="uppercase tracking-wide hover:text-primary-300 transition duration-500"
                                    onClick={() => setIsMenuToggled(false)}
                                    to="/login">
                                    Sign In
                                </RouterLink>
                                <RouterLink
                                    className="uppercase tracking-wide hover:text-primary-300 transition duration-500"
                                    onClick={() => setIsMenuToggled(false)}
                                    to="/register">
                                    Become a member
                                </RouterLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar 
