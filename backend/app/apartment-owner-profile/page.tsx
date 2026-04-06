'use client';

import AccountProfileWizard from '../../components/web/AccountProfileWizard';

export default function ApartmentOwnerProfilePage() {
  return (
    <AccountProfileWizard
      pageTitle="Complete Your Apartment Owner Profile"
      pageSubtitle="Set up ownership details, unit count, renovation priorities, and market coverage for apartment-specific matching."
      saveLabel="Save Apartment Owner Profile"
      successMessage="Apartment owner profile saved. Your portfolio is now ready for apartment-focused contractor matching."
      initialValues={{
        companyName: '',
        businessType: 'llc',
        email: '',
        phone: '',
        propertyCount: '',
        totalUnitCount: '',
        apartmentClass: 'class-b',
        renovationFocus: ['turnover-prep'],
        budgetRanges: ['50k-100k'],
        isAcceptingNewProjects: true,
        city: '',
        state: '',
        zipCode: '',
        serviceRadius: '20',
        additionalZips: '',
      }}
      steps={[
        {
          key: 'organization',
          title: '🏢 Organization',
          fields: [
            { key: 'companyName', type: 'text', label: 'Company or Ownership Entity', required: true, colSpan: 2, placeholder: 'Northline Apartment Holdings' },
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
            { key: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'renovations@northlineapts.com' },
            { key: 'phone', type: 'text', label: 'Phone Number', required: true, placeholder: '(555) 774-2200' },
          ],
        },
        {
          key: 'portfolio',
          title: '🏙️ Property Portfolio',
          infoBox: {
            tone: 'blue',
            text: 'Unit count helps tailor contractor matching for turnover volume, common-area scope, and project scale.',
          },
          fields: [
            { key: 'propertyCount', type: 'number', label: 'Apartment Properties', placeholder: '6' },
            { key: 'totalUnitCount', type: 'number', label: 'Total Unit Count', required: true, placeholder: '214' },
            {
              key: 'apartmentClass',
              type: 'options',
              label: 'Apartment Class',
              required: true,
              colSpan: 2,
              options: [
                { value: 'class-a', label: 'Class A' },
                { value: 'class-b', label: 'Class B' },
                { value: 'class-c', label: 'Class C' },
              ],
            },
          ],
        },
        {
          key: 'focus',
          title: '🔨 Renovation Focus',
          infoBox: {
            tone: 'green',
            text: 'Contractor ranking will account for turnover workload, common-area scope, building systems experience, and the scale implied by your unit count.',
          },
          fields: [
            {
              key: 'renovationFocus',
              type: 'chips',
              label: 'Focus Areas',
              required: true,
              colSpan: 2,
              options: [
                { value: 'full-rehab', label: 'Full Rehab' },
                { value: 'turnover-prep', label: 'Turnover Prep' },
                { value: 'common-areas', label: 'Common Areas' },
                { value: 'amenities', label: 'Amenities' },
                { value: 'exterior-facade', label: 'Exterior / Facade' },
                { value: 'building-systems', label: 'Building Systems' },
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
            { key: 'isAcceptingNewProjects', type: 'checkbox', label: 'Currently Accepting New Renovation Opportunities', colSpan: 2 },
          ],
        },
        {
          key: 'location',
          title: '📍 Location',
          fields: [
            { key: 'city', type: 'text', label: 'Primary Market - City', required: true, placeholder: 'Atlanta' },
            { key: 'state', type: 'text', label: 'State', required: true, placeholder: 'GA', maxLength: 2 },
            { key: 'zipCode', type: 'text', label: 'ZIP Code', required: true, placeholder: '30303' },
            { key: 'serviceRadius', type: 'number', label: 'Coverage Radius (miles)', required: true, placeholder: '20' },
            { key: 'additionalZips', type: 'text', label: 'Additional ZIP Codes', colSpan: 2, placeholder: '30308, 30309, 30318' },
          ],
        },
      ]}
    />
  );
}