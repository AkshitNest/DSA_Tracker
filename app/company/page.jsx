import CompanyDashboard from '../../components/CompanyDashboard';

export const metadata = {
  title: 'Company Prep Dashboard'
};

export default function Page() {
  return (
    <main id="app">
      <header>
        <div className="logo">Company Prep • DSA Tracker</div>
      </header>
      <CompanyDashboard />
    </main>
  );
}
