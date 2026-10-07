import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function AdminDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherInvites, setTeacherInvites] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedTeacherClass, setSelectedTeacherClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);

  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingClass, setLoadingClass] = useState(false);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [creatingInvite, setCreatingInvite] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceStatus, setAttendanceStatus] = useState("present");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

 const [checkingAccess, setCheckingAccess] = useState(true);

useEffect(() => {
  const checkAdminAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/admin-login", { replace: true });
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError || roleData?.role !== "admin") {
      await supabase.auth.signOut();
      navigate("/admin-login", { replace: true });
      return;
    }

    setCheckingAccess(false);

    fetchStudents();
    fetchAttendance();
    fetchTeachers();
    fetchTeacherInvites();
  };

  checkAdminAccess();
}, [navigate]);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select(
        "id, admission_number, full_name, father_name, class_name, section, course, photo_url, class_id"
      )
      .order("full_name");

    if (error) {
      console.error("Error loading students:", error);
      return;
    }

    setStudents(data || []);
  };

  const fetchAttendance = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("id, student_id, attendance_date, status")
      .order("attendance_date", { ascending: false });

    if (error) {
      console.error("Error loading attendance:", error);
      return;
    }

    setAttendance(data || []);
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);

    const { data, error } = await supabase
      .from("teachers")
      .select("id, full_name, email, photo_url, created_at")
      .order("full_name");

    if (error) {
      console.error("Error loading teachers:", error);
      setLoadingTeachers(false);
      return;
    }

    setTeachers(data || []);
    setLoadingTeachers(false);
  };

  /* ========================================= */
  /* TEACHER INVITES */
  /* ========================================= */

  const fetchTeacherInvites = async () => {
    setLoadingInvites(true);

    const { data, error } = await supabase
      .from("teacher_invites")
      .select("id, teacher_id, verification_code, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading teacher invites:", error);
      setLoadingInvites(false);
      return;
    }

    setTeacherInvites(data || []);
    setLoadingInvites(false);
  };

  const generateVerificationCode = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 8; i++) {
      code += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return `${code.slice(0, 4)}-${code.slice(4)}`;
  };

  const generateTeacherId = () => {
    const year = new Date().getFullYear();

    const existingIds = teacherInvites
      .map((invite) => invite.teacher_id)
      .filter((id) => id?.startsWith(`TCH-${year}-`));

    let highestNumber = 0;

    existingIds.forEach((id) => {
      const number = parseInt(id.split("-")[2], 10);

      if (!Number.isNaN(number) && number > highestNumber) {
        highestNumber = number;
      }
    });

    const nextNumber = String(highestNumber + 1).padStart(3, "0");

    return `TCH-${year}-${nextNumber}`;
  };

  const createTeacherInvite = async () => {
    setCreatingInvite(true);
    setInviteMessage("");

    const teacherId = generateTeacherId();
    const verificationCode = generateVerificationCode();

    const { error } = await supabase
      .from("teacher_invites")
      .insert({
        teacher_id: teacherId,
        verification_code: verificationCode,
        status: "active",
      });

    if (error) {
      console.error("Error creating teacher invite:", error);
      setInviteMessage(error.message);
      setCreatingInvite(false);
      return;
    }

    setInviteMessage(
      `Teacher credentials created: ${teacherId}`
    );

    await fetchTeacherInvites();

    setCreatingInvite(false);
  };

  const disableTeacherInvite = async (inviteId) => {
    const { error } = await supabase
      .from("teacher_invites")
      .update({ status: "disabled" })
      .eq("id", inviteId);

    if (error) {
      console.error("Error disabling teacher invite:", error);
      setInviteMessage(error.message);
      return;
    }

    setInviteMessage("Teacher verification code disabled.");

    await fetchTeacherInvites();
  };

  const handleTeacherClick = async (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedTeacherClass(null);
    setClassStudents([]);
    setLoadingClass(true);

    const { data: assignedClass, error: classError } = await supabase
      .from("classes")
      .select("id, grade, section, class_name")
      .eq("teacher_id", teacher.id)
      .maybeSingle();

    if (classError) {
      console.error("Error loading teacher class:", classError);
      setLoadingClass(false);
      return;
    }

    if (!assignedClass) {
      setLoadingClass(false);
      return;
    }

    setSelectedTeacherClass(assignedClass);

    const { data: studentsInClass, error: studentsError } = await supabase
      .from("students")
      .select(
        "id, admission_number, full_name, father_name, date_of_birth, phone, address, class_name, section, course, photo_url, class_id"
      )
      .eq("class_id", assignedClass.id)
      .order("full_name");

    if (studentsError) {
      console.error("Error loading class students:", studentsError);
      setLoadingClass(false);
      return;
    }

    setClassStudents(studentsInClass || []);
    setLoadingClass(false);
  };

  const closeTeacherView = () => {
    setSelectedTeacher(null);
    setSelectedTeacherClass(null);
    setClassStudents([]);
  };

  const openStudentDashboard = (student) => {
    navigate("/student-dashboard", {
      state: {
        studentId: student.id,
        adminPreview: true,
      },
    });
  };

  const markAttendance = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      setMessage("Please select a student.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("attendance").upsert(
      {
        student_id: selectedStudent,
        attendance_date: attendanceDate,
        status: attendanceStatus,
      },
      {
        onConflict: "student_id,attendance_date",
      }
    );

    if (error) {
      console.error(error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Attendance saved successfully.");

    await fetchAttendance();

    setLoading(false);
  };

  const getStudentName = (studentId) => {
    const student = students.find((item) => item.id === studentId);

    return student
      ? `${student.full_name} (${student.admission_number})`
      : "Unknown Student";
  };

  const getStatusStyle = (status) => {
    if (status === "present") {
      return "bg-green-100 text-green-700";
    }

    if (status === "absent") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

 const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = `${import.meta.env.BASE_URL}login`;
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
      {/* Header */}
      <header className="bg-[#12355B] px-6 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-sm text-[#00A6A6]">Administration</p>

            <h1 className="text-2xl font-bold">
              Admin Dashboard
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

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Heading */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#12355B]">
            Administration Overview
          </h2>

          <p className="mt-2 text-slate-600">
            Manage teachers, classes, students, attendance, results, and notices.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Total Students
            </p>

            <h3 className="mt-3 text-3xl font-bold text-[#12355B]">
              {students.length}
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
              {teachers.length}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Attendance Records
            </p>

            <h3 className="mt-3 text-3xl font-bold text-[#00A6A6]">
              {attendance.length}
            </h3>
          </div>
        </div>

        {/* ========================================= */}
        {/* TEACHER INVITATION SYSTEM */}
        {/* ========================================= */}

        <div className="mt-10 rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
              Teacher Registration
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#12355B]">
              Teacher Registration Credentials
            </h2>

            <p className="mt-2 text-slate-600">
              Create a Teacher ID and private verification code for a teacher.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#12355B]">
                  Create Teacher Credentials
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  These credentials are provided privately to the teacher.
                </p>
              </div>

              <button
                onClick={createTeacherInvite}
                disabled={creatingInvite}
                className="rounded-xl bg-[#12355B] px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#00A6A6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingInvite
                  ? "Creating..."
                  : "Generate Teacher Credentials"}
              </button>
            </div>

            {inviteMessage && (
              <div className="mt-5 rounded-xl border border-[#DDE7EA] bg-white px-4 py-3 text-sm font-medium text-slate-700">
                {inviteMessage}
              </div>
            )}
          </div>

          {/* Existing Credentials */}
          <div className="mt-8">
            <h3 className="mb-5 text-2xl font-bold text-[#12355B]">
              Teacher Credentials
            </h3>

            {loadingInvites ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                Loading teacher credentials...
              </div>
            ) : teacherInvites.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                No teacher credentials have been generated yet.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {teacherInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="rounded-2xl border border-[#DDE7EA] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A6A6] hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">
                          Teacher ID
                        </p>

                        <p className="mt-1 text-xl font-bold tracking-wide text-[#12355B]">
                          {invite.teacher_id}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          invite.status === "active"
                            ? "bg-green-100 text-green-700"
                            : invite.status === "used"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {invite.status}
                      </span>
                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-500">
                        Private Verification Code
                      </p>

                      <p className="mt-1 text-lg font-bold tracking-widest text-[#00A6A6]">
                        {invite.verification_code}
                      </p>
                    </div>

                    {invite.status === "active" && (
                      <button
                        onClick={() => disableTeacherInvite(invite.id)}
                        className="mt-5 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Disable Code
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* TEACHER MANAGEMENT */}
        {/* ========================================= */}

        <div className="mt-10">
          <div className="mb-6">
            <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
              School Management
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#12355B]">
              Teachers
            </h2>

            <p className="mt-2 text-slate-600">
              Select a teacher to view their assigned head class and students.
            </p>
          </div>

          {loadingTeachers ? (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
              Loading teachers...
            </div>
          ) : teachers.length === 0 ? (
            <div className="rounded-2xl border border-[#DDE7EA] bg-white p-8 text-center text-slate-500 shadow-sm">
              No teachers have been registered yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => handleTeacherClick(teacher)}
                  className="group rounded-2xl border border-[#DDE7EA] bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl"
                >
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100">
                      {teacher.photo_url ? (
                        <img
                          src={teacher.photo_url}
                          alt={teacher.full_name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#12355B]">
                          {teacher.full_name?.charAt(0)?.toUpperCase() || "T"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-bold text-[#12355B]">
                        {teacher.full_name}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-[#00A6A6]">
                        Teacher
                      </p>

                      <p className="mt-2 truncate text-sm text-slate-500">
                        {teacher.email || "No email available"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <span className="font-semibold text-[#00A6A6] transition group-hover:text-[#12355B]">
                      View assigned class →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* SELECTED TEACHER → CLASS → STUDENTS */}
        {/* ========================================= */}

        {selectedTeacher && (
          <div className="mt-10 rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                  {selectedTeacher.photo_url ? (
                    <img
                      src={selectedTeacher.photo_url}
                      alt={selectedTeacher.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[#12355B]">
                      {selectedTeacher.full_name
                        ?.charAt(0)
                        ?.toUpperCase() || "T"}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#00A6A6]">
                    Teacher
                  </p>

                  <h2 className="text-2xl font-bold text-[#12355B]">
                    {selectedTeacher.full_name}
                  </h2>
                </div>
              </div>

              <button
                onClick={closeTeacherView}
                className="rounded-xl border border-[#DDE7EA] px-5 py-2.5 font-semibold text-[#12355B] transition hover:border-[#00A6A6] hover:bg-[#00A6A6] hover:text-white"
              >
                Close
              </button>
            </div>

            {loadingClass ? (
              <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                Loading assigned class...
              </div>
            ) : !selectedTeacherClass ? (
              <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                No class is currently assigned to this teacher.
              </div>
            ) : (
              <>
                {/* Assigned Class */}
                <div className="mt-8 rounded-2xl bg-[#12355B] p-7 text-white">
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#00A6A6]">
                    Head / Assigned Class
                  </p>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-3xl font-bold">
                        Class {selectedTeacherClass.class_name}
                      </h3>

                      <p className="mt-1 text-slate-200">
                        Grade {selectedTeacherClass.grade} • Section{" "}
                        {selectedTeacherClass.section}
                      </p>
                    </div>

                    <p className="font-semibold text-[#00A6A6]">
                      {classStudents.length} Student
                      {classStudents.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                {/* Students */}
                <div className="mt-8">
                  <div className="mb-5">
                    <h3 className="text-2xl font-bold text-[#12355B]">
                      Students in Class {selectedTeacherClass.class_name}
                    </h3>

                    <p className="mt-1 text-slate-600">
                      Only students assigned to this teacher's class are shown.
                    </p>
                  </div>

                  {classStudents.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                      No students are currently assigned to this class.
                    </div>
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {classStudents.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => openStudentDashboard(student)}
                          className="group rounded-2xl border border-[#DDE7EA] bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100">
                              {student.photo_url ? (
                                <img
                                  src={student.photo_url}
                                  alt={student.full_name}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[#12355B]">
                                  {student.full_name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "S"}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="truncate font-bold text-[#12355B]">
                                {student.full_name}
                              </h4>

                              <p className="mt-1 text-sm text-slate-500">
                                {student.admission_number}
                              </p>

                              <p className="mt-1 text-sm font-medium text-[#00A6A6]">
                                Class {selectedTeacherClass.class_name}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 border-t border-slate-100 pt-3">
                            <span className="text-sm font-semibold text-[#00A6A6] transition group-hover:text-[#12355B]">
                              Open Student Dashboard →
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* ATTENDANCE MANAGEMENT */}
        {/* ========================================= */}

        <div className="mt-10 rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
              Student Management
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#12355B]">
              Attendance Management
            </h2>

            <p className="mt-2 text-slate-600">
              Mark and update daily attendance for students.
            </p>
          </div>

          <form
            onSubmit={markAttendance}
            className="grid gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block font-semibold text-[#12355B]">
                Student
              </label>

              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full rounded-xl border border-[#DDE7EA] bg-white px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
              >
                <option value="">Select student</option>

                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} — {student.admission_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-[#12355B]">
                Attendance Date
              </label>

              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-[#12355B]">
                Attendance Status
              </label>

              <select
                value={attendanceStatus}
                onChange={(e) => setAttendanceStatus(e.target.value)}
                className="w-full rounded-xl border border-[#DDE7EA] bg-white px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#12355B] px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#00A6A6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {message}
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* RECENT ATTENDANCE */}
        {/* ========================================= */}

        <div className="mt-10 rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#12355B]">
              Recent Attendance
            </h2>

            <p className="mt-1 text-slate-600">
              Latest attendance records entered by administration.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-[#DDE7EA]">
                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    Student
                  </th>

                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    Date
                  </th>

                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No attendance records yet.
                    </td>
                  </tr>
                ) : (
                  attendance.slice(0, 20).map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-medium text-[#12355B]">
                        {getStudentName(record.student_id)}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {record.attendance_date}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${getStatusStyle(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;