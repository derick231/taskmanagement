import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { AnimatePresence } from "framer-motion";
import {
  Users,
  ListChecks,
  Layers,
  Settings,
  UserPlus,
  BadgeCheck,
  X,
  Loader2,
  Calendar,
  Plus,
  GripVertical,
} from "lucide-react";

export default function WorkspacePage() {
  const { id: workspaceId } = useParams();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [workspace, setWorkspace] = useState(null);
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [error, setError] = useState("");
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  const [addTaskGroup, setAddTaskGroup] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  // --------------------------------
  // SHAPE NORMALISERS
  // --------------------------------
  const normalizeWorkspace = (raw) => {
    if (!raw) return null;
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description || "",
      tags: raw.tags || raw.tag || null,
      // backend might return groups / group
      groups: raw.groups || raw.group || [],
      // backend might return members / user / users / workspaceMembers
      members:
        raw.members ||
        raw.user ||
        raw.users ||
        raw.workspaceMembers ||
        raw.workspace_members ||
        [],
      // sometimes includes tasks
      tasks: raw.tasks || raw.task || [],
    };
  };

  const normalizeGroups = (rawGroups) => {
    if (!Array.isArray(rawGroups)) return [];
    return rawGroups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description || "",
      workId: g.workId || g.work_id || g.workspaceId || null,
      tasks: g.tasks || g.task || [],
    }));
  };

  const normalizeTasks = (rawTasks) => {
    if (!Array.isArray(rawTasks)) return [];
    return rawTasks.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description || "",
      priority: t.priority || "NORMAL",
      status: t.status || t.taskStatus || "TODO",
      dueDate: t.dueDate || t.due_date || null,
      groupId: t.groupId || t.group_id || t.group?.id || null,
      workspaceId: t.workspaceId || t.workspace_id || null,
      assignments: t.assignments || [],
    }));
  };

  const normalizeMembers = (workspaceObj) => {
    if (!workspaceObj) return [];
    const raw =
      workspaceObj.members ||
      workspaceObj.user ||
      workspaceObj.users ||
      workspaceObj.workspaceMembers ||
      [];

    return raw.map((m) => {
      // Case: WorkspaceMember with nested user
      if (m.user) {
        return {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          role: m.role || m.userRole || "MEMBER",
        };
      }
      // Case: plain User
      return {
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role || "MEMBER",
      };
    });
  };

  // --------------------------------
  // FETCH
  // --------------------------------
  const fetchAll = async () => {
    if (!workspaceId || !token) return;
    setLoading(true);
    setError("");

    try {
      const [wsRes, groupsRes, tasksRes] = await Promise.all([
        axios.get(`http://localhost:3000/workspaces/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:3000/groups/workspace/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:3000/tasks/workspace/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const wsRaw =
        wsRes.data.workspace || wsRes.data.data || wsRes.data || null;
      const ws = normalizeWorkspace(wsRaw);
      setWorkspace(ws);

      const groupsRaw =
        groupsRes.data.data || groupsRes.data.groups || groupsRes.data || [];
      const normalizedGroups = normalizeGroups(groupsRaw);
      setGroups(normalizedGroups);

      // tasks could come from task endpoint OR already inside groups
      let tasksRaw =
        tasksRes.data.data || tasksRes.data.tasks || tasksRes.data || [];
      if (!Array.isArray(tasksRaw) || tasksRaw.length === 0) {
        // fallback: flatten tasks from groups
        tasksRaw = normalizedGroups.flatMap((g) => g.tasks || []);
      }
      const normalizedTasks = normalizeTasks(tasksRaw);
      setTasks(normalizedTasks);
    } catch (err) {
      console.error("Error loading workspace page:", err);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load workspace"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, token]);

  // --------------------------------
  // DERIVED
  // --------------------------------
  const members = useMemo(() => normalizeMembers(workspace), [workspace]);

  const stats = useMemo(
    () => ({
      members: members.length,
      groups: groups.length,
      tasks: tasks.length,
    }),
    [members, groups, tasks]
  );

  const tasksForGroup = (groupId) =>
    tasks.filter(
      (t) =>
        (t.groupId ?? t.group?.id ?? t.group_id ?? null) === Number(groupId)
    );

  // --------------------------------
  // DRAG & DROP
  // --------------------------------
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("taskId", String(task.id));
  };

  const handleDrop = async (e, targetGroup) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    // optimistic
    setTasks((prev) =>
      prev.map((t) =>
        t.id === Number(taskId) ? { ...t, groupId: targetGroup.id } : t
      )
    );

    try {
      await axios.put(
        "http://localhost:3000/tasks/move",
        { taskId: Number(taskId), targetGroupId: targetGroup.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Move task failed:", err);
      // optional: refetch if you want strict sync
      // fetchAll();
    }
  };

  // --------------------------------
  // ROLES
  // --------------------------------
  const openRoleModal = (user) => {
    setRoleModalUser(user);
    setSelectedRole(user.role || "MEMBER");
  };

  const handleSaveRole = async () => {
    if (!roleModalUser || !selectedRole) return;
    setSavingRole(true);
    setError("");

    try {
      await axios.put(
        `http://localhost:3000/workspaces/${workspaceId}/members/${roleModalUser.id}/role`,
        { role: selectedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // since backend role logic might be placeholder,
      // we still update frontend state so UI reflects change
      setWorkspace((prev) => {
        if (!prev) return prev;
        const currentMembers = normalizeMembers(prev);
        const updated = currentMembers.map((m) =>
          m.id === roleModalUser.id ? { ...m, role: selectedRole } : m
        );
        return { ...prev, members: updated };
      });

      setRoleModalUser(null);
    } catch (err) {
      console.error("Role update error:", err);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to update role"
      );
    } finally {
      setSavingRole(false);
    }
  };

  // --------------------------------
  // RENDER
  // --------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">{error || "Workspace not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-8 md:px-10 pt-6 pb-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4 items-start">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
              {workspace.name?.[0]?.toUpperCase() || "W"}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold leading-tight">
                {workspace.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {workspace.description || "No description added."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInviteOpen(true)}
              className="px-3 md:px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs md:text-sm flex items-center gap-2 hover:bg-slate-50"
            >
              <UserPlus className="h-4 w-4" />
              Invite
            </button>
            <button className="px-3 md:px-4 py-2 rounded-xl bg-violet-600 text-white text-xs md:text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-violet-700">
              <Settings className="h-4 w-4" />
              Manage
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="mt-4 border-b border-slate-200 flex gap-6 text-sm font-medium overflow-x-auto">
          {["overview", "board", "members"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 relative whitespace-nowrap ${
                activeTab === tab
                  ? "text-violet-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.toUpperCase()}
              {activeTab === tab && (
                <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-violet-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN */}
      <main className="px-4 md:px-10 py-6 md:py-8 space-y-8">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Members"
              value={stats.members}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              label="Groups"
              value={stats.groups}
              icon={<Layers className="h-5 w-5" />}
            />
            <StatCard
              label="Tasks"
              value={stats.tasks}
              icon={<ListChecks className="h-5 w-5" />}
            />
          </section>
        )}

        {/* BOARD */}
        {activeTab === "board" && (
          <section className="grid gap-4 md:gap-6 md:grid-cols-3">
            {groups.map((group) => {
              const groupTasks = tasksForGroup(group.id);
              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[75vh]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, group)}
                >
                  {/* column header */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">
                        {group.name}
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        {groupTasks.length} task
                        {groupTasks.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <button
                      onClick={() => setAddTaskGroup(group)}
                      className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Plus className="h-4 w-4 text-slate-600" />
                    </button>
                  </div>

                  {/* column body */}
                  <div className="p-3 space-y-3 overflow-y-auto">
                    {groupTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 cursor-grab hover:bg-slate-100 flex gap-3"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="pt-1">
                          <GripVertical className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">
                            {task.name}
                          </p>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                            {task.dueDate && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-[2px] text-slate-600">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] ${
                                task.priority === "URGENT"
                                  ? "bg-red-100 text-red-700"
                                  : task.priority === "HIGH"
                                  ? "bg-orange-100 text-orange-700"
                                  : task.priority === "LOW"
                                  ? "bg-sky-100 text-sky-700"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {groupTasks.length === 0 && (
                      <p className="text-xs text-slate-400 px-1 py-2">
                        No tasks here yet. Drag one in or click + to create.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {groups.length === 0 && (
              <div className="col-span-full text-sm text-slate-500 border border-dashed border-slate-300 rounded-2xl px-4 py-10 text-center bg-white">
                No groups found for this workspace. Check backend seeding or
                group creation.
              </div>
            )}
          </section>
        )}

        {/* MEMBERS */}
        {activeTab === "members" && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage who can access this workspace and their roles.
                </p>
              </div>
              <button
                onClick={() => setInviteOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs flex items-center gap-1 hover:bg-slate-50"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Invite
              </button>
            </div>

            {members.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl py-10 text-center text-sm text-slate-400">
                No members yet. Use the invite button to add.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,2fr)_minmax(0,1fr)] px-4 py-2.5 text-[11px] font-medium text-slate-500 bg-slate-50">
                  <span>Name</span>
                  <span>Email</span>
                  <span className="text-right">Role</span>
                </div>
                {members.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`grid grid-cols-[minmax(0,1.7fr)_minmax(0,2fr)_minmax(0,1fr)] px-4 py-3 text-sm items-center ${
                      idx !== members.length - 1
                        ? "border-t border-slate-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
                        {m.name
                          ? m.name
                              .split(" ")
                              .slice(0, 2)
                              .map((s) => s[0]?.toUpperCase())
                              .join("")
                          : "U"}
                      </div>
                      <span className="font-medium text-slate-800">
                        {m.name || "Unknown user"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 truncate">
                      {m.email}
                    </span>
                    <div className="flex justify-end">
                      <button
                        onClick={() => openRoleModal(m)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-[11px] text-slate-700 border border-slate-200 hover:bg-slate-200"
                      >
                        {m.role || "MEMBER"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ADD TASK MODAL */}
      <AnimatePresence>
        {addTaskGroup && (
          <AddTaskModal
            group={addTaskGroup}
            workspaceId={workspaceId}
            token={token}
            onClose={() => setAddTaskGroup(null)}
            onTaskCreated={(task) =>
              setTasks((prev) => [...prev, normalizeTasks([task])[0]])
            }
          />
        )}
      </AnimatePresence>

      {/* INVITE MODAL */}
      <AnimatePresence>
        {inviteOpen && (
          <InviteModal
            workspaceId={workspaceId}
            token={token}
            onClose={() => setInviteOpen(false)}
            onInvited={fetchAll}
          />
        )}
      </AnimatePresence>

      {/* ROLE MODAL */}
      <AnimatePresence>
        {roleModalUser && (
          <RoleModal
            user={roleModalUser}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            onClose={() => setRoleModalUser(null)}
            onSave={handleSaveRole}
            saving={savingRole}
          />
        )}
      </AnimatePresence>

      {/* ERROR TOAST */}
      {error && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl bg-red-500 text-white text-sm shadow-lg flex items-center gap-2">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================== SMALL COMPONENTS ================== */

function StatCard({ label, value, icon }) {
  return (
    <motion.div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex gap-4 items-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </motion.div>
  );
}

function AddTaskModal({ group, workspaceId, token, onClose, onTaskCreated }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    priority: "NORMAL",
    dueDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Task name is required");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3000/tasks",
        {
          name: form.name.trim(),
          description: form.description || null,
          priority: form.priority,
          dueDate: form.dueDate || null,
          workspaceId: Number(workspaceId),
          groupId: group.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTask = res.data.data || res.data.task || res.data;
      onTaskCreated(newTask);
      onClose();
    } catch (err) {
      console.error("Create task error:", err);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to create task"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">New task in {group.name}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 mb-2 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-medium text-slate-700">
              Task name
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500"
              placeholder="Implement auth flow"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Description
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500"
              rows={3}
              placeholder="Optional details about this task"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-700">
                Priority
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 bg-white"
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value }))
                }
              >
                <option value="URGENT">URGENT</option>
                <option value="HIGH">HIGH</option>
                <option value="NORMAL">NORMAL</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-xs font-medium text-slate-700">
                Due date
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-violet-600 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create task
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InviteModal({ workspaceId, token, onClose, onInvited }) {
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleInvite = async () => {
    if (!userId.trim()) {
      setError("User ID is required (backend expects userId).");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await axios.post(
        `http://localhost:3000/workspaces/${workspaceId}/members`,
        { userId: Number(userId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onInvited) {
        await onInvited(); // refetch workspace & members
      }
      onClose();
    } catch (err) {
      console.error("Invite error:", err);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to invite user"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">Invite member</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 mb-2 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <p className="text-xs text-slate-500 mb-3">
          For now backend expects a{" "}
          <span className="font-semibold">User ID</span>. Once you have an
          “invite by email” endpoint, you can swap this field.
        </p>

        <label className="text-xs font-medium text-slate-700">
          User ID to add
        </label>
        <input
          className="mt-1 mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500"
          placeholder="e.g. 3"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-violet-600 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Invite
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RoleModal({
  user,
  selectedRole,
  setSelectedRole,
  onClose,
  onSave,
  saving,
}) {
  const roles = ["OWNER", "ADMIN", "MEMBER", "VIEWER"]; // match enum

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">
            Change role for {user.name || "user"}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Choose the level of access this member should have in the workspace.
        </p>

        <div className="space-y-2 mb-4">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${
                selectedRole === role
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{role}</span>
              {selectedRole === role && (
                <BadgeCheck className="h-4 w-4 text-violet-500" />
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-violet-600 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
