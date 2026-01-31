import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { Layout } from "./pages/layout";
import { NewspaperWrapper } from "./components/newspaper/wrapper";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Layout>
              <NewspaperWrapper />
            </Layout>
          }
        />
        <Route
          path="/report/:date"
          element={
            <Layout>
              <NewspaperWrapper />
            </Layout>
          }
          
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
