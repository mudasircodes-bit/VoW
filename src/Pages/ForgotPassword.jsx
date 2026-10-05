import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      "If an account exists with this email, a password reset link has been sent."
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">

        <div className="w-full rounded-3xl bg-white p-8 shadow-xl sm:p-12">

          <div className="mx-auto max-w-md">

            <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
              Account Recovery
            </p>

            <h1 className="mt-3 text-3xl font-bold text-[#12355B]">
              Forgot Password?
            </h1>

            <p className="mt-3 leading-7 text-slate-600">
              Enter your registered email address and we'll send you a link to
              create a new password.
            </p>

            {message && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium leading-6 text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">

              <div>
                <label className="mb-2 block font-semibold text-[#12355B]">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#12355B] px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#00A6A6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

            </form>

            <p className="mt-8 text-center text-slate-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#00A6A6] hover:text-[#12355B]"
              >
                Back to Login
              </Link>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;