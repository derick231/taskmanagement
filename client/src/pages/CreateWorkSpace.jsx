import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FolderPlus,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  Building2,
  Link,
} from "lucide-react";

export default function CreateWorkspacePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [organizations, setOrganizations] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tags: "",
    description: "",
    organizationId: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:3000/organizations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrganizations(res.data);
      if (res.data.length > 0) {
        setFormData((prev) => ({ ...prev, organizationId: res.data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Handle change
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "name") {
        newData.slug = generateSlug(value);
      }
      return newData;
    });

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (message.text) setMessage({ type: "", text: "" });
  };

  // Validate Form
  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Workspace name is required";
    if (!formData.slug.trim()) e.slug = "Slug is required";
    if (!formData.organizationId) e.organizationId = "Organization is required";
    if (formData.tags.length > 50) e.tags = "Tags must be under 50 characters";
    if (formData.description.length > 200)
      e.description = "Description must be under 200 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Submit workspace
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      await axios.post("http://localhost:3000/workspaces", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage({ type: "success", text: "Workspace created successfully!" });

      setFormData({
        name: "",
        slug: "",
        tags: "",
        description: "",
        organizationId: formData.organizationId,
      });

      setTimeout(() => (window.location.href = "/dashboard"), 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.error || "Something went wrong. Try again.";
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  if (loadingOrgs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Organizations Found
          </h2>
          <p className="text-gray-600 mb-6">
            You need to create an organization before you can create a workspace.
          </p>
          <a
            href="/create-organization"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700"
          >
            Create Organization
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50 px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Workspace</h1>
          <p className="text-gray-600 mt-1">
            Organize your tasks with a brand new workspace
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white/80 backdrop-blur-xl shadow-xl border border-white/30 rounded-2xl p-8">
          {/* MESSAGE */}
          {message.text && (
            <div
              className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
                }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="text-green-600" />
              ) : (
                <AlertCircle className="text-red-600" />
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* ORGANIZATION SELECT */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Organization
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  <Building2 className="w-5 h-5" />
                </span>
                <select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-gray-300 focus:ring-2 focus:ring-violet-500 transition appearance-none"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* WORKSPACE NAME */}
            <InputField
              label="Workspace Name"
              name="name"
              value={formData.name}
              onChange={onChange}
              icon={<FolderPlus />}
              error={errors.name}
              placeholder="e.g., Team Alpha"
            />

            {/* SLUG */}
            <InputField
              label="Workspace URL Slug"
              name="slug"
              value={formData.slug}
              onChange={onChange}
              icon={<Link />}
              error={errors.slug}
              placeholder="team-alpha"
            />

            {/* TAGS */}
            <InputField
              label="Tags (comma separated)"
              name="tags"
              value={formData.tags}
              onChange={onChange}
              icon={<Tag />}
              error={errors.tags}
              placeholder="e.g., work, project, team"
            />

            {/* DESCRIPTION */}
            <TextAreaField
              label="Description"
              name="description"
              value={formData.description}
              onChange={onChange}
              icon={<FileText />}
              error={errors.description}
              placeholder="Short description about this workspace"
            />

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" /> Creating...
                </>
              ) : (
                <>
                  Create Workspace <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ------------------------ INPUTS ------------------------ */
function InputField({ label, icon, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
          {icon}
        </span>
        <input
          {...props}
          className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border focus:ring-2 focus:ring-violet-500 transition ${error ? "border-red-300" : "border-gray-300"
            }`}
        />
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}

function TextAreaField({ label, icon, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-3 text-gray-600">{icon}</span>
        <textarea
          {...props}
          rows={3}
          className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border focus:ring-2 focus:ring-violet-500 transition ${error ? "border-red-300" : "border-gray-300"
            }`}
        />
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}
