import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserRoute from "./routes/userRoute";
import AdminRoute from "./routes/adminRoute";

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/*" element={<UserRoute />} />
          <Route path="/admin/*" element={<AdminRoute />} />
      </Routes>
    </Router>
  );
}

export default App;
