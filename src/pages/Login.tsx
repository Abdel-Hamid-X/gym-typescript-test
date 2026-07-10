import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/auth/AuthContext";

type LocationState = {
  from?: Location;
};

const Login = () => {
  const { isAuthenticated, login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const redirectTo = locationState?.from?.pathname ?? "/profile";

  const [email, setEmail] = useState("demo@gym.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/profile"} replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!login(email, password)) {
      setError("Use demo@gym.com / password or admin@gym.com / adminpassword.");
      return;
    }

    if (email.trim().toLowerCase() === "admin@gym.com") {
      navigate("/admin", { replace: true });
    } else {
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <main className="min-h-screen bg-gray-20 px-6 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <Link to="/" className="w-fit">
          <img alt="Evogym logo" src={Logo} />
        </Link>

        <section className="rounded-md border-2 border-gray-100 bg-gray-50 px-8 py-10">
          <h1 className="font-montserrat text-4xl font-bold uppercase tracking-wide">Sign in</h1>
          <p className="mt-3 text-sm uppercase tracking-wide text-gray-500">
            Use the member or admin demo account to unlock the prototype.
          </p>

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-bold">
              Email
              <input
                className="rounded-lg bg-primary-100 px-5 py-3 font-normal text-white outline-primary-500"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-bold">
              Password
              <input
                className="rounded-lg bg-primary-100 px-5 py-3 font-normal text-white outline-primary-500"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error && <p className="text-sm font-bold text-primary-500">{error}</p>}

            <button
              className="rounded-md bg-secondary-500 px-10 py-3 font-bold uppercase tracking-wide text-white transition duration-300 hover:bg-primary-500"
              type="submit"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-sm">
            Member demo: demo@gym.com / password
          </p>
          <p className="mt-2 text-sm">
            Admin demo: admin@gym.com / admin123
          </p>
          <p className="mt-6 text-sm">
            New lifter?{" "}
            <Link className="font-bold text-primary-500 underline" to="/register">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Login;
