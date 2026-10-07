import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function AdminAccess() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleContinue = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    /*
      The real administration access check will be connected
      to a secure Supabase Edge Function.
      Do NOT put the real admin access password in this file.
    */

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      setLoading(false);
      navigate("/admin-login");
      return;
    }

    setLoading(false);
    navigate("/admin-login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <img
            src="/log.jpg"
            alt="The Voice of Wisdom"
            className="mx-auto mb-5 h-20 w-20 object-contain"
          />

          <p className="text-sm font-semibold uppercase tracking-wider text-[#00A6A6]">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#12355B]">
            Administration Access
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter the administration access password to continue.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleContinue}>
          <label className="mb-2 block text-sm font-semibold text-[#12355B]">
            Access Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access password"
              required
              className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 pr-20 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#00A6A6] hover:text-[#12355B]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#12355B] px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#00A6A6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm font-medium text-[#00A6A6] hover:underline"
          >
            ← Back to Website
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAccess;