import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useRef, useState } from "react";
import TurnstileCaptcha from "../components/TurnstileCaptcha";

function TeacherLogin() {
  const navigate = useNavigate();
  const captchaRef = useRef(null);

  const [captchaToken, setCaptchaToken] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

 const handleForgotPassword = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrorMessage("");
  setSuccessMessage("");

  try {
    const email = formData.email.trim();

    if (!email) {
      setErrorMessage("Please enter your teacher email.");
      return;
    }

    const token =
      captchaRef.current?.getResponse?.() || captchaToken;

    if (!token) {
      setErrorMessage(
        "Please complete the CAPTCHA verification before continuing."
      );
      return;
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          window.location.origin + "/reset-password",
        captchaToken: token,
      });

    if (error) {
      throw error;
    }

    setSuccessMessage(
      "If an account exists for this email, a reset link will be sent. Check your inbox and spam folder."
    );
  } catch (error) {
    setErrorMessage(
      error.message || "Unable to send the reset email."
    );
  } finally {
    captchaRef.current?.reset?.();
    setCaptchaToken("");
    setLoading(false);
  }
};
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken,
      });

      if (error) throw error;

      setSuccessMessage(
        "If an account exists for this email, a password-reset link will be sent. Please check your inbox and spam folder."
      );
      setCaptchaToken("");
      captchaRef.current?.reset?.();
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to send the reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) throw error;

      const user = data.user;

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleError || roleData?.role !== "teacher") {
        await supabase.auth.signOut();
        setErrorMessage(
          "This account is not authorized for the Teacher Portal."
        );
        return;
      }

      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (teacherError || !teacherData) {
        await supabase.auth.signOut();
        setErrorMessage(
          "Your teacher account is not approved or activated yet."
        );
        return;
      }

      navigate("/teacher-dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "Invalid email or password."
          : error.message || "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const returnToLogin = () => {
    setForgotPassword(false);
    setErrorMessage("");
    setSuccessMessage("");
    setCaptchaToken("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-[#DDE7EA] bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <img
            src="/log.jpg"
            alt="The Voice of Wisdom"
            className="mx-auto mb-4 h-20 w-20 object-contain"
          />

          <p className="text-sm font-semibold uppercase tracking-wider text-[#00A6A6]">
            Teacher Portal
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#12355B]">
            {forgotPassword ? "Reset Your Password" : "Teacher Login"}
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            {forgotPassword
              ? "Enter your teacher email to receive a password-reset link."
              : "Sign in using your approved teacher account."}
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          >
            {successMessage}
          </div>
        )}

        {forgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label
                htmlFor="reset-email"
                className="mb-2 block text-sm font-semibold text-[#12355B]"
              >
                Teacher Email
              </label>

              <input
                id="reset-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter teacher email"
                required
                autoComplete="email"
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
              className="w-full rounded-lg bg-[#12355B] px-5 py-3 font-semibold text-white transition hover:bg-[#00A6A6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={returnToLogin}
              className="w-full text-sm font-semibold text-[#00A6A6] hover:underline"
            >
              ← Back to Teacher Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="teacher-email"
                className="mb-2 block text-sm font-semibold text-[#12355B]"
              >
                Teacher Email
              </label>

              <input
                id="teacher-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter teacher email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
              />
            </div>

            <div>
              <label
                htmlFor="teacher-password"
                className="mb-2 block text-sm font-semibold text-[#12355B]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="teacher-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter teacher password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[#DDE7EA] px-4 py-3 pr-20 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#00A6A6] hover:text-[#12355B]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setForgotPassword(true);
                    setErrorMessage("");
                    setSuccessMessage("");
                    setCaptchaToken("");
                  }}
                  className="text-sm font-semibold text-[#00A6A6] hover:text-[#12355B] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <TurnstileCaptcha
              ref={captchaRef}
              onToken={setCaptchaToken}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#12355B] px-5 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00A6A6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking..." : "Teacher Login"}
            </button>
          </form>
        )}

        {!forgotPassword && (
          <div className="mt-6 text-center">
            <p className="text-sm text-[#64748B]">
              Don't have an approved teacher account?
            </p>

            <button
              type="button"
              onClick={() => navigate("/teacher-signup")}
              className="mt-1 text-sm font-semibold text-[#00A6A6] hover:underline"
            >
              Apply as a Teacher
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherLogin;
