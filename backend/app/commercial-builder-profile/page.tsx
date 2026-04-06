'use client';

import AccountProfileWizard from '../../components/web/AccountProfileWizard';

export default function CommercialBuilderProfilePage() {
  return (
    <AccountProfileWizard
      pageTitle="Complete Your Commercial Builder Profile"
      pageSubtitle="Set up business details, commercial project types, licenses, and coverage area for higher-value matching."
      saveLabel="Save Commercial Builder Profile"
      successMessage="Commercial builder profile saved. Your company is ready for commercial owner and developer matching."
      initialValues={{
        companyName: '',
        businessType: 'llc',
        yearsInBusiness: '',
        completedProjects: '',
        email: '',
        phone: '',
        website: '',
        commercialProjectTypes: ['office'],
        projectScales: ['500k-2m'],
        budgetRanges: ['100k-250k'],
        activeBids: '',
        licenseNumber: '',
        licenseState: '',
        isInsured: false,
        isBonded: false,
        city: '',
        state: '',
        zipCode: '',
        serviceRadius: '50',
        additionalZips: '',
        isAccepting: true,
        maxProjects: '5',
      }}
      steps={[
        {
          key: 'business',
          title: '🏢 Business Information',
          fields: [
            { key: 'companyName', type: 'text', label: 'Company Name', required: true, colSpan: 2, placeholder: 'Summit Commercial Builders LLC' },
            {
              key: 'businessType',
              type: 'options',
              label: 'Business Type',
              required: true,
              colSpan: 2,
              options: [
                { value: 'sole-proprietor', label: 'Sole Proprietor' },
                { value: 'llc', label: 'LLC' },
                { value: 'corporation', label: 'Corporation' },
                { value: 'partnership', label: 'Partnership' },
              ],
            },
            { key: 'yearsInBusiness', type: 'number', label: 'Years in Business', required: true, placeholder: '12' },
            { key: 'completedProjects', type: 'number', label: 'Completed Projects', placeholder: '88' },
            { key: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'estimating@summitbuilders.com' },
            { key: 'phone', type: 'text', label: 'Phone Number', required: true, placeholder: '(555) 321-0987' },
            { key: 'website', type: 'text', label: 'Website', colSpan: 2, placeholder: 'www.summitbuilders.com' },
          ],
        },
        {
          key: 'projects',
          title: '🏗️ Project Types & Scale',
          infoBox: {
            tone: 'blue',
            text: 'High-value commercial opportunities are prioritized based on project type, scale, and response capacity.',
          },
          fields: [
            {
              key: 'commercialProjectTypes',
              type: 'chips',
              label: 'Commercial Project Types',
              required: true,
              colSpan: 2,
              options: [
                { value: 'office', label: 'Office' },
                { value: 'retail', label: 'Retail' },
                { value: 'warehouse', label: 'Warehouse' },
                { value: 'industrial', label: 'Industrial' },
                { value: 'mixed-use', label: 'Mixed Use' },
                { value: 'healthcare', label: 'Healthcare' },
                { value: 'government', label: 'Government' },
              ],
            },
            {
              key: 'projectScales',
              type: 'chips',
              label: 'Typical Project Scale',
              required: true,
              colSpan: 2,
              options: [
                { value: '100k-500k', label: '$100K - $500K' },
                { value: '500k-2m', label: '$500K - $2M' },
                { value: '2m-10m', label: '$2M - $10M' },
                { value: '10m-plus', label: '$10M+' },
              ],
            },
            {
              key: 'budgetRanges',
              type: 'chips',
              label: 'Typical Budget Ranges',
              colSpan: 2,
              options: [
                { value: '50k-100k', label: '$50K - $100K' },
                { value: '100k-250k', label: '$100K - $250K' },
                { value: '250k-500k', label: '$250K - $500K' },
                { value: '500k-plus', label: '$500K+' },
              ],
            },
            { key: 'activeBids', type: 'number', label: 'Active Bids in Progress', colSpan: 2, placeholder: '14' },
          ],
        },
        {
          key: 'certifications',
          title: '📜 Licenses & Bonds',
          infoBox: {
            tone: 'violet',
            text: 'Licensing, insurance, and bond information improve trust scores for owners and developers reviewing your profile.',
          },
          fields: [
            { key: 'licenseNumber', type: 'text', label: 'License Number', placeholder: 'B-1234567' },
            { key: 'licenseState', type: 'text', label: 'License State', placeholder: 'CA', maxLength: 2 },
            { key: 'isInsured', type: 'checkbox', label: 'Currently Insured', colSpan: 2 },
            { key: 'isBonded', type: 'checkbox', label: 'Currently Bonded', colSpan: 2 },
          ],
        },
        {
          key: 'area',
          title: '📍 Service Area',
          fields: [
            { key: 'city', type: 'text', label: 'Primary Market - City', required: true, placeholder: 'Dallas' },
            { key: 'state', type: 'text', label: 'State', required: true, placeholder: 'TX', maxLength: 2 },
            { key: 'zipCode', type: 'text', label: 'ZIP Code', required: true, placeholder: '75201' },
            { key: 'serviceRadius', type: 'number', label: 'Coverage Radius (miles)', required: true, placeholder: '50' },
            { key: 'additionalZips', type: 'text', label: 'Additional ZIP Codes', colSpan: 2, placeholder: '75001, 75006, 75234' },
            { key: 'isAccepting', type: 'checkbox', label: 'Currently Accepting New Commercial Opportunities', colSpan: 2 },
            { key: 'maxProjects', type: 'number', label: 'Maximum Projects Per Month', colSpan: 2, placeholder: '5' },
          ],
        },
      ]}
    />
  );
}