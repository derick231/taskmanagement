import React, { useState } from "react";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // --- VALIDATION ---
  const validateForm = () => {
    const e = {};

    if (!formData.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Invalid email address";

    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 6)
      e.password = "Password must be at least 6 characters";

    if (!isLogin) {
      if (!formData.name.trim()) e.name = "Full name is required";
      else if (formData.name.trim().length < 2)
        e.name = "Name must be at least 2 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- INPUT HANDLER ---
  const onChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name])
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    if (message.text) setMessage({ type: "", text: "" });
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const endpoint = isLogin ? "/login" : "/user";

    try {
      const res = await axios.post(
        `http://localhost:3000${endpoint}`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage({
        type: "success",
        text: res.data.message || (isLogin ? "Logged in!" : "Account created!"),
      });

      if (isLogin && res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setTimeout(() => (window.location.href = "/dashboard"), 1500);
      } else {
        setTimeout(() => {
          setIsLogin(true);
          setMessage({ type: "", text: "" });
        }, 1500);
      }

      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      const msg =
        err?.response?.data?.error || "Something went wrong. Try again.";
      setMessage({ type: "error", text: msg });

      if (msg.includes("Email")) {
        setErrors({ email: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- TOGGLE AUTH MODE ---
  const toggleMode = () => {
    setIsLogin((p) => !p);
    setFormData({ name: "", email: "", password: "" });
    setMessage({ type: "", text: "" });
    setErrors({});
  };

  return (
    <div className="min-h-screen  flex items-center justify-center w-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 px-4">
      <div className="relative w-full max-w-md">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-600 mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Taskflow
          </h1>
          <p className="text-gray-600 mt-1">
            {isLogin
              ? "Sign in to continue your productivity journey"
              : "Create an account and start organizing your life"}
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white/80 backdrop-blur-xl shadow-xl border border-white/30 rounded-2xl p-8">
          {/* TOGGLE BUTTONS */}
          <div className="flex p-1 bg-gray-200 rounded-xl mb-8 gap-3">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                isLogin ? "bg-white shadow " : "text-gray-600"
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                !isLogin ? "bg-white shadow " : "text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* MESSAGE */}
          {message.text && (
            <div
              className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${
                message.type === "success"
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

          {/* FORM */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <AuthInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={onChange}
                icon={<User />}
                error={errors.name}
              />
            )}

            <AuthInput
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={onChange}
              icon={<Mail />}
              error={errors.email}
            />

            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={onChange}
              icon={<Lock />}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={errors.password}
              placeholder={
                isLogin ? "Enter your password" : "Create a strong password"
              }
            />

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* SWITCH */}
          <p className="text-gray-600 text-center mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <a
              onClick={toggleMode}
              className="text-violet-600 font-medium hover:underline cursor-pointer"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------ INPUT COMPONENTS ------------------------ */

function AuthInput({ label, icon, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
          {icon}
        </span>

        <input
          {...props}
          className={`w-full pl-12 pr-4 py-3 rounded-xl  bg-white/50 border focus:ring-2 focus:ring-violet-500 transition ${
            error ? "border-red-300" : "border-gray-300"
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

function PasswordInput({
  label,
  icon,
  showPassword,
  setShowPassword,
  error,
  ...props
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
          {icon}
        </span>

        <input
          {...props}
          type={showPassword ? "text" : "password"}
          className={`w-full pl-12 pr-12 py-3 rounded-xl  bg-white/50 border focus:ring-2 focus:ring-violet-500 transition ${
            error ? "border-red-300" : "border-gray-300"
          }`}
        />

        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}
