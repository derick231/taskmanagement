import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import WorkspacePage from "./pages/WorkspacePage";
import CreateWorkSpace from "./pages/CreateWorkSpace";
import Messages from "./pages/Messages";

function App() {
  return (
    <div className="w-screen">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Homepage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/workspace/:id" element={<WorkspacePage />} />
          <Route path="/workspace/create" element={<CreateWorkSpace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
