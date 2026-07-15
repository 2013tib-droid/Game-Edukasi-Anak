import { Routes, Route } from 'react-router-dom';
import HomePage from '../portal/HomePage';
import GroupPage from '../portal/GroupPage';
import ParentAreaPage from '../portal/ParentAreaPage';
import LoginPage from '../auth/LoginPage';
import RegisterPage from '../auth/RegisterPage';
import ActivationPage from '../auth/ActivationPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/kelompok/:groupId" element={<GroupPage />} />
      <Route path="/orang-tua" element={<ParentAreaPage />} />
      <Route path="/masuk" element={<LoginPage />} />
      <Route path="/daftar" element={<RegisterPage />} />
      <Route path="/aktivasi" element={<ActivationPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
