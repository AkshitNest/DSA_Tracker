import RevisionDashboard from '../../components/RevisionDashboard';

export const metadata = {
  title: 'Revision Dashboard'
};

export default function Page() {
  return (
    <main id="app">
      <header>
        <div className="logo">Revision • DSA Tracker</div>
      </header>
      <RevisionDashboard />
    </main>
  );
}
