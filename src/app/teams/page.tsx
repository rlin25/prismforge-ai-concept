import { Metadata } from 'next';
import { TeamManagement } from '@/components/admin/TeamManagement';
import { ProfessionalHeader } from '@/components/professional/ProfessionalHeader';

export const metadata: Metadata = {
  title: 'Team Management | PrismForge AI',
  description: 'Team collaboration and member management for enterprise M&A validation.',
};

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <TeamManagement />
        </div>
      </main>
    </div>
  );
}