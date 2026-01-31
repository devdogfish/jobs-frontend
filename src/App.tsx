import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Layout } from "./components/layout";
import { ReportPage } from "./components/report/page";
import AuthPage from "./components/auth/page";
import HomePage from "./components/home/page";
import { getTodayISOString } from "./utils";

function ReportRedirect() {
  return <Navigate to={`/report/${getTodayISOString()}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route path="/report" element={<ReportRedirect />} />
        <Route
          path="/report/:date"
          element={
            <Layout>
              <ReportPage />
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
