import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { listUsers, suspendUser, unsuspendUser, type AdminUser } from "../../lib/api/admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      listUsers({ search: search || undefined, role: role || undefined })
        .then(({ users }) => setUsers(users))
        .catch((err) => setErrorMessage(err.message || "Could not load users"))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [search, role]);

  const handleToggleSuspend = async (user: AdminUser) => {
    setBusyId(user.id);
    setErrorMessage(null);
    try {
      if (user.isSuspended) {
        await unsuspendUser(user.id);
      } else {
        await suspendUser(user.id);
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isSuspended: !u.isSuspended } : u)));
    } catch (err: any) {
      setErrorMessage(err.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">All roles</option>
          <option value="CANDIDATE">Candidate</option>
          <option value="RECRUITER">Recruiter</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-soft">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-soft">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-soft">No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{user.email}</td>
                  <td className="px-4 py-3 text-ink-soft">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isSuspended ? "bg-red-50 text-red-500" : "bg-emerald-50 text-success"}`}>
                      {user.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.role !== "ADMIN" && (
                      <button
                        disabled={busyId === user.id}
                        onClick={() => handleToggleSuspend(user)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                          user.isSuspended
                            ? "border-line text-ink-soft hover:border-primary hover:text-primary"
                            : "border-line text-red-500 hover:border-red-300"
                        }`}
                      >
                        {user.isSuspended ? "Unsuspend" : "Suspend"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}