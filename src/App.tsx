import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Availability from './pages/Availability';
import Buildings from './pages/Buildings';
import BuildingDetail from './pages/BuildingDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBuildings from './pages/admin/AdminBuildings';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPhotos from './pages/admin/AdminPhotos';

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/buildings" element={<Buildings />} />
          <Route path="/buildings/:slug" element={<BuildingDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="buildings" element={<AdminBuildings />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="photos" element={<AdminPhotos />} />
          </Route>
        </Routes>
      </main>
      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*" element={<Footer />} />
      </Routes>
    </AuthProvider>
  );
}
