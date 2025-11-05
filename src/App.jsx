import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header/Header"
import Footer from "./components/Footer/Footer"
import HomePage from "./pages/HomePage/HomePage"
import AnnouncementsPage from "./pages/AnnouncementsPage/AnnouncementsPage"
import FacilityAvailabilityPage from "./pages/FacilityAvailabilityPage/FacilityAvailabilityPage"
import styles from "./App.module.css"

function App() {
  return (
    <Router>
      <div className={styles.app}>
        <Header />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/facility-availability" element={<FacilityAvailabilityPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
