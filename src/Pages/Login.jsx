import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/student-dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">

          {/* Left Side */}
          <div className="hidden bg-[#12355B] p-12 lg:flex lg:flex-col lg:justify-center">

            <img
              src="/log.jpg"
              alt="The Voice of Wisdom Logo"
              className="mb-8 h-20 w-20 rounded-2xl object-contain"
            />

            <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
              Student Portal
            </p>

            <h1 className="mt-3 text-4xl font-bold leading-tight text-white">
              Welcome Back to
              <br />
              The Voice of Wisdom
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-slate-200">
              Access your student dashboard, courses, academic information,
              notices, and other school resources from one place.
            </p>

          </div>

          {/* Right Side */}
          <div className="p-8 sm:p-12">

            <div className="mx-auto max-w-md">

              <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
                Student Login
              </p>

              <h2 className="mt-3 text-3xl font-bold text-[#12355B]">
                Sign in to your account
              </h2>

              <p className="mt-3 text-slate-600">
                Enter your credentials to access your student portal.
              </p>

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                {/* Email */}
                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
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
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between text-sm">

                  <label className="flex items-center gap-2 text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#00A6A6]"
                    />
                    Remember me
                  </label>

                  <Link
                    to="/forgot-password"
                    className="font-semibold text-[#00A6A6] transition hover:text-[#12355B]"
                  >
                    Forgot Password?
                  </Link>

                </div>

                {/* Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#12355B] px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#00A6A6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>

              </form>

              <p className="mt-8 text-center text-slate-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-[#00A6A6] transition hover:text-[#12355B]"
                >
                  Create an account
                </Link>
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;