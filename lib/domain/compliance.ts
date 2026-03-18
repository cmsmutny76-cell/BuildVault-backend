export interface ComplianceReference {
  code: string;
  title: string;
  url?: string;
}

export interface ComplianceGuidance {
  summary: string;
  jurisdiction: {
    state: string;
    city?: string;
    zipCode?: string;
  };
  findings: Array<{
    rule: string;
    severity: 'info' | 'warning' | 'critical';
    confidence: number;
    references: ComplianceReference[];
  }>;
  checkedAt: string;
}
