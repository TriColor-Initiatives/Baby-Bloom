import VaccinationTracker from '../components/health/VaccinationTracker';
import '../styles/pages.css';

const Vaccinations = () => (
  <div className="page-container">
    <div className="page-header">
      <h1 className="page-title">💉 Vaccinations</h1>
      <p className="page-subtitle">
        Follow an age-based schedule and know what&apos;s coming next.
      </p>
    </div>

    <div className="section-card">
      <VaccinationTracker />
    </div>
  </div>
);

export default Vaccinations;

