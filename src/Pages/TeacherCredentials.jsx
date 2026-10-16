import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function TeacherCredentials() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState(null);

  const createCredentials = async () => {
    setLoading(true);
    setError("");
    setCredentials(null);

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke("create-teacher-invite");

      if (functionError) throw functionError;
      if (data?.error) throw new Error(data.error);

      setCredentials(data);
    } catch (err) {
      setError(
        err.message || "Unable to create teacher credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = async () => {
    if (!credentials) return;

    const text = [
      `Teacher ID: ${credentials.teacherId}`,
      `Verification Code: ${credentials.verificationCode}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Copy failed. Please copy the credentials manually.");
    }
  };

  return (
    <section className="mb-9 rounded-2xl border border-[#DDE7EA] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#12355B]">
            Create Teacher Credentials
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Generate a school-issued Teacher ID and private Verification Code.
          </p>
        </div>

        <button
          type="button"
          onClick={createCredentials}
          disabled={loading}
          className="rounded-xl bg-[#12355B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00A6A6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Create Credentials"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {credentials && (
        <div className="mt-6 rounded-xl border border-[#DDE7EA] bg-slate-50 p-5">
          <h3 className="font-bold text-[#12355B]">
            New Teacher Credentials
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Provide these credentials privately to the intended teacher.
            The verification code will not be shown again after you leave
            this screen.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[#DDE7EA] bg-white p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Teacher ID
              </p>
              <p className="mt-2 break-all font-bold text-[#12355B]">
                {credentials.teacherId}
              </p>
            </div>

            <div className="rounded-lg border border-[#DDE7EA] bg-white p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Verification Code
              </p>
              <p className="mt-2 break-all font-bold tracking-wider text-[#12355B]">
                {credentials.verificationCode}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={copyCredentials}
            className="mt-4 rounded-lg border border-[#DDE7EA] bg-white px-4 py-2 text-sm font-semibold text-[#12355B] hover:border-[#00A6A6]"
          >
            Copy Credentials
          </button>
        </div>
      )}
    </section>
  );
}

export default TeacherCredentials;