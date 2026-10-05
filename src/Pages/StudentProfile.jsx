function StudentProfile() {
  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-[#12355B] px-6 py-5 text-white">
        <div className="mx-auto max-w-7xl">

          <p className="text-sm text-[#00A6A6]">
            Student Portal
          </p>

          <h1 className="text-2xl font-bold">
            My Profile
          </h1>

        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          {/* Profile Header */}
          <div className="bg-[#12355B] px-8 py-10 text-center text-white">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#00A6A6] text-3xl font-bold">
              MK
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Student Name
            </h2>

            <p className="mt-1 text-slate-200">
              Student ID: VW-2026-001
            </p>

          </div>

          {/* Information */}
          <div className="grid gap-6 p-8 md:grid-cols-2">

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Full Name
              </p>

              <p className="mt-1 font-semibold text-[#12355B]">
                Student Name
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Email
              </p>

              <p className="mt-1 font-semibold text-[#12355B]">
                student@example.com
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Course
              </p>

              <p className="mt-1 font-semibold text-[#12355B]">
                English Language
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Class
              </p>

              <p className="mt-1 font-semibold text-[#12355B]">
                English Level 1
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Student Status
              </p>

              <p className="mt-1 font-semibold text-[#00A6A6]">
                Active
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Admission Year
              </p>

              <p className="mt-1 font-semibold text-[#12355B]">
                2026
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default StudentProfile;