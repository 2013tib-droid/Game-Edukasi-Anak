import { Routes, Route } from 'react-router-dom';
import Layout from './Layout.jsx';
import HomePage from '../portal/HomePage.jsx';
import GroupPage from '../portal/GroupPage.jsx';
import GameLauncher from '../portal/GameLauncher.jsx';
import ParentAreaPage from '../portal/ParentAreaPage.jsx';
import LoginPage from '../auth/LoginPage.jsx';
import RegisterPage from '../auth/RegisterPage.jsx';
import ParentGate from '../auth/ParentGate.jsx';
import NotFoundPage from '../portal/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/kelompok/:groupId" element={<GroupPage />} />
        <Route path="/main/:groupId/:gameId" element={<GameLauncher />} />
        <Route
          path="/orangtua"
          element={
            <ParentGate>
              <ParentAreaPage />
            </ParentGate>
          }
        />
        <Route
          path="/masuk"
          element={
            <ParentGate>
              <LoginPage />
            </ParentGate>
          }
        />
        <Route
          path="/daftar"
          element={
            <ParentGate>
              <RegisterPage />
            </ParentGate>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
