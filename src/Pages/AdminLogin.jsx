
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import TurnstileCaptcha from "../components/TurnstileCaptcha";

function AdminLogin() {
  const navigate = useNavigate();

  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const resetCaptcha = () => {
    setCaptchaToken("");
    captchaRef.current?.reset?.();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Get the latest CAPTCHA token.
    const token =
      captchaRef.current?.getResponse?.() || captchaToken;

    if (!token) {
      setErrorMessage(
        "Please complete the Cloudflare security check first."
      );
      return;
    }

    setLoading(true);

    try {
      // Sign in and send the CAPTCHA token to Supabase.
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            captchaToken: token,
          },
        });

      if (loginError) {
        setErrorMessage(loginError.message);
        resetCaptcha();
        return;
      }

      const user = data.user;

      if (!user) {
        setErrorMessage("Unable to verify your account.");
        resetCaptcha();
        return;
      }

      // Verify that this account has the admin role.
      const { data: roleData, error: roleError } =
        await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

      if (roleError || roleData?.role !== "admin") {
        await supabase.auth.signOut();

        setErrorMessage(
          "This account is not authorized for administration."
        );

        resetCaptcha();
        return;
      }

      navigate("/admin-dashboard", { replace: true });
    } catch (err) {
      setErrorMessage(
        err.message || "An unexpected login error occurred."
      );
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#DDE7EA] bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <img
            src="/log.jpg"
            alt="The Voice of Wisdom"
            className="mx-auto mb-4 h-20 w-20 object-contain"
          />

          <h1 className="text-2xl font-bold text-[#12355B]">
            Administration Login
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Authorized administration only
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#12355B]">
              Admin Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter admin email"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#12355B]">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
            />
          </div>

          <TurnstileCaptcha
            ref={captchaRef}
            onToken={setCaptchaToken}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#12355B] px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0e2947] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking Access..." : "Admin Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
