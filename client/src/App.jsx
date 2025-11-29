import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./context/SocketProvider";
import Homepage from "./pages/Homepage";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import WorkspacePage from "./pages/WorkspacePage";
import CreateWorkSpace from "./pages/CreateWorkSpace";
import Messages from "./pages/Messages";
import CreateOrganization from "./pages/CreateOrganization";

function App() {
  return (
    <div className="w-screen">
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Dashboard routes with layout */}
            <Route path="/dashboard" element={<Homepage />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/workspace/:id" element={<WorkspacePage />} />
            <Route path="/workspace/create" element={<CreateWorkSpace />} />
            <Route path="/create-organization" element={<CreateOrganization />} />
          </Routes>
        </Router>
      </SocketProvider>
    </div>
  );
}

export default App;
