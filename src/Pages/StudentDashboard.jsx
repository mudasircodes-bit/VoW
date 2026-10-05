import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function StudentDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
    return;
  }

  navigate("/login");
};
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-[#12355B] px-6 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>
            <p className="text-sm text-[#00A6A6]">
              Student Portal
            </p>

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

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#12355B]">
            Welcome, Student 👋
          </h2>

          <p className="mt-2 text-slate-600">
            Here is an overview of your academic information.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm font-semibold text-slate-500">
              Enrolled Course
            </p>

            <h3 className="mt-3 text-xl font-bold text-[#12355B]">
              English Language
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

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-[#12355B]">
              My Course
            </h3>

            <p className="mt-3 text-slate-600">
              English Language Program
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Current Class: English Level 1
            </p>

            <button className="mt-6 rounded-lg bg-[#12355B] px-5 py-3 font-semibold text-white transition hover:bg-[#00A6A6]">
              View Course
            </button>
          </div>

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
  );
}

export default StudentDashboard;