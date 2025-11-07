import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Feeding from './pages/Feeding';
import Sleep from './pages/Sleep';
import Diaper from './pages/Diaper';
import Health from './pages/Health';
import Growth from './pages/Growth';
import Milestones from './pages/Milestones';
import Activities from './pages/Activities';
import Photos from './pages/Photos';
import MotherHealth from './pages/MotherHealth';
import Breastfeeding from './pages/Breastfeeding';
import Education from './pages/Education';
import Tips from './pages/Tips';
import Recipes from './pages/Recipes';
import Timeline from './pages/Timeline';
import Settings from './pages/Settings';
import Reminders from './pages/Reminders';

// For UI-first workflow: skip authentication gating for now and open main UI directly
function App() {
  return (
    <Routes>
      {/* Keep a login route but redirect to main UI for now */}
      <Route path="/login" element={<Navigate to="/" replace />} />

      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="feeding" element={<Feeding />} />
        <Route path="sleep" element={<Sleep />} />
        <Route path="diaper" element={<Diaper />} />
        <Route path="health" element={<Health />} />
        <Route path="growth" element={<Growth />} />
        <Route path="milestones" element={<Milestones />} />
        <Route path="activities" element={<Activities />} />
        <Route path="photos" element={<Photos />} />
  <Route path="reminders" element={<Reminders />} />
        <Route path="mother-health" element={<MotherHealth />} />
        <Route path="breastfeeding" element={<Breastfeeding />} />
        <Route path="education" element={<Education />} />
        <Route path="tips" element={<Tips />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
