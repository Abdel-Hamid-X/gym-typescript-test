import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-20 px-6">
      <section className="max-w-md rounded-md border-2 border-gray-100 bg-gray-50 px-8 py-10 text-center">
        <h1 className="font-montserrat text-4xl font-bold uppercase tracking-wide">Page not found</h1>
        <p className="mt-4 text-sm uppercase tracking-wide text-gray-500">
          The page you are looking for is not part of this prototype.
        </p>
        <Link
          className="mt-8 inline-block rounded-md bg-secondary-500 px-8 py-3 font-bold uppercase tracking-wide text-white transition duration-300 hover:bg-primary-500"
          to="/"
        >
          Back Home
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
