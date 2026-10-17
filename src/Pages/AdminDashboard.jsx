import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import TeacherCredentials from "./TeacherCredentials";

const getClassLabel = (classInfo) => {
  if (!classInfo) return "Class not assigned";

  if (classInfo.class_name?.trim()) {
    const name = classInfo.class_name.trim();
    return /^class\b/i.test(name) ? name : `Class ${name}`;
  }

  if (classInfo.grade != null && classInfo.section) {
    return `Class ${classInfo.grade}${classInfo.section}`;
  }

  return "Class not assigned";
};

const normalizeGender = (gender) =>
  String(gender || "").trim().toLowerCase();

function AdminDashboard() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedTeacherClass, setSelectedTeacherClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingClass, setLoadingClass] = useState(false);
  const [reviewingApplicationId, setReviewingApplicationId] =
    useState(null);

  const [pageError, setPageError] = useState("");
  const [classError, setClassError] = useState("");
  const [applicationError, setApplicationError] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        // Check the current Supabase session first.
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.user) {
          navigate("/admin-login", { replace: true });
          return;
        }

        // Confirm that the current user is valid.
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (userError || !user) {
          navigate("/admin-login", { replace: true });
          return;
        }

        // Check administrator access.
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (roleError) {
          throw roleError;
        }

        if (roleData?.role !== "admin") {
          await supabase.auth.signOut();
          navigate("/admin-login", { replace: true });
          return;
        }

        // Load teachers, class assignments, and pending applications.
        const [
          teacherResult,
          classResult,
          applicationResult,
        ] = await Promise.all([
          supabase
            .from("teachers")
            .select("id, full_name, photo_url, gender")
            .order("full_name"),

          supabase
            .from("classes")
            .select("id, teacher_id, grade, section, class_name"),

          supabase
            .from("teacher_applications")
            .select(
              "id, user_id, full_name, father_name, phone, email, teacher_id, photo_url, status, created_at"
            )
            .eq("status", "pending")
            .order("created_at", { ascending: false }),
        ]);

        if (cancelled) return;

        const errors = [];

        if (teacherResult.error) {
          errors.push(`Teachers: ${teacherResult.error.message}`);
        }

        if (classResult.error) {
          errors.push(
            `Class assignments: ${classResult.error.message}`
          );
        }

        if (applicationResult.error) {
          errors.push(
            `Pending applications: ${applicationResult.error.message}`
          );
        }

        const teacherRows = teacherResult.data || [];
        const classRows = classResult.data || [];

        const teachersWithClasses = teacherRows.map((teacher) => ({
          ...teacher,
          assignedClass:
            classRows.find(
              (classInfo) => classInfo.teacher_id === teacher.id
            ) || null,
        }));

        setTeachers(teachersWithClasses);
        setPendingApplications(applicationResult.data || []);

        if (errors.length) {
          setPageError(errors.join(" • "));
        }
      } catch (err) {
        if (!cancelled) {
          setPageError(
            err?.message || "Unable to load administration data."
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingAccess(false);
          setLoadingTeachers(false);
          setLoadingApplications(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Teacher statistics.
  const maleTeachers = teachers.filter(
    (teacher) => normalizeGender(teacher.gender) === "male"
  ).length;

  const femaleTeachers = teachers.filter(
    (teacher) => normalizeGender(teacher.gender) === "female"
  ).length;

  const totalTeachers = teachers.length;

  // Approve or reject a pending teacher application.
  const handleApplicationReview = async (application, action) => {
    if (
      !application?.id ||
      reviewingApplicationId !== null
    ) {
      return;
    }

    if (action !== "approve" && action !== "reject") {
      return;
    }

    const actionLabel = action === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} ${application.full_name}'s application?`
    );

    if (!confirmed) return;

    setReviewingApplicationId(application.id);
    setApplicationError("");
    setApplicationMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        throw new Error(
          "Your admin session has expired. Please log in again."
        );
      }

      const { data, error } = await supabase.functions.invoke(
        "review-teacher-application",
        {
          body: {
            applicationId: application.id,
            action,
          },
        }
      );

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success === false) {
        throw new Error(
          data.message || "The application could not be reviewed."
        );
      }

      setPendingApplications((current) =>
        current.filter((item) => item.id !== application.id)
      );

      // Add an approved teacher to the current list immediately.
      if (action === "approve" && application.user_id) {
        setTeachers((current) => {
          const alreadyAdded = current.some(
            (teacher) => teacher.id === application.user_id
          );

          if (alreadyAdded) return current;

          return [
            ...current,
            {
              id: application.user_id,
              full_name: application.full_name,
              photo_url: application.photo_url,
              gender: null,
              assignedClass: null,
            },
          ];
        });
      }

      setApplicationMessage(
        data?.message ||
          `Teacher application ${
            action === "approve" ? "approved" : "rejected"
          } successfully.`
      );
    } catch (err) {
      setApplicationError(
        err?.message || "Unable to review this application."
      );
    } finally {
      setReviewingApplicationId(null);
    }
  };

  // Log out safely, even when the session is missing.
  const handleLogout = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (session) {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;
      }

      navigate("/admin-login", { replace: true });
    } catch (err) {
      setPageError(
        err?.message || "Unable to log out. Please try again."
      );
    }
  };

  // Open a teacher's assigned class.
  const handleTeacherClick = async (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedTeacherClass(null);
    setClassStudents([]);
    setClassError("");
    setLoadingClass(true);

    try {
      const { data: assignedClass, error: assignedClassError } =
        await supabase
          .from("classes")
          .select("id, teacher_id, grade, section, class_name")
          .eq("teacher_id", teacher.id)
          .maybeSingle();

      if (assignedClassError) throw assignedClassError;

      if (!assignedClass) {
        setClassError(
          "No class is currently assigned to this teacher."
        );
        return;
      }

      setSelectedTeacherClass(assignedClass);

      // Retrieve only students assigned to this class.
      const { data: studentsInClass, error: studentsError } =
        await supabase
          .from("students")
          .select(
            "id, admission_number, full_name, photo_url, class_id"
          )
          .eq("class_id", assignedClass.id)
          .order("full_name");

      if (studentsError) throw studentsError;

      setClassStudents(studentsInClass || []);
    } catch (err) {
      setClassError(
        err?.message || "Unable to load this teacher's class."
      );
    } finally {
      setLoadingClass(false);
    }
  };

  const closeTeacherView = () => {
    setSelectedTeacher(null);
    setSelectedTeacherClass(null);
    setClassStudents([]);
    setClassError("");
  };

  if (checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#12355B]" />

          <p className="font-semibold text-[#12355B]">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Administration Header */}
      <header className="bg-[#12355B] px-5 py-4 text-white sm:px-8">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}log.jpg`}
              alt="The Voice of Wisdom"
              className="h-11 w-11 rounded-xl bg-white object-contain p-1"
            />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#00A6A6]">
                Administration
              </p>

              <h1 className="text-xl font-bold sm:text-2xl">
                Admin Dashboard
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#12355B] transition hover:bg-[#00A6A6] hover:text-white sm:px-5"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-5 py-7 sm:px-8 sm:py-9">
        {/* Teacher Overview */}
        <section className="mb-9">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#12355B] sm:text-3xl">
              Administration Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Teacher information and staff records.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Total Teachers */}
            <div className="rounded-2xl border border-[#DDE7EA] bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Teachers
              </p>

              <p className="mt-2 text-3xl font-bold text-[#12355B]">
                {totalTeachers}
              </p>
            </div>

            {/* Male Teachers */}
            <div className="rounded-2xl border border-[#DDE7EA] bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Male Teachers
              </p>

              <p className="mt-2 text-3xl font-bold text-[#00A6A6]">
                {maleTeachers}
              </p>
            </div>

            {/* Female Teachers */}
            <div className="rounded-2xl border border-[#DDE7EA] bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Female Teachers
              </p>

              <p className="mt-2 text-3xl font-bold text-[#12355B]">
                {femaleTeachers}
              </p>
            </div>
          </div>
        </section>

        {/* Pending Teacher Applications */}
        <section className="mb-9 rounded-2xl border border-[#DDE7EA] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#00A6A6]">
              Staff Recruitment
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#12355B]">
              Pending Teacher Applications
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Review applications before granting teacher portal access.
            </p>
          </div>

          {applicationError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {applicationError}
            </div>
          )}

          {applicationMessage && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800"
            >
              {applicationMessage}
            </div>
          )}

          {loadingApplications ? (
            <p className="py-6 text-sm text-slate-500">
              Loading applications...
            </p>
          ) : pendingApplications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#DDE7EA] bg-slate-50 p-8 text-center">
              <h3 className="font-semibold text-[#12355B]">
                No pending applications
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                New teacher applications will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {pendingApplications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-xl border border-[#DDE7EA] p-4 sm:p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#E0F2EE]">
                      {application.photo_url ? (
                        <img
                          src={application.photo_url}
                          alt={application.full_name || "Applicant"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl font-bold text-[#12355B]">
                          {application.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "T"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-lg font-bold text-[#12355B]">
                        {application.full_name}
                      </h3>

                      <p className="mt-1 break-words text-sm text-slate-600">
                        {application.email}
                      </p>

                      <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        Pending review
                      </span>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">Father's name</dt>
                      <dd className="break-words font-medium text-[#12355B]">
                        {application.father_name}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-slate-500">Phone</dt>
                      <dd className="break-words font-medium text-[#12355B]">
                        {application.phone}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-slate-500">Teacher ID</dt>
                      <dd className="break-words font-medium text-[#12355B]">
                        {application.teacher_id}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-slate-500">Submitted</dt>
                      <dd className="font-medium text-[#12355B]">
                        {application.created_at
                          ? new Date(
                              application.created_at
                            ).toLocaleDateString()
                          : "Not available"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={reviewingApplicationId !== null}
                      onClick={() =>
                        handleApplicationReview(application, "approve")
                      }
                      className="flex-1 rounded-lg bg-[#12355B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#00A6A6] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reviewingApplicationId === application.id
                        ? "Processing..."
                        : "Approve application"}
                    </button>

                    <button
                      type="button"
                      disabled={reviewingApplicationId !== null}
                      onClick={() =>
                        handleApplicationReview(application, "reject")
                      }
                      className="flex-1 rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reviewingApplicationId === application.id
                        ? "Processing..."
                        : "Reject application"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {pageError && (
          <div
            role="alert"
            className="mb-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {pageError}
          </div>
        )}

        {/* Teacher Cards */}
        <section>
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#00A6A6]">
                School Management
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#12355B] sm:text-3xl">
                Our Teachers
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select a teacher to open their assigned class.
              </p>
            </div>

            <p className="text-sm font-semibold text-slate-500">
              {totalTeachers} teacher{totalTeachers === 1 ? "" : "s"}
            </p>
          </div>

          {loadingTeachers ? (
            <div className="rounded-2xl border border-[#DDE7EA] bg-white p-12 text-center text-slate-500">
              Loading teacher cards...
            </div>
          ) : totalTeachers === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DDE7EA] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E0F2EE] text-2xl font-bold text-[#12355B]">
                T
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#12355B]">
                No teachers yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Approved and assigned teachers will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:gap-6">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => handleTeacherClick(teacher)}
                  aria-label={`Open ${
                    teacher.full_name || "teacher"
                  }'s class`}
                  className={`group flex min-w-0 flex-col items-center rounded-2xl border bg-white p-4 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#00A6A6] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00A6A6] focus:ring-offset-2 sm:p-5 ${
                    selectedTeacher?.id === teacher.id
                      ? "border-[#00A6A6] ring-2 ring-[#00A6A6]/20"
                      : "border-[#DDE7EA]"
                  }`}
                >
                  <div className="h-24 w-24 overflow-hidden rounded-2xl bg-[#E0F2EE] sm:h-28 sm:w-28">
                    {teacher.photo_url ? (
                      <img
                        src={teacher.photo_url}
                        alt={teacher.full_name || "Teacher"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#12355B]">
                        {teacher.full_name
                          ?.trim()
                          ?.charAt(0)
                          ?.toUpperCase() || "T"}
                      </div>
                    )}
                  </div>

                  <h3 className="mt-4 w-full truncate font-bold text-[#12355B]">
                    {teacher.full_name || "Unnamed Teacher"}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-[#00A6A6]">
                    {getClassLabel(teacher.assignedClass)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Selected Teacher's Assigned Class */}
        {selectedTeacher && (
          <section
            className="mt-10 scroll-mt-6 rounded-3xl border border-[#DDE7EA] bg-white p-5 shadow-sm sm:p-8"
            aria-label={`${
              selectedTeacher.full_name || "Teacher"
            }'s class`}
          >
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#E0F2EE]">
                  {selectedTeacher.photo_url ? (
                    <img
                      src={selectedTeacher.photo_url}
                      alt={selectedTeacher.full_name || "Teacher"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[#12355B]">
                      {selectedTeacher.full_name
                        ?.trim()
                        ?.charAt(0)
                        ?.toUpperCase() || "T"}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#00A6A6]">
                    Selected Teacher
                  </p>

                  <h2 className="truncate text-xl font-bold text-[#12355B] sm:text-2xl">
                    {selectedTeacher.full_name || "Unnamed Teacher"}
                  </h2>

                  {selectedTeacherClass && (
                    <p className="mt-1 text-sm text-slate-500">
                      {getClassLabel(selectedTeacherClass)}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={closeTeacherView}
                className="rounded-lg border border-[#DDE7EA] px-4 py-2 text-sm font-semibold text-[#12355B] transition hover:border-[#00A6A6] hover:bg-[#E0F2EE]"
              >
                Close class
              </button>
            </div>

            {loadingClass ? (
              <div className="py-12 text-center text-slate-500">
                Loading assigned class and students...
              </div>
            ) : classError ? (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800"
              >
                {classError}
              </div>
            ) : selectedTeacherClass ? (
              <>
                <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#12355B] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#00A6A6]">
                      Assigned Class
                    </p>

                    <h3 className="mt-1 text-2xl font-bold">
                      {getClassLabel(selectedTeacherClass)}
                    </h3>

                    <p className="mt-1 text-sm text-slate-200">
                      Class roster
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 px-4 py-3 sm:text-center">
                    <p className="text-2xl font-bold">
                      {classStudents.length}
                    </p>

                    <p className="text-xs text-slate-200">
                      {classStudents.length === 1 ? "Student" : "Students"}
                    </p>
                  </div>
                </div>

                <div className="mt-7">
                  <h3 className="text-xl font-bold text-[#12355B]">
                    Students in this class
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Only students assigned to this class are shown.
                  </p>

                  {classStudents.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-[#DDE7EA] bg-slate-50 px-5 py-12 text-center">
                      <h4 className="font-semibold text-[#12355B]">
                        No students assigned yet
                      </h4>

                      <p className="mt-2 text-sm text-slate-500">
                        Students will appear when their registration is
                        linked to this class.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {classStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex min-w-0 items-center gap-3 rounded-xl border border-[#DDE7EA] bg-white p-4 transition hover:border-[#00A6A6] hover:shadow-sm"
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {student.photo_url ? (
                              <img
                                src={student.photo_url}
                                alt={student.full_name || "Student"}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[#12355B]">
                                {student.full_name
                                  ?.trim()
                                  ?.charAt(0)
                                  ?.toUpperCase() || "S"}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="truncate font-semibold text-[#12355B]">
                              {student.full_name || "Unnamed Student"}
                            </h4>

                            <p className="mt-1 break-words text-xs text-slate-500">
                              {student.admission_number ||
                                "No admission number"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </section>
        )}

        <TeacherCredentials />
      </main>
    </div>
  );
}

export default AdminDashboard;