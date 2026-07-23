import { Link, useNavigate } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/auth/AuthContext";
import { getLocalizedPlanContent, useLanguage } from "@/shared/LanguageContext";

const SubscriptionPlans = () => {
  const { user, subscriptionPlans, subscribeCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleSubscribe = async (planName: string) => {
    await subscribeCurrentUser(planName);
    navigate("/profile", { replace: true });
  };

  return (
    <main
      className={`min-h-screen bg-gray-20 px-6 py-10 text-white ${isRtl ? "rtl text-right" : "ltr text-left"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <Link to="/" className="w-fit">
            <img alt="Evogym logo" src={Logo} />
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-md border-2 border-primary-500 px-6 py-2 font-bold uppercase tracking-wide text-primary-300 transition duration-300 hover:bg-primary-500 hover:text-white"
              to="/profile"
            >
              {t("plans_profile")}
            </Link>
            <button
              className="rounded-md bg-secondary-500 px-6 py-2 font-bold uppercase tracking-wide text-white transition duration-300 hover:bg-primary-500"
              onClick={handleLogout}
              type="button"
            >
              {t("plans_logout")}
            </button>
          </div>
        </header>

        <section className="rounded-md border-2 border-gray-100 bg-gray-50 px-8 py-10">
          <p className="text-sm font-bold uppercase tracking-wide text-primary-300">
            {t("plans_subtitle")}
          </p>
          <h1 className="mt-2 font-montserrat text-5xl font-bold uppercase tracking-wide">
            {t("plans_heading")}
          </h1>
          <p className="mt-4 max-w-2xl text-gray-500">
            {t("plans_proto")}
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {subscriptionPlans.map((plan) => {
            const isCurrentPlan = user?.membershipStatus === plan.name;
            const displayedPlan = getLocalizedPlanContent(plan, language);

            return (
              <article
                className={`flex min-h-[360px] flex-col rounded-md border-2 bg-gray-50 p-6 transition duration-300 ${isCurrentPlan
                    ? "border-secondary-500"
                    : "border-gray-100 hover:border-primary-500"
                  }`}
                key={plan.id}
              >
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-primary-300">
                    {isCurrentPlan ? t("plans_current_plan") : t("plans_available")}
                  </p>
                  <h2 className="mt-3 font-montserrat text-4xl uppercase tracking-wide">
                    {displayedPlan.name}
                  </h2>
                  <p className="mt-3 text-gray-500">{displayedPlan.description}</p>
                  <p className={`mt-6 font-montserrat text-5xl text-white ${isRtl ? "numbers" : ""}`}>
                    {plan.price.toLocaleString("fr-DZ")} DA
                    <span className={`${isRtl ? "mr-2" : "ml-2"} font-dmsans text-base text-gray-500`}>{t("plans_monthly")}</span>
                  </p>
                </div>

                <ul className={`mt-6 flex flex-1 flex-col gap-3 text-sm text-gray-300`}>
                  {displayedPlan.features.map((feature) => (
                    <li className="border-b border-gray-100 pb-2" key={feature}>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className="mt-8 rounded-md bg-secondary-500 px-6 py-3 font-bold uppercase tracking-wide text-white transition duration-300 hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isCurrentPlan}
                  onClick={() => handleSubscribe(plan.name)}
                  type="button"
                >
                  {isCurrentPlan ? t("plans_active") : t("plans_select")}
                </button>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default SubscriptionPlans;
