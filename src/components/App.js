import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import StockPage from "../pages/StockPage";
import FilterPage from "../pages/FilterPage";
import ResultPage from "../pages/ResultPage";
import Nav from "./Nav";
import styles from "./App.module.css";
import "./App.font.css";

function App() {
  return (
    <Router>
      <Nav className={styles.nav} />
      <div className={styles.body}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stock-page" element={<StockPage />} />
          <Route path="/filter-page" element={<FilterPage />} />
          <Route path="/result-page" element={<ResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
