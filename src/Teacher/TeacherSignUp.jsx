import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import TurnstileCaptcha from "../components/TurnstileCaptcha";

async function hashVerificationCode(code) {
  const normalizedCode = code.trim().toUpperCase();
  const bytes = new TextEncoder().encode(normalizedCode);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function TeacherSignUp() {
  const navigate = useNavigate();
  const captchaRef = useRef(null);
  const errorRef = useRef(null);
  // const filePath =`${user.id}/profile.${fileExtension}`;
  const [captchaToken, setCaptchaToken] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    phone: "",
    email: "",
    teacherId: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
  });

  const [photo, setPhoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Show errors at the top of the page.
  const showError = (message) => {
    setError(message);
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setPhoto(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhoto(null);
      e.target.value = "";
      showError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhoto(null);
      e.target.value = "";
      showError("Teacher photo must be less than 5 MB.");
      return;
    }

    setError("");
    setPhoto(file);
  };

  const getPasswordError = (password) => {
    if (password.length < 6) {
      return "Your password must contain at least 6 characters.";
    }

    const missingRequirements = [];

    if (!/[a-z]/.test(password)) {
      missingRequirements.push("one lowercase letter (a–z)");
    }

    if (!/[A-Z]/.test(password)) {
      missingRequirements.push("one uppercase letter (A–Z)");
    }

    if (!/[0-9]/.test(password)) {
      missingRequirements.push("one number (0–9)");
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(password)) {
      missingRequirements.push("one special character (such as @, #, or !)");
    }

    if (missingRequirements.length === 1) {
      return `Your password must contain at least ${missingRequirements[0]}.`;
    }

    if (missingRequirements.length > 1) {
      const lastRequirement = missingRequirements.pop();

      return `Your password must contain at least ${missingRequirements.join(
        ", "
      )}, and ${lastRequirement}.`;
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.fullName.trim() ||
      !formData.fatherName.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.teacherId.trim() ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.verificationCode.trim()
    ) {
      showError("Please complete all required fields.");
      return;
    }

    if (!photo) {
      showError("Please upload a teacher photo.");
      return;
    }

    const passwordError = getPasswordError(formData.password);

    if (passwordError) {
      showError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Your passwords do not match. Please check them.");
      return;
    }

    if (!captchaToken) {
      showError("Please complete the human verification check.");
      return;
    }

    if (formData.verificationCode.trim().length < 6) {
      showError("Please enter your school-provided verification code.");
      return;
    }

    setLoading(true);


    // Validate the school-issued invitation first.
const {
  data: invitationData,
  error: invitationError,
} = await supabase.functions.invoke("validate-teacher-invite", {
  body: {
    teacherId: formData.teacherId.trim(),
    verificationCode: formData.verificationCode.trim(),
  },
});

if (invitationError) {
  throw new Error(
    invitationError.message || "Could not validate your school invitation."
  );
}

if (!invitationData?.valid || !invitationData?.teacherId) {
  throw new Error(
    "Your teacher ID or verification code is invalid or already used."
  );
}

const verifiedTeacherId = invitationData.teacherId;

    try {
      // 1. Create the teacher's Supabase Auth account.
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            captchaToken,
            data: {
              full_name: formData.fullName.trim(),
              role: "teacher",
            },
          },
        });


         console.log("Signup session exists:", !!authData?.session);
  console.log("Signup user ID:", authData?.user?.id);


      // Turnstile tokens are single-use.
      captchaRef.current?.reset();
      setCaptchaToken("");

      if (authError) {
        if (
          authError.message.toLowerCase().includes("already") ||
          authError.message.toLowerCase().includes("registered")
        ) {
          throw new Error(
            "An account with this email already exists. Please sign in."
          );
        }

        throw new Error(authError.message);
      }

      const user = authData.user;

      if (!user) {
        throw new Error("Teacher account could not be created.");
      }

      // 2. Prepare the teacher photo path.
      const fileExtension =
        photo.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${user.id}/profile.${fileExtension}`;

const { error: uploadError } = await supabase.storage
  .from("teacher-photos")
  .upload(filePath, photo, {
    upsert: true,
    contentType: photo.type,
  });

      if (uploadError) {
        throw new Error(`Photo upload failed: ${uploadError.message}`);
      }

      // 4. Get the public photo URL.
      const { data: publicUrlData } = supabase.storage
        .from("teacher-photos")
        .getPublicUrl(filePath);

      const photoUrl = publicUrlData?.publicUrl || null;

const verificationCodeHash = await hashVerificationCode(
  formData.verificationCode
);

     // 5. Submit the application as pending.
const { error: applicationError } = await supabase
  .from("teacher_applications")
  .insert({
    user_id: user.id,
    full_name: formData.fullName.trim(),
    father_name: formData.fatherName.trim(),
    phone: formData.phone.trim(),
    email: formData.email.trim(),
teacher_id: verifiedTeacherId,
    photo_url: photoUrl,
    verification_code_hash: verificationCodeHash,
    status: "pending",
  });
      if (applicationError) {
        throw new Error(
          `Application submission failed: ${applicationError.message}`
        );
      }

      setSuccess(
        "Your teacher application has been submitted and is waiting for admin approval."
      );

      setFormData({
        fullName: "",
        fatherName: "",
        phone: "",
        email: "",
        teacherId: "",
        password: "",
        confirmPassword: "",
        verificationCode: "",
      });

      setPhoto(null);

      // Bring the success message into view too.
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Teacher signup error:", err);
      showError(err.message || "Teacher registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
            Teacher Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#12355B] sm:text-4xl">
            Teacher Registration
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Register as a teacher using your school-provided verification
            information.
          </p>
        </div>

        {/* Error and success messages at the top */}
        {error && (
          <div
            ref={errorRef}
            role="alert"
            aria-live="assertive"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium leading-6 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-medium leading-6 text-green-700"
          >
            {success}
          </div>
        )}

        {/* Form Card */}
        <div className="rounded-3xl border border-[#DDE7EA] bg-white p-6 shadow-sm sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-bold text-[#12355B]">
                Personal Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    autoComplete="name"
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Father Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father name"
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="03XX XXXXXXX"
                    autoComplete="tel"
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Teacher ID
                  </label>
                  <input
                    type="text"
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleChange}
                    placeholder="School teacher ID"
                    autoCapitalize="characters"
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 uppercase outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Teacher Photo */}
            <div>
              <h2 className="text-xl font-bold text-[#12355B]">
                Teacher Photo
              </h2>

              <div className="mt-5 rounded-2xl border border-dashed border-[#DDE7EA] bg-slate-50 p-6">
                <label className="mb-2 block font-semibold text-[#12355B]">
                  Upload Photo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-slate-600"
                  required
                />

                <p className="mt-2 text-sm text-slate-500">
                  JPG, PNG, or another image format. Maximum 5 MB.
                </p>

                {photo && (
                  <p className="mt-3 text-sm font-medium text-[#00A6A6]">
                    Selected: {photo.name}
                  </p>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h2 className="text-xl font-bold text-[#12355B]">
                Account Information
              </h2>

              <div className="mt-5 space-y-5">
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
                    autoComplete="email"
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    required
                  />
                </div>

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
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 pr-24 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#00A6A6] hover:text-[#12355B]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Enter password again"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 pr-24 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#00A6A6] hover:text-[#12355B]"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* School Verification */}
            <div className="rounded-2xl border border-[#DDE7EA] bg-slate-50 p-6">
              <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
                School Verification
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#12355B]">
                Teacher Verification Code
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Enter the private verification code provided by the school
                administration.
              </p>

              <input
                type="password"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                placeholder="Enter verification code"
                autoComplete="off"
                className="mt-4 w-full rounded-xl border border-[#DDE7EA] bg-white px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                required
              />
            </div>

            {/* CAPTCHA */}
            <div className="rounded-xl border border-[#DDE7EA] bg-slate-50 px-3 py-4">
              <p className="mb-3 text-center text-sm font-medium text-[#12355B]">
                Verify that you are human
              </p>

              <TurnstileCaptcha
                ref={captchaRef}
                onToken={setCaptchaToken}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full rounded-xl bg-[#12355B] px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#00A6A6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Submitting Application..."
                : "Submit Teacher Application"}
            </button>

            {/* Login */}
            <p className="text-center text-sm text-slate-600">
              Already have an approved teacher account?{" "}
              <Link
                to="/teacher-login"
                className="font-semibold text-[#00A6A6] hover:text-[#12355B]"
              >
                Teacher Login
              </Link>
            </p>

            {/* Back */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-sm font-semibold text-slate-500 transition hover:text-[#12355B]"
              >
                ← Back to website
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeacherSignUp;