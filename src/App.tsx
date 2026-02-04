import { useState } from 'react';
import { Layout } from './components/Layout';
import { Inbox } from './pages/Inbox';
import { TrialPending } from './pages/TrialPending';
import { CRM } from './pages/CRM';
import { Report } from './pages/Report';

function App() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'crm' | 'report' | 'trial-pending'>('inbox');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'inbox' && <Inbox />}
      {activeTab === 'trial-pending' && <TrialPending />}
      {activeTab === 'crm' && <CRM />}
      {activeTab === 'report' && <Report />}
    </Layout>
  );
}

export default App;