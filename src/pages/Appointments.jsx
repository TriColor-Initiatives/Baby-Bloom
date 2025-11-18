import AppointmentManager from '../components/health/AppointmentManager';
import '../styles/pages.css';

const Appointments = () => (
  <div className="page-container">
    <div className="page-header">
      <h1 className="page-title">📅 Appointments</h1>
      <p className="page-subtitle">
        Plan upcoming doctor visits and keep notes for every checkup.
      </p>
    </div>

    <div className="section-card">
      <AppointmentManager />
    </div>
  </div>
);

export default Appointments;

