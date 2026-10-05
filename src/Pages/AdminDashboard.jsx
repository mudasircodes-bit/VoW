function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-[#12355B] px-6 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>
            <p className="text-sm text-[#00A6A6]">
              Administration
            </p>

            <h1 className="text-2xl font-bold">
              Admin Dashboard
            </h1>
          </div>

          <button className="rounded-lg bg-white px-5 py-2 font-semibold text-[#12355B] transition hover:bg-[#00A6A6] hover:text-white">
            Logout
          </button>

        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#12355B]">
            Administration Overview
          </h2>

          <p className="mt-2 text-slate-600">
            Manage students, courses, attendance, results, and notices.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Total Students
            </p>

            <h3 className="mt-3 text-3xl font-bold text-[#12355B]">
              250
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Courses
            </p>

            <h3 className="mt-3 text-3xl font-bold text-[#00A6A6]">
              6
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Teachers
            </p>

            <h3 className="mt-3 text-3xl font-bold text-[#12355B]">
              18
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              New Admissions
            </p>

            <h3 className="mt-3 text-3xl font-bold text-[#00A6A6]">
              24
            </h3>
          </div>

        </div>

        {/* Management Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {[
            ["Students", "Manage student accounts and information."],
            ["Courses", "Create and manage educational programs."],
            ["Attendance", "Monitor student attendance records."],
            ["Results", "Manage student grades and results."],
            ["Notices", "Publish important school announcements."],
            ["Admissions", "Review and manage student admissions."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-[#DDE7EA] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl"
            >
              <h3 className="text-xl font-bold text-[#12355B]">
                {title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {description}
              </p>

              <button className="mt-5 font-semibold text-[#00A6A6] transition hover:text-[#12355B]">
                Manage →
              </button>
            </div>
          ))}

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;