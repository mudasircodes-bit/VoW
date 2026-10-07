import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../lib/supabaseClient";

function StudentDashboard() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIdCard, setShowIdCard] = useState(false);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          navigate("/login");
          return;
        }

        const { data, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("id", user.id)
          .single();

        if (studentError) {
          throw new Error(studentError.message);
        }

        setStudent(data);
      } catch (err) {
        console.error("Student loading error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    navigate("/login");
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DDE7EA] border-t-[#00A6A6]" />

          <p className="mt-4 font-semibold text-[#12355B]">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-[#12355B] px-6 py-5 text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <p className="text-sm text-[#00A6A6]">Student Portal</p>
              <h1 className="text-2xl font-bold">Student Dashboard</h1>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-white px-5 py-2 font-semibold text-[#12355B] transition hover:bg-[#00A6A6] hover:text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h2 className="font-bold">Unable to load student information</h2>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-[#12355B] px-6 py-5 text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <p className="text-sm text-[#00A6A6]">Student Portal</p>

              <h1 className="text-2xl font-bold">
                Student Dashboard
              </h1>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-white px-5 py-2 font-semibold text-[#12355B] transition hover:bg-[#00A6A6] hover:text-white"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-10">
          {/* Welcome */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#12355B]">
              Welcome, {student.full_name} 👋
            </h2>

            <p className="mt-2 text-slate-600">
              Here is your student profile and academic information.
            </p>
          </div>

          {/* Student Profile Card */}
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="bg-[#12355B] px-6 py-5 text-white">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#00A6A6]">
                Student Profile
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                Personal Information
              </h3>
            </div>

            <div className="grid gap-8 p-6 md:grid-cols-[1fr_260px] md:p-8">
              {/* Information - Left */}
              <div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Full Name
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#12355B]">
                      {student.full_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Father Name
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#12355B]">
                      {student.father_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Admission Number
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#00A6A6]">
                      {student.admission_number}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Date of Birth
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#12355B]">
                      {student.date_of_birth || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Phone
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#12355B]">
                      {student.phone || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Class
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#12355B]">
                      {student.class_name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Section
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#12355B]">
                      {student.section || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Course / Program
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#12355B]">
                      {student.course || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#DDE7EA] pt-6">
                  <p className="text-sm font-semibold text-slate-500">
                    Address
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#12355B]">
                    {student.address || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Photo - Right */}
              <div className="flex flex-col items-center justify-start">
                <div className="w-full max-w-[240px] overflow-hidden rounded-2xl border-4 border-[#00A6A6] bg-slate-100 shadow-lg">
                  {student.photo_url ? (
                    <img
                      src={student.photo_url}
                      alt={student.full_name}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-center text-sm font-semibold text-slate-500">
                      No student photo
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Print ID Card Button */}
            <div className="border-t border-[#DDE7EA] bg-slate-50 px-6 py-5 md:px-8">
              <button
                onClick={() => setShowIdCard(true)}
                className="rounded-xl bg-[#12355B] px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#00A6A6] hover:shadow-lg"
              >
                🪪 Print ID Card
              </button>
            </div>
          </section>

          {/* Stats */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold text-slate-500">
                Enrolled Course
              </p>

              <h3 className="mt-3 text-xl font-bold text-[#12355B]">
                {student.course || "Not assigned"}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold text-slate-500">
                Attendance
              </p>

              <h3 className="mt-3 text-3xl font-bold text-[#00A6A6]">
                92%
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold text-slate-500">
                Assignments
              </p>

              <h3 className="mt-3 text-3xl font-bold text-[#12355B]">
                8
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold text-slate-500">
                Result
              </p>

              <h3 className="mt-3 text-3xl font-bold text-[#00A6A6]">
                A
              </h3>
            </div>
          </div>

          {/* Dashboard Sections */}
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {/* Course */}
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-[#12355B]">
                My Course
              </h3>

              <p className="mt-3 text-slate-600">
                {student.course || "No course assigned"}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Class: {student.class_name || "Not assigned"}
                {student.section ? ` • Section ${student.section}` : ""}
              </p>

              <button className="mt-6 rounded-lg bg-[#12355B] px-5 py-3 font-semibold text-white transition hover:bg-[#00A6A6]">
                View Course
              </button>
            </div>

            {/* Notices */}
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-[#12355B]">
                Recent Notices
              </h3>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-[#12355B]">
                    Monthly Test
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Monthly assessment will be held soon.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-[#12355B]">
                    Class Schedule
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Check your updated class schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ================= ID CARD POPUP ================= */}
      {showIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            {/* Popup Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#00A6A6]">
                  Student Portal
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#12355B] sm:text-3xl">
                  Student ID Card
                </h2>
              </div>

              <button
                onClick={() => setShowIdCard(false)}
                className="text-3xl font-bold text-slate-400 transition hover:text-[#12355B]"
              >
                ×
              </button>
            </div>

            {/* Cards */}
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
                    src={student.photo_url}
                    alt={student.full_name}
                    className="h-44 w-36 rounded-xl border-4 border-[#00A6A6] object-cover"
                  />

                  <h3 className="mt-5 text-xl font-bold text-[#12355B]">
                    {student.full_name}
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
                      {student.full_name}
                    </p>

                    <p>
                      <span className="font-semibold text-[#12355B]">
                        Father Name:
                      </span>{" "}
                      {student.father_name}
                    </p>

                    <p>
                      <span className="font-semibold text-[#12355B]">
                        Admission No:
                      </span>{" "}
                      {student.admission_number}
                    </p>

                    <p>
                      <span className="font-semibold text-[#12355B]">
                        Class:
                      </span>{" "}
                      {student.class_name}
                    </p>

                    <p>
                      <span className="font-semibold text-[#12355B]">
                        Section:
                      </span>{" "}
                      {student.section}
                    </p>

                    <p>
                      <span className="font-semibold text-[#12355B]">
                        Course:
                      </span>{" "}
                      {student.course}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <QRCodeCanvas
                      value={student.admission_number}
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
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={handlePrint}
                className="rounded-xl bg-[#12355B] px-7 py-3 font-semibold text-white transition hover:bg-[#00A6A6]"
              >
                🖨 Print ID Card
              </button>

              <button
                onClick={() => setShowIdCard(false)}
                className="rounded-xl border-2 border-[#12355B] px-7 py-3 font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
              >
                Close
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

export default StudentDashboard;