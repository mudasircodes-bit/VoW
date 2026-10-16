import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function TeacherDashboard() {
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [assignedClass, setAssignedClass] = useState(null);
  const [students, setStudents] = useState([]);

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchTeacherDashboard = async (userId) => {
    setErrorMessage("");

    // Get teacher profile
    const { data: teacherData, error: teacherError } = await supabase
      .from("teachers")
      .select("id, full_name, email, photo_url")
      .eq("id", userId)
      .maybeSingle();

    if (teacherError) {
      throw new Error("Unable to load teacher profile.");
    }

    if (!teacherData) {
      throw new Error(
        "Your teacher account has not been activated by administration yet."
      );
    }

    setTeacher(teacherData);

    // Get assigned class
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("id, grade, section, class_name")
      .eq("teacher_id", userId)
      .maybeSingle();

    if (classError) {
      throw new Error("Unable to load your assigned class.");
    }

    if (!classData) {
      setAssignedClass(null);
      setStudents([]);
      return;
    }

    setAssignedClass(classData);

    // Get students from assigned class
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select(
        "id, admission_number, full_name, father_name, date_of_birth, phone, address, course, photo_url"
      )
      .eq("class_id", classData.id)
      .order("full_name", { ascending: true });

    if (studentError) {
      throw new Error("Unable to load students.");
    }

    setStudents(studentData || []);
  };

  useEffect(() => {
    const checkTeacherAccess = async () => {
      setCheckingAccess(true);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        navigate("/teacher-login", { replace: true });
        return;
      }

      const user = sessionData.session.user;

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleError || roleData?.role !== "teacher") {
        await supabase.auth.signOut();
        navigate("/teacher-login", { replace: true });
        return;
      }

      try {
        await fetchTeacherDashboard(user.id);
      } catch (error) {
        setErrorMessage(
          error.message || "Unable to load teacher dashboard."
        );
      } finally {
        setLoading(false);
        setCheckingAccess(false);
      }
    };

    checkTeacherAccess();
  }, [navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setErrorMessage("");

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      navigate("/teacher-login", { replace: true });
      return;
    }

    try {
      await fetchTeacherDashboard(sessionData.session.user.id);
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to refresh dashboard."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/teacher-login", { replace: true });
  };

  if (checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#12355B]" />
          <p className="font-semibold text-[#12355B]">
            Checking teacher access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-[#DDE7EA] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/log.jpg"
              alt="The Voice of Wisdom"
              className="h-12 w-12 object-contain"
            />

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#00A6A6]">
                Teacher Portal
              </p>

              <h1 className="text-lg font-bold text-[#12355B] sm:text-xl">
                The Voice of Wisdom
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-[#DDE7EA] px-4 py-2 text-sm font-semibold text-[#12355B] transition hover:border-red-300 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#12355B]" />
              <p className="font-semibold text-[#12355B]">
                Loading teacher dashboard...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Teacher profile */}
            <section className="mb-8 rounded-2xl border border-[#DDE7EA] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {teacher?.photo_url ? (
                    <img
                      src={teacher.photo_url}
                      alt={teacher.full_name}
                      className="h-20 w-20 rounded-2xl border border-[#DDE7EA] object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#12355B] text-2xl font-bold text-white">
                      {teacher?.full_name?.charAt(0)?.toUpperCase() || "T"}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-[#00A6A6]">
                      Welcome back
                    </p>

                    <h2 className="text-2xl font-bold text-[#12355B]">
                      {teacher?.full_name || "Teacher"}
                    </h2>

                    <p className="mt-1 text-sm text-[#64748B]">
                      {teacher?.email || "Teacher account"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="rounded-lg bg-[#12355B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00A6A6] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing ? "Refreshing..." : "Refresh Data"}
                </button>
              </div>
            </section>

            {/* Class overview */}
            <section className="mb-8">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#00A6A6]">
                  Assigned Class
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#12355B]">
                  My Class
                </h2>
              </div>

              {assignedClass ? (
                <div className="rounded-2xl border border-[#DDE7EA] bg-white p-6 shadow-sm">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-5">
                      <p className="text-sm text-[#64748B]">Class</p>
                      <p className="mt-1 text-2xl font-bold text-[#12355B]">
                        {assignedClass.class_name}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-5">
                      <p className="text-sm text-[#64748B]">Grade</p>
                      <p className="mt-1 text-2xl font-bold text-[#12355B]">
                        {assignedClass.grade}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-5">
                      <p className="text-sm text-[#64748B]">Section</p>
                      <p className="mt-1 text-2xl font-bold text-[#12355B]">
                        {assignedClass.section}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                  <h3 className="font-bold text-[#12355B]">
                    No class assigned yet
                  </h3>

                  <p className="mt-2 text-sm text-[#64748B]">
                    Administration has not assigned a class to your teacher
                    account yet. Your dashboard will show students after an
                    assignment is made.
                  </p>
                </div>
              )}
            </section>

            {/* Students */}
            <section>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#00A6A6]">
                    Students
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-[#12355B]">
                    My Students
                  </h2>
                </div>

                <p className="text-sm font-medium text-[#64748B]">
                  {students.length} student
                  {students.length === 1 ? "" : "s"}
                </p>
              </div>

              {!assignedClass ? (
                <div className="rounded-2xl border border-[#DDE7EA] bg-white p-8 text-center shadow-sm">
                  <p className="text-[#64748B]">
                    Students will appear here after administration assigns
                    your class.
                  </p>
                </div>
              ) : students.length === 0 ? (
                <div className="rounded-2xl border border-[#DDE7EA] bg-white p-8 text-center shadow-sm">
                  <h3 className="font-bold text-[#12355B]">
                    No students found
                  </h3>

                  <p className="mt-2 text-sm text-[#64748B]">
                    No students are currently assigned to this class.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {students.map((student) => (
                    <article
                      key={student.id}
                      className="group overflow-hidden rounded-2xl border border-[#DDE7EA] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#00A6A6] hover:shadow-lg"
                    >
                      <div className="p-5">
                        <div className="flex items-center gap-4">
                          {student.photo_url ? (
                            <img
                              src={student.photo_url}
                              alt={student.full_name}
                              className="h-16 w-16 rounded-xl border border-[#DDE7EA] object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#12355B] text-xl font-bold text-white">
                              {student.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-[#12355B]">
                              {student.full_name}
                            </h3>

                            <p className="text-sm text-[#64748B]">
                              {student.admission_number}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 space-y-3 border-t border-[#DDE7EA] pt-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                              Father Name
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#12355B]">
                              {student.father_name || "Not available"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                              Phone
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#12355B]">
                              {student.phone || "Not available"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                              Program
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#12355B]">
                              {student.course || "School Program"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default TeacherDashboard;