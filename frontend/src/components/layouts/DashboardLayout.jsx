import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  LogOut,
  Menu,
  X,
  User,
  BarChart3,
  CheckCircle,
  Droplet,
  ClipboardList,
  Activity,
  History,
  Building,
  Shield,
  Calendar,
  AlertTriangle,
  ClipboardPlus,
  Ambulance,
  TestTube,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  Loader2,
  Heart,
} from "lucide-react";

const DashboardLayout = ({ userRole = "donor" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const theme = {
    primary: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    accent: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
  };

  const menuConfig = {
    donor: {
      title: "Blood Donor Portal",
      subtitle: "Be a Hero, Save Lives",
      shortTitle: "Donor",
      icon: User,
      items: [
        { path: "/donor", label: "Dashboard", icon: BarChart3, badge: null },
        { path: "/donor/profile", label: "My Profile", icon: User, badge: null },
        { path: "/donor/history", label: "Donation History", icon: History, badge: null },
        { path: "/donor/camps", label: "Blood Camps", icon: Calendar, badge: null },
      ],
    },
    hospital: {
      title: "Hospital Management",
      subtitle: "Blood Request & Inventory",
      shortTitle: "Hospital",
      icon: Building,
      items: [
        { path: "/hospital", label: "Dashboard", icon: BarChart3, badge: null },
        { path: "/hospital/blood-request-create", label: "Blood Requests", icon: ClipboardList, badge: null },
        { path: "/hospital/inventory", label: "Inventory", icon: Droplet, badge: null },
        { path: "/hospital/donors", label: "Donors", icon: User, badge: null },
        { path: "/hospital/blood-request-history", label: "History", icon: Ambulance, badge: null },
      ],
    },
    "blood-lab": {
      title: "Blood Lab Center",
      subtitle: "Testing & Quality Control",
      shortTitle: "Lab",
      icon: TestTube,
      items: [
        { path: "/lab", label: "Dashboard", icon: BarChart3, badge: null },
        { path: "/lab/inventory", label: "Inventory", icon: Droplet, badge: null },
        { path: "/lab/donor", label: "Donors", icon: User, badge: null },
        { path: "/lab/camps", label: "Camps", icon: Calendar, badge: null },
        { path: "/lab/requests", label: "Requests", icon: ClipboardList, badge: null },
        { path: "/lab/profile", label: "Profile", icon: CheckCircle, badge: null },
      ],
    },
    admin: {
      title: "BBMS Admin Panel",
      subtitle: "System Administration",
      shortTitle: "Admin",
      icon: Shield,
      items: [
        { path: "/admin", label: "Overview", icon: BarChart3, badge: null },
        { path: "/admin/verification", label: "Verification", icon: Shield, badge: null },
        { path: "/admin/facilities", label: "Facilities", icon: Building, badge: null },
        { path: "/admin/camps", label: "Camps", icon: Calendar, badge: null },
        { path: "/admin/donors", label: "Donors", icon: User, badge: null },
      ],
    },
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const maxRetries = 3;
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          const apiUrl = `${import.meta.env.VITE_API_URL || ""}/api/auth/profile`;
          const res = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            const user = data.user;

            if (!user) throw new Error("User data structure invalid.");

            if (user.role.toLowerCase() !== userRole.toLowerCase()) {
              localStorage.removeItem("token");
              navigate("/login");
              return;
            }

            setUserData(user);
            setIsLoading(false);
            return;
          } else if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error(`Attempt ${attempt + 1} failed`, error);
        }

        attempt++;
        if (attempt < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }

      localStorage.removeItem("token");
      navigate("/login");
      setIsLoading(false);
    };

    fetchUserData();
  }, [userRole, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Heart className="w-12 h-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Dashboard
          </h2>
          <p className="text-gray-500">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  const menuItems = menuConfig[userRole] || menuConfig.donor;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <menuItems.icon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                {sidebarCollapsed ? menuItems.shortTitle : menuItems.title}
              </h1>
              {!sidebarCollapsed && (
                <p className="text-xs text-gray-500">{menuItems.subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.items.map((item) => (
              <li key={item.path}>
                <a
                  href={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-red-50 text-red-700 border-r-2 border-red-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {item.badge && !sidebarCollapsed && (
                    <span className="ml-auto bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {userData?.name || "User"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;