import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../lib/supabaseClient";

function StudentIDCard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudent = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Student login not found.");
        setLoading(false);
        return;
      }

      const { data, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();

      if (studentError) {
        console.error(studentError);
        setError("Unable to load student information.");
        setLoading(false);
        return;
      }

      setStudent(data);
      setLoading(false);
    };

    loadStudent();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#12355B]">Loading student card...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error || "Student not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#00A6A6]">
              Student Portal
            </p>
            <h1 className="text-3xl font-bold text-[#12355B]">
              Student ID Card
            </h1>
          </div>

          <button
            onClick={handlePrint}
            className="rounded-lg bg-[#12355B] px-5 py-3 font-semibold text-white transition hover:bg-[#00A6A6]"
          >
            Print ID Card
          </button>
        </div>

        {/* ID CARDS */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* FRONT */}
          <div className="id-card overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="bg-[#12355B] px-6 py-5 text-center text-white">
              <img
                src={`${import.meta.env.BASE_URL}log.jpg`}
                alt="VoW Logo"
                className="mx-auto h-16 w-auto object-contain"
              />

              <h2 className="mt-3 text-lg font-bold">
                THE VOICE OF WISDOM
              </h2>

              <p className="text-sm text-[#00A6A6]">
                School & English Language Center
              </p>
            </div>

            <div className="flex flex-col items-center px-6 py-8">
              <img
                src={student.photo_url}
                alt={student.full_name}
                className="h-40 w-32 rounded-xl border-4 border-[#00A6A6] object-cover"
              />

              <h3 className="mt-4 text-xl font-bold text-[#12355B]">
                {student.full_name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Student • {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* BACK */}
          <div className="id-card overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="bg-[#12355B] px-6 py-5 text-center text-white">
              <p className="text-sm font-semibold text-[#00A6A6]">
                STUDENT IDENTIFICATION
              </p>

              <h2 className="mt-1 text-xl font-bold">
                STUDENT CARD
              </h2>
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
                  size={130}
                  level="H"
                />
              </div>

              <p className="mt-3 text-center text-xs text-slate-500">
                Scan this QR code to identify the student.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }

          button {
            display: none !important;
          }

          .id-card {
            box-shadow: none !important;
            border: 1px solid #ddd;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

export default StudentIDCard;