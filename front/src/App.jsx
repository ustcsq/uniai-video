import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import MiniNav from "./components/MiniNav.jsx";
import HomePage from "./pages/HomePage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import WorkbenchPage from "./pages/WorkbenchPage.jsx";
import PromptsPage from "./pages/PromptsPage.jsx";
import ReversePage from "./pages/ReversePage.jsx";
import UserCenterPage from "./pages/UserCenterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

export default function App() {
  const loc = useLocation();
  const showMiniNav = loc.pathname !== "/" && loc.pathname !== "/login";
  return (
    <>
      {showMiniNav ? <MiniNav /> : null}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/workbench" element={<WorkbenchPage />} />
        <Route path="/prompts" element={<PromptsPage />} />
        <Route path="/reverse" element={<ReversePage />} />
        <Route path="/user" element={<UserCenterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
