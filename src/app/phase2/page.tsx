import { Metadata } from 'next';
import { ProfessionalTransition } from '@/components/professional/ProfessionalTransition';

export const metadata: Metadata = {
  title: 'Phase 2 - Professional Validation | PrismForge AI',
  description: 'Multi-agent adversarial validation with Professional Quality Score ≥85% standard.',
};

export default function Phase2Page() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalTransition />
    </div>
  );
}