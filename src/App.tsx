import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Layout } from "./components/layout";
import { ReportPage } from "./components/report/page";
import AuthPage from "./components/auth/page";
import HomePage from "./components/home/page";
import { getTodayISOString } from "./lib/utils";
import { AuthProvider } from "./context/AuthContext";
// import MyMap from "./components/home/map";

function ReportRedirect() {
  return <Navigate to={`/report/${getTodayISOString()}`} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/report/:date" element={<ReportPage />} />
          </Route>

          <Route path="/report" element={<ReportRedirect />} />
          {/* <Route path="/map" element={<MyMap />} /> */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
