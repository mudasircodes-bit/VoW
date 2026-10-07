import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function TeacherSignUp() {
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setPhoto(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      setPhoto(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Teacher photo must be less than 5 MB.");
      setPhoto(null);
      return;
    }

    setError("");
    setPhoto(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.fullName ||
      !formData.fatherName ||
      !formData.phone ||
      !formData.email ||
      !formData.teacherId ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.verificationCode
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!photo) {
      setError("Please upload a teacher photo.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      /*
       * STEP 1
       * Verify the teacher's private school verification code.
       *
       * IMPORTANT:
       * The actual school verification code should NOT be hard-coded
       * in this React file.
       *
       * For now, this checks that the application contains a code.
       * We will connect the code to a secure Supabase verification
       * system in the next step.
       */

      if (formData.verificationCode.trim().length < 6) {
        throw new Error("Please enter a valid teacher verification code.");
      }

      /*
       * STEP 2
       * Create the teacher's Supabase Auth account.
       */

      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName.trim(),
              role: "teacher",
            },
          },
        });

      if (authError) {
        throw authError;
      }

      const user = authData.user;

      if (!user) {
        throw new Error("Teacher account could not be created.");
      }

      /*
       * STEP 3
       * Upload teacher photo.
       *
       * This requires a Supabase Storage bucket named:
       * teacher-photos
       */

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
        throw uploadError;
      }

      /*
       * STEP 4
       * Get public photo URL.
       */

      const { data: publicUrlData } = supabase.storage
        .from("teacher-photos")
        .getPublicUrl(filePath);

      const photoUrl = publicUrlData?.publicUrl || null;

      /*
       * STEP 5
       * Create teacher application.
       *
       * Status remains "pending".
       * Admin must approve the teacher.
       */

      const { error: applicationError } = await supabase
        .from("teacher_applications")
        .insert({
          full_name: formData.fullName.trim(),
          father_name: formData.fatherName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          teacher_id: formData.teacherId.trim(),
          photo_url: photoUrl,
          verification_code: formData.verificationCode.trim(),
          status: "pending",
        });

      if (applicationError) {
        throw applicationError;
      }

      /*
       * STEP 6
       * Tell the teacher that the application is waiting
       * for administration approval.
       */

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
    } catch (err) {
      console.error("Teacher signup error:", err);
      setError(err.message || "Teacher registration failed.");
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

        {/* Form Card */}
        <div className="rounded-3xl border border-[#DDE7EA] bg-white p-6 shadow-sm sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-bold text-[#12355B]">
                Personal Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {/* Full Name */}
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
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    required
                  />
                </div>

                {/* Father Name */}
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

                {/* Phone */}
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
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    required
                  />
                </div>

                {/* Teacher ID */}
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
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 uppercase outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Photo */}
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
                    placeholder="teacher@example.com"
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    required
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
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 pr-24 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                      required
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

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Confirm Password
                  </label>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Enter password again"
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Verification */}
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
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                placeholder="Enter verification code"
                className="mt-4 w-full rounded-xl border border-[#DDE7EA] bg-white px-4 py-3 uppercase outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl bg-green-50 px-4 py-4 text-sm font-medium text-green-700">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#12355B] px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#00A6A6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting Application..." : "Submit Teacher Application"}
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