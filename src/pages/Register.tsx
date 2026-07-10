import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/auth/AuthContext";

const Register = () => {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Name, email, and password are required.");
      return;
    }

    register({ name, email, password });
    navigate("/profile", { replace: true });
  };

  return (
    <main className="min-h-screen bg-gray-20 px-6 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <Link to="/" className="w-fit">
          <img alt="Evogym logo" src={Logo} />
        </Link>

        <section className="rounded-md border-2 border-gray-100 bg-gray-50 px-8 py-10">
          <h1 className="font-montserrat text-4xl font-bold uppercase tracking-wide">Become a member</h1>
          <p className="mt-3 text-sm uppercase tracking-wide text-gray-500">
            Create a local prototype account and step into the member area.
          </p>

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-bold">
              Name
              <input
                className="rounded-lg bg-primary-100 px-5 py-3 font-normal text-white outline-primary-500"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

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
              Create Account
            </button>
          </form>

          <p className="mt-6 text-sm">
            Already have access?{" "}
            <Link className="font-bold text-primary-500 underline" to="/login">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Register;
