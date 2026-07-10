import { Link, useNavigate } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/auth/AuthContext";

const stats = [
  { label: "Active Members", value: "248" },
  { label: "New Leads", value: "37" },
  { label: "Classes Today", value: "12" },
  { label: "Capacity", value: "84%" },
];

const leads = [
  { name: "Karim Haddad", goal: "Strength program", status: "New" },
  { name: "Yacine B.", goal: "Performance coaching", status: "Contacted" },
  { name: "Samir D.", goal: "Membership pricing", status: "Trial booked" },
];

const classes = [
  { name: "Barbell Strength", time: "07:00", coach: "R. Malik" },
  { name: "HIIT Conditioning", time: "12:30", coach: "A. Farid" },
  { name: "Power Session", time: "19:00", coach: "M. Idris" },
];

const Admin = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <main className="min-h-screen bg-gray-20 px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <Link to="/" className="w-fit">
            <img alt="Evogym logo" src={Logo} />
          </Link>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              className="rounded-md border-2 border-primary-500 px-6 py-2 font-bold uppercase tracking-wide text-primary-300 transition duration-300 hover:bg-primary-500 hover:text-white"
              to="/profile"
            >
              Profile
            </Link>
            <button
              className="rounded-md bg-secondary-500 px-6 py-2 font-bold uppercase tracking-wide text-white transition duration-300 hover:bg-primary-500"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="rounded-md border-2 border-gray-100 bg-gray-50 px-8 py-10">
          <p className="text-sm font-bold uppercase tracking-wide text-primary-300">
            Admin Control
          </p>
          <h1 className="mt-2 font-montserrat text-5xl font-bold uppercase tracking-wide">
            Gym Operations
          </h1>
          <p className="mt-4 max-w-2xl text-gray-500">
            Prototype overview for leads, class flow, and member activity.
          </p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((item) => (
            <article
              className="rounded-md border border-gray-100 bg-primary-100 p-5"
              key={item.label}
            >
              <p className="text-sm font-bold uppercase tracking-wide text-gray-500">
                {item.label}
              </p>
              <p className="mt-3 font-montserrat text-4xl text-white">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="rounded-md border-2 border-gray-100 bg-gray-50 p-6">
            <h2 className="font-montserrat text-3xl uppercase tracking-wide">
              Lead Pipeline
            </h2>
            <div className="mt-6 flex flex-col gap-4">
              {leads.map((lead) => (
                <article
                  className="rounded-md bg-primary-100 p-4"
                  key={lead.name}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold uppercase tracking-wide">{lead.name}</p>
                    <p className="text-sm font-bold text-primary-300">{lead.status}</p>
                  </div>
                  <p className="mt-2 text-gray-500">{lead.goal}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-md border-2 border-gray-100 bg-gray-50 p-6">
            <h2 className="font-montserrat text-3xl uppercase tracking-wide">
              Today's Classes
            </h2>
            <div className="mt-6 flex flex-col gap-4">
              {classes.map((gymClass) => (
                <article
                  className="rounded-md bg-primary-100 p-4"
                  key={gymClass.name}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold uppercase tracking-wide">{gymClass.name}</p>
                    <p className="text-sm font-bold text-secondary-500">
                      {gymClass.time}
                    </p>
                  </div>
                  <p className="mt-2 text-gray-500">Coach {gymClass.coach}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Admin;
