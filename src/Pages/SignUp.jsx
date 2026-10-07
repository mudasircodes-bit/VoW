import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../lib/supabaseClient";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    classSection: "",
    course: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Grade 1A to Grade 8D
  const schoolClasses = [];

  for (let grade = 1; grade <= 8; grade++) {
    for (const section of ["A", "B", "C", "D"]) {
      schoolClasses.push(`${grade}${section}`);
    }
  }

  const isEnglishProgram =
    formData.course === "English Language Program";

  const [photo, setPhoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ID card popup
  const [showIdCard, setShowIdCard] = useState(false);
  const [studentCard, setStudentCard] = useState(null);

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
      setError("Please select a valid image file.");
      setPhoto(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Student photo must be smaller than 5 MB.");
      setPhoto(null);
      return;
    }

    setError("");
    setPhoto(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!photo) {
      setError("Student photo is required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // School students must select a class.
    // English Language Program students do not need one.
    if (!isEnglishProgram && !formData.classSection) {
      setError("Please select a class and section.");
      return;
    }

    setLoading(true);

    try {
      // =========================================
      // 1. CREATE SUPABASE AUTH ACCOUNT
      // =========================================

      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        });

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
        throw new Error("Account could not be created.");
      }

      // =========================================
      // 2. GENERATE ADMISSION NUMBER
      // =========================================

      const admissionNumber = `VW-${new Date().getFullYear()}-${user.id
        .replace(/-/g, "")
        .substring(0, 8)
        .toUpperCase()}`;

      // =========================================
      // 3. FIND SELECTED CLASS
      // =========================================

      let classId = null;

      if (!isEnglishProgram) {
        const { data: selectedClass, error: classError } =
          await supabase
            .from("classes")
            .select("id")
            .eq("class_name", formData.classSection)
            .single();

        if (classError || !selectedClass) {
          throw new Error(
            "The selected class could not be found."
          );
        }

        classId = selectedClass.id;
      }

      // =========================================
      // 4. PREPARE PHOTO PATH
      // =========================================

      const fileExtension =
        photo.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${user.id}/profile.${fileExtension}`;

      // =========================================
      // 5. UPLOAD STUDENT PHOTO
      // =========================================

      const { error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(filePath, photo, {
          upsert: true,
          contentType: photo.type,
        });

      if (uploadError) {
        throw new Error(
          `Photo upload failed: ${uploadError.message}`
        );
      }

      // =========================================
      // 6. GET PUBLIC PHOTO URL
      // =========================================

      const { data: publicUrlData } = supabase.storage
        .from("student-photos")
        .getPublicUrl(filePath);

      const photoUrl = publicUrlData.publicUrl;

      // =========================================
      // 7. SAVE STUDENT INFORMATION
      // =========================================

      const { error: studentError } = await supabase
        .from("students")
        .insert({
          id: user.id,
          admission_number: admissionNumber,
          full_name: formData.fullName,
          father_name: formData.fatherName,
          date_of_birth: formData.dateOfBirth || null,
          phone: formData.phone,
          address: formData.address,
          class_id: classId,
          course: formData.course,
          photo_url: photoUrl,
        });

      if (studentError) {
        throw new Error(
          `Student information could not be saved: ${studentError.message}`
        );
      }

      // =========================================
      // 8. PREPARE STUDENT ID CARD
      // =========================================

      const newStudentCard = {
        full_name: formData.fullName,
        father_name: formData.fatherName,
        admission_number: admissionNumber,
        class_section: formData.classSection,
        course: formData.course,
        photo_url: photoUrl,
      };

      setStudentCard(newStudentCard);

      // =========================================
      // 9. SHOW ID CARD POPUP
      // =========================================

      setShowIdCard(true);

      setMessage("Account created successfully!");

      // =========================================
      // 10. CLEAR SIGNUP FORM
      // =========================================

      setFormData({
        fullName: "",
        fatherName: "",
        dateOfBirth: "",
        phone: "",
        address: "",
        classSection: "",
        course: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setPhoto(null);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleContinue = () => {
    setShowIdCard(false);
    navigate("/student-dashboard");
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl bg-white p-8 shadow-xl sm:p-12">
            <div className="mx-auto max-w-2xl">

              <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
                Create Account
              </p>

              <h1 className="mt-3 text-3xl font-bold text-[#12355B]">
                Student Sign Up
              </h1>

              <p className="mt-3 text-slate-600">
                Enter your information to create your student account.
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

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >

                {/* Student Photo */}
                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Student Photo
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    required
                    className="w-full rounded-xl border border-[#DDE7EA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    JPG, PNG or other image format. Maximum 5 MB.
                  </p>
                </div>

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
                    required
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
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
                    placeholder="Enter father's name"
                    required
                    className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                  />
                </div>

                {/* DOB + Phone */}
                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block font-semibold text-[#12355B]">
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-[#12355B]">
                      Phone
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="03XX-XXXXXXX"
                      required
                      className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    />
                  </div>

                </div>

                {/* Address */}
                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                    rows="3"
                    required
                    className="w-full resize-none rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                  />
                </div>

                {/* Class / Section */}
                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Class / Section
                  </label>

                  <select
                    name="classSection"
                    value={formData.classSection}
                    onChange={handleChange}
                    required={!isEnglishProgram}
                    disabled={isEnglishProgram}
                    className="w-full rounded-xl border border-[#DDE7EA] bg-white px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {isEnglishProgram
                        ? "Not required for English Language Program"
                        : "Select class / section"}
                    </option>

                    {!isEnglishProgram &&
                      schoolClasses.map((classSection) => (
                        <option
                          key={classSection}
                          value={classSection}
                        >
                          {classSection}
                        </option>
                      ))}
                  </select>

                  {!isEnglishProgram && (
                    <p className="mt-2 text-xs text-slate-500">
                      Select your exact class and section.
                    </p>
                  )}
                </div>

                {/* Course */}
                <div>
                  <label className="mb-2 block font-semibold text-[#12355B]">
                    Course / Program
                  </label>

                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#DDE7EA] bg-white px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                  >
                    <option value="">
                      Select course / program
                    </option>

                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>

                    <option value="English Language Program">
                      English Language Program
                    </option>
                  </select>
                </div>

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
                      placeholder="Create a password"
                      required
                      className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 pr-20 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
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

                  <div className="relative">
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 pr-20 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#00A6A6] hover:text-[#12355B]"
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#12355B] px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#00A6A6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Student Account"}
                </button>
              </form>

              <p className="mt-8 text-center text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#00A6A6] transition hover:text-[#12355B]"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ID CARD POPUP ================= */}

      {showIdCard && studentCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">

          <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">

            {/* Popup Header */}
            <div className="mb-6 flex items-center justify-between gap-4">

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#00A6A6]">
                  Registration Successful
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#12355B] sm:text-3xl">
                  Your Student ID Card
                </h2>
              </div>

              <button
                type="button"
                onClick={handleContinue}
                className="text-2xl font-bold text-slate-400 transition hover:text-[#12355B]"
              >
                ×
              </button>
            </div>

            <p className="mb-7 text-slate-600">
              Your student account has been created. Your ID card is ready.
            </p>

            {/* ID Cards */}
            <div className="grid gap-6 md:grid-cols-2">

              {/* FRONT */}
              <div className="id-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">

                <div className="bg-[#12355B] px-6 py-6 text-center text-white">

                  <img
                    src={`${import.meta.env.BASE_URL}log.jpg`}
                    alt="VoW Logo"
                    className="mx-auto h-16 w-auto object-contain"
                  />

                  <h3 className="mt-3 text-lg font-bold">
                    THE VOICE OF WISDOM
                  </h3>

                  <p className="text-sm text-[#00A6A6]">
                    School & English Language Center
                  </p>

                </div>

                <div className="flex flex-col items-center px-6 py-8">

                  <img
                    src={studentCard.photo_url}
                    alt={studentCard.full_name}
                    className="h-44 w-36 rounded-xl border-4 border-[#00A6A6] object-cover"
                  />

                  <h3 className="mt-5 text-xl font-bold text-[#12355B]">
                    {studentCard.full_name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Student • {new Date().getFullYear()}
                  </p>

                  <div className="mt-6 w-full border-t border-slate-200 pt-5 text-center">

                    <p className="text-xs font-semibold uppercase tracking-wider text-[#00A6A6]">
                      Official Student Identification Card
                    </p>

                  </div>

                </div>
              </div>

              {/* BACK */}
              <div className="id-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">

                <div className="bg-[#12355B] px-6 py-6 text-center text-white">

                  <p className="text-sm font-semibold text-[#00A6A6]">
                    STUDENT IDENTIFICATION
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    STUDENT CARD
                  </h3>

                </div>

                <div className="px-6 py-7">

                  <div className="space-y-3 text-sm">

                    <p>
                      <span className="font-semibold text-[#12355B]">
                        Name:
                      </span>{" "}
                      {studentCard.full_name}
                    </p>

                    <p>
                      <span className="font-semibold text-[#12355B]">
                        Father Name:
                      </span>{" "}
                      {studentCard.father_name}
                    </p>

                    <p>
                      <span className="font-semibold text-[#12355B]">
                        Admission No:
                      </span>{" "}
                      {studentCard.admission_number}
                    </p>

                    <p>
                      <span className="font-semibold text-[#12355B]">
                        Class / Section:
                      </span>{" "}
                      {studentCard.class_section || "N/A"}
                    </p>

                    <p>
                      <span className="font-semibold text-[#12355B]">
                        Course:
                      </span>{" "}
                      {studentCard.course}
                    </p>

                  </div>

                  <div className="mt-6 flex justify-center">

                    <QRCodeCanvas
                      value={studentCard.admission_number}
                      size={140}
                      level="H"
                    />

                  </div>

                  <p className="mt-3 text-center text-xs text-slate-500">
                    Scan this QR code to identify the student.
                  </p>

                </div>
              </div>

            </div>

            {/* Popup Buttons */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <button
                type="button"
                onClick={handlePrint}
                className="rounded-xl bg-[#12355B] px-7 py-3 font-semibold text-white transition hover:bg-[#00A6A6]"
              >
                🖨 Print ID Card
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="rounded-xl border-2 border-[#12355B] px-7 py-3 font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
              >
                Continue to Dashboard
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Print Styling */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }

          body > * {
            visibility: hidden;
          }

          .id-card {
            visibility: visible !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            break-inside: avoid;
          }

          .id-card * {
            visibility: visible !important;
          }
        }
      `}</style>
    </>
  );
}

export default SignUp;