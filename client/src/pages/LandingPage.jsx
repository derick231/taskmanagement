import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Calendar,
  Users,
  Zap,
  Settings,
  Bell,
  ChevronRight,
  Filter,
  Clock,
  Star,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  Shield,
  Smartphone,
  Globe,
  BarChart3,
  Target,
  Workflow,
  Menu,
  X,
  Heart,
  Coffee,
  BookOpen,
  Download,
  Play,
  MessageCircle,
  HelpCircle,
  Code,
  Lightbulb,
  Rocket,
} from "lucide-react";

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Animated counter for stats
  const [counters, setCounters] = useState({
    users: 0,
    tasks: 0,
    teams: 0,
  });

  useEffect(() => {
    const animateCounter = (target, key, duration = 2000) => {
      const start = 0;
      const startTime = Date.now();

      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * progress);

        setCounters((prev) => ({ ...prev, [key]: current }));

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      updateCounter();
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounter(50000, "users");
        animateCounter(1200000, "tasks");
        animateCounter(5000, "teams");
      }
    });

    const statsElement = document.getElementById("stats-section");
    if (statsElement) observer.observe(statsElement);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Smart Task Creation",
      description:
        "Create unlimited tasks with titles, descriptions, due dates, and priority levels. Organize everything with intelligent categorization.",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Unlimited Workspaces",
      description:
        "Create as many workspaces as you need for different projects. Keep work, personal, and side projects perfectly organized without any limits.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description:
        "Invite unlimited team members and assign tasks with different roles. Enable seamless teamwork with role-based access control for everyone.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: <Workflow className="h-6 w-6" />,
      title: "Customizable Workflows",
      description:
        "Create custom groups and workflow stages that fit your process. Kanban boards, lists, calendar views - all available to everyone.",
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Advanced Analytics",
      description:
        "Track your productivity with detailed analytics and reports. See your progress over time and identify areas for improvement.",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description:
        "Your data is encrypted and secure. We believe privacy should be accessible to everyone.",
      color: "from-green-500 to-emerald-600",
    },
  ];

  // const tutorials = [
  //   {
  //     title: "Getting Started with Taskflow",
  //     description: "Learn the basics of task management and workspace setup",
  //     duration: "5 min",
  //     level: "Beginner",
  //   },
  //   {
  //     title: "Team Collaboration Mastery",
  //     description: "How to effectively manage team projects and assignments",
  //     duration: "8 min",
  //     level: "Intermediate",
  //   },
  //   {
  //     title: "Advanced Workflow Automation",
  //     description: "Set up automated workflows to boost your productivity",
  //     duration: "12 min",
  //     level: "Advanced",
  //   },
  // ];

  const communityStats = [
    {
      icon: <Heart className="h-5 w-5" />,
      label: "Community Members",
      value: "50K+",
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      label: "Daily Active Users",
      value: "15K+",
    },
    {
      icon: <Code className="h-5 w-5" />,
      label: "Open Source Contributors",
      value: "200+",
    },
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Student",
      company: "University",
      avatar: "MS",
      content:
        "As a student, TaskManagement has been a lifesaver. I can organize all my assignments and group projects easily.",
    },
    {
      name: "Ahmed Hassan",
      role: "Freelancer",
      company: "Independent",
      avatar: "AH",
      content:
        "Starting my freelance career, I needed something powerful. TaskManagement gives me everything I need to manage multiple clients and projects.",
    },
    {
      name: "Sarah Kim",
      role: "Non-profit Coordinator",
      company: "Local NGO",
      avatar: "SK",
      content:
        "Our small non-profit needs efficient tools. TaskManagement helps us coordinate volunteers and manage community projects effectively!",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br w-screen from-violet-50 via-white to-cyan-50">
      {/* Navigation Header */}
      <nav className="sticky top-4 mx-4 mb-8 rounded-2xl backdrop-blur-xl border bg-white/80 border-white/20 shadow-lg z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">TaskManagement</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#community"
                className="font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Community
              </a>
              <a
                href="#tutorials"
                className="font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Learn
              </a>
              <a
                href="#support"
                className="font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Support
              </a>

              <button
                onClick={() => (window.location.href = "/auth")}
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Start Using
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-900" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-3">
              <a
                href="#features"
                className="block py-2 font-medium text-gray-600"
              >
                Features
              </a>
              <a
                href="#community"
                className="block py-2 font-medium text-gray-600"
              >
                Community
              </a>
              <a
                href="#tutorials"
                className="block py-2 font-medium text-gray-600"
              >
                Learn
              </a>
              <a
                href="#support"
                className="block py-2 font-medium text-gray-600"
              >
                Support
              </a>
              <button
                onClick={() => (window.location.href = "/auth")}
                className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium"
              >
                Start Using
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  No Limits
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
                Powerful Task Management
                <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  For Everyone
                </span>
              </h1>
              <p className="text-xl leading-relaxed text-gray-600">
                We believe productivity tools should be accessible to everyone.
                TaskManagement provides enterprise-grade task management features
                without any limits.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => (window.location.href = "/auth")}
                className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-violet-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Using Now</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 text-white hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-4 sm:space-y-0 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Visual - Task Dashboard Mockup */}
          <div className="relative">
            <div className="rounded-2xl p-6 border bg-white/80 border-white/20 backdrop-blur-xl shadow-2xl">
              {/* Mockup Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Today's Focus
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm px-3 py-1 rounded-full bg-violet-100 text-violet-700">
                    4 tasks
                  </span>
                </div>
              </div>

              {/* Mockup Tasks */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 transition-all">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-through text-gray-500">
                        Complete project proposal
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                          Completed
                        </span>
                        <span className="text-sm text-gray-500">9:00 AM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 transition-all">
                  <div className="flex items-center space-x-3">
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          Team meeting preparation
                        </h4>
                        <Star className="h-4 w-4 text-amber-500 fill-current flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
                          Urgent
                        </span>
                        <span className="text-sm text-gray-500">2:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 transition-all">
                  <div className="flex items-center space-x-3">
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        Review study materials
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          Medium
                        </span>
                        <span className="text-sm text-gray-500">4:30 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Daily Progress</span>
                  <span className="text-sm font-medium text-gray-900">75%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 w-3/4 transition-all duration-500"></div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
              Why TaskManagement?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We believe that everyone deserves access to powerful productivity
              tools. Whether you're a
              student, starting freelancer, non-profit worker, or simply someone
              who values open software - TaskManagement is built for you.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-xl shadow-sm">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Community Driven
                </h3>
                <p className="text-sm text-gray-600">
                  Built by the community, for the community. Your feedback
                  shapes our features.
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-sm">
                <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Open Source
                </h3>
                <p className="text-sm text-gray-600">
                  Transparent, secure, and constantly improving through
                  collaborative development.
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-sm">
                <Globe className="h-8 w-8 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Global Access
                </h3>
                <p className="text-sm text-gray-600">
                  Breaking down barriers so everyone worldwide can access
                  powerful productivity tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Enterprise Features
              <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                {" "}
                For Everyone
              </span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-600">
              Get all the powerful features you need to manage tasks,
              collaborate with teams, and boost productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border bg-white border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Join Our Amazing Community
            </h2>
            <p className="text-xl text-gray-600">
              Connect with thousands of users, share tips, get help, and
              contribute to making TaskManagement even better
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {communityStats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-sm"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl text-white">
              <MessageCircle className="h-10 w-10 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Join Our Forum</h3>
              <p className="mb-6 opacity-90">
                Get help from the community, share your workflows, and discuss
                new features with fellow users.
              </p>
              <button className="px-6 py-3 bg-white text-violet-600 rounded-xl font-medium hover:bg-gray-100 transition-all">
                Join Discussion
              </button>
            </div>

            <div className="p-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white">
              <Code className="h-10 w-10 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Contribute Code</h3>
              <p className="mb-6 opacity-90">
                Help us build new features, fix bugs, and make TaskManagement better
                for everyone. All skill levels welcome!
              </p>
              <button className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-medium hover:bg-gray-100 transition-all">
                View on GitHub
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Real Stories from Real Users
            </h2>
            <p className="text-xl text-gray-600">
              See how TaskManagement is helping people from all walks of life achieve
              their goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border bg-white border-gray-100 shadow-lg"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="leading-relaxed text-gray-600">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-1 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Get Help & Support
            </h2>
            <p className="text-xl text-gray-600">
              Free support for everyone. Because everyone deserves help when
              they need it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 text-center bg-white rounded-xl shadow-sm border border-gray-100">
              <HelpCircle className="h-10 w-10 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Help Center</h3>
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive guides and FAQs
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Browse Articles
              </button>
            </div>

            <div className="p-6 text-center bg-white rounded-xl shadow-sm border border-gray-100">
              <MessageCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Community Forum
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Get help from other users
              </p>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                Ask Question
              </button>
            </div>

            <div className="p-6 text-center bg-white rounded-xl shadow-sm border border-gray-100">
              <BookOpen className="h-10 w-10 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Documentation
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Detailed technical docs
              </p>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                Read Docs
              </button>
            </div>

            <div className="p-6 text-center bg-white rounded-xl shadow-sm border border-gray-100">
              <Coffee className="h-10 w-10 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Office Hours</h3>
              <p className="text-sm text-gray-600 mb-4">Live help sessions</p>
              <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                Join Session
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section
      <section className="py-20 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Rocket className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students, freelancers, and teams who are already using Taskflow to stay organized and productive - completely free!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={() => window.location.href = '/auth'}
              className="px-8 py-4 bg-white text-violet-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Launch Web App
            </button>
            <button className="px-8 py-4 border-2 border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Download Desktop</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center opacity-80">
            <div>
              <p className="text-2xl font-bold">Always</p>
              <p className="text-sm">100% Free</p>
            </div>
            <div>
              <p className="text-2xl font-bold">No</p>
              <p className="text-sm">Registration Required</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Unlimited</p>
              <p className="text-sm">Everything</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="py-12 border-t bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">TaskManagement</h3>
              </div>
              <p className="text-gray-600">
                Powerful task management for everyone. No limits, no
                compromise.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-white text-xs font-bold">tw</span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-white text-xs font-bold">gh</span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-white text-xs font-bold">dc</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
              <div className="space-y-3">
                {["Features", "Tutorials", "Templates", "Mobile App"].map(
                  (link) => (
                    <a
                      key={link}
                      href="#"
                      className="block text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link}
                    </a>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Community</h4>
              <div className="space-y-3">
                {["Forum", "Discord", "GitHub", "Contributors"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Support</h4>
              <div className="space-y-3">
                {[
                  "Help Center",
                  "Documentation",
                  "Bug Reports",
                  "Feature Requests",
                ].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600">
              © 2025 Taskflow. Open source and forever free.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Open Source License
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
