import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/auth/AuthContext";
import { useLanguage } from "@/shared/LanguageContext";
import { getRoleHome } from "@/auth/roleRoutes";

type LocationState = {
  from?: Location;
};

const Login = () => {
  const { isAuthenticated, login, user, users } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const locationState = location.state as LocationState | null;
  const redirectTo = locationState?.from?.pathname ?? "/profile";

  const [email, setEmail] = useState("demo@gym.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to={getRoleHome(user?.role)} replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("auth_error_required"));
      return;
    }

    if (!login(email, password)) {
      setError(t("auth_error_login"));
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const signedInUser = users.find((stored) => stored.email.toLowerCase() === normalizedEmail);
    navigate(signedInUser?.role === "member" ? redirectTo : getRoleHome(signedInUser?.role), { replace: true });
  };

  const handleQuickLogin = (role: "member" | "coach" | "admin") => {
    setError("");
    const targetEmail = role === "admin" ? "admin@gym.com" : role === "coach" ? "coach@gym.com" : "demo@gym.com";
    const targetPassword = role === "admin" ? "adminpassword" : role === "coach" ? "coachpassword" : "password";

    if (login(targetEmail, targetPassword)) {
      navigate(role === "member" ? redirectTo : getRoleHome(role), { replace: true });
    } else {
      setError(t("auth_error_login"));
    }
  };

  return (
    <main className="min-h-screen bg-gray-20 px-6 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <Link to="/" className="w-fit">
          <img alt="Evogym logo" src={Logo} />
        </Link>

        <section className="rounded-md border-2 border-gray-100 bg-gray-50 px-8 py-10">
          <h1 className="font-montserrat text-4xl font-bold uppercase tracking-wide">{t("auth_welcome_member")}</h1>
          <p className="mt-3 text-sm uppercase tracking-wide text-gray-500">
            {t("auth_login_desc")}
          </p>

          {/* Quick Login Demo Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <button
              onClick={() => handleQuickLogin("member")}
              type="button"
              className="flex flex-col items-start gap-1 rounded-lg border border-primary-500/30 bg-primary-100/40 p-4 text-left transition duration-300 hover:border-secondary-500 hover:bg-primary-100/60 focus:outline-none focus:ring-2 focus:ring-secondary-500 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-500/20 text-secondary-500 text-xs">👤</span>
                <span className="font-bold text-xs text-white uppercase tracking-wider">{t("auth_quick_member")}</span>
              </div>
              <span className="text-[10px] text-gray-400 leading-tight mt-1">{t("auth_quick_desc_member")}</span>
            </button>

            <button
              onClick={() => handleQuickLogin("coach")}
              type="button"
              className="flex flex-col items-start gap-1 rounded-lg border border-primary-500/30 bg-primary-100/40 p-4 text-left transition duration-300 hover:border-secondary-500 hover:bg-primary-100/60 focus:outline-none focus:ring-2 focus:ring-secondary-500 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-500/20 text-secondary-500 text-xs">C</span>
                <span className="font-bold text-xs text-white uppercase tracking-wider">{t("auth_quick_coach")}</span>
              </div>
              <span className="text-[10px] text-gray-400 leading-tight mt-1">{t("auth_quick_desc_coach")}</span>
            </button>

            <button
              onClick={() => handleQuickLogin("admin")}
              type="button"
              className="flex flex-col items-start gap-1 rounded-lg border border-primary-500/30 bg-primary-100/40 p-4 text-left transition duration-300 hover:border-secondary-500 hover:bg-primary-100/60 focus:outline-none focus:ring-2 focus:ring-secondary-500 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-500/20 text-secondary-500 text-xs">🔑</span>
                <span className="font-bold text-xs text-white uppercase tracking-wider">{t("auth_quick_admin")}</span>
              </div>
              <span className="text-[10px] text-gray-400 leading-tight mt-1">{t("auth_quick_desc_admin")}</span>
            </button>
          </div>

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-bold">
              {t("auth_email")}
              <input
                className="rounded-lg bg-primary-100 px-5 py-3 font-normal text-white outline-primary-500"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-bold">
              {t("auth_password")}
              <input
                className="rounded-lg bg-primary-100 px-5 py-3 font-normal text-white outline-primary-500"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error && <p className="text-sm font-bold text-primary-500">{error}</p>}

            <button
              className="rounded-md bg-secondary-500 px-10 py-3 font-bold uppercase tracking-wide text-white transition duration-300 hover:bg-primary-500 cursor-pointer"
              type="submit"
            >
              {t("auth_signin_btn")}
            </button>
          </form>

          <p className="mt-6 text-sm">
            Member demo: demo@gym.com / password
          </p>
          <p className="mt-2 text-sm">
            Admin demo: admin@gym.com / adminpassword
          </p>
          <p className="mt-2 text-sm">
            Coach demo: coach@gym.com / coachpassword
          </p>
          <p className="mt-6 text-sm">
            {t("auth_no_account")}{" "}
            <Link className="font-bold text-primary-500 underline" to="/register">
              {t("auth_create_link")}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Login;
