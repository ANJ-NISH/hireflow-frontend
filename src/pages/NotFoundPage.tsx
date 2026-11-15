import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">404</p>
        <p className="mt-2 font-display text-xl font-semibold text-ink">Page not found</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-deep"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}