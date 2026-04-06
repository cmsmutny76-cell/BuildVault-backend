'use client';

import AccountProfileWizard from '../../components/web/AccountProfileWizard';

export default function MultiFamilyProfilePage() {
  return (
    <AccountProfileWizard
      pageTitle="Complete Your Multi-Family Profile"
      pageSubtitle="Set up organization details, portfolio size, project scope, and market coverage for multi-family renovation matching."
      saveLabel="Save Multi-Family Profile"
      successMessage="Multi-family profile saved. Your portfolio is ready for contractor matching."
      initialValues={{
        companyName: '',
        businessType: 'llc',
        yearsInBusiness: '',
        email: '',
        phone: '',
        propertyCount: '',
        totalUnits: '',
        propertyTypes: ['small-complex'],
        renovationScopes: ['unit-upgrades'],
        budgetRanges: ['100k-250k'],
        maxProjects: '4',
        city: '',
        state: '',
        zipCode: '',
        serviceRadius: '35',
        additionalZips: '',
      }}
      steps={[
        {
          key: 'organization',
          title: '🏘️ Organization',
          fields: [
            { key: 'companyName', type: 'text', label: 'Company or Ownership Group Name', required: true, colSpan: 2, placeholder: 'Blue Oak Property Group' },
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
            { key: 'yearsInBusiness', type: 'number', label: 'Years Operating Multi-Family Assets', required: true, placeholder: '9' },
            { key: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'capitalprojects@blueoak.com' },
            { key: 'phone', type: 'text', label: 'Phone Number', required: true, placeholder: '(555) 333-4411' },
          ],
        },
        {
          key: 'portfolio',
          title: '🏢 Property Portfolio',
          infoBox: {
            tone: 'blue',
            text: 'Portfolio size and property mix help prioritize contractors with the right crew scale and turnover capacity.',
          },
          fields: [
            { key: 'propertyCount', type: 'number', label: 'Portfolio Properties', required: true, placeholder: '12' },
            { key: 'totalUnits', type: 'number', label: 'Total Managed Units', required: true, placeholder: '486' },
            {
              key: 'propertyTypes',
              type: 'chips',
              label: 'Property Types',
              required: true,
              colSpan: 2,
              options: [
                { value: 'duplex', label: 'Duplex' },
                { value: 'triplex', label: 'Triplex' },
                { value: 'townhome-community', label: 'Townhome Community' },
                { value: 'small-complex', label: 'Small Complex' },
                { value: 'large-complex', label: 'Large Complex' },
              ],
            },
          ],
        },
        {
          key: 'scope',
          title: '🔧 Project Scope',
          infoBox: {
            tone: 'green',
            text: 'Contractors will be ranked based on unit-turn readiness, crew capacity, common-area experience, and budget fit for your portfolio.',
          },
          fields: [
            {
              key: 'renovationScopes',
              type: 'chips',
              label: 'Renovation Scope',
              required: true,
              colSpan: 2,
              options: [
                { value: 'full-rehab', label: 'Full Rehab' },
                { value: 'unit-upgrades', label: 'Unit Upgrades' },
                { value: 'common-areas', label: 'Common Areas' },
                { value: 'building-systems', label: 'Building Systems' },
                { value: 'exterior-facade', label: 'Exterior / Facade' },
                { value: 'amenities', label: 'Amenities' },
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
            { key: 'maxProjects', type: 'number', label: 'Maximum Simultaneous Projects', colSpan: 2, placeholder: '4' },
          ],
        },
        {
          key: 'location',
          title: '📍 Location',
          fields: [
            { key: 'city', type: 'text', label: 'Primary Market - City', required: true, placeholder: 'Phoenix' },
            { key: 'state', type: 'text', label: 'State', required: true, placeholder: 'AZ', maxLength: 2 },
            { key: 'zipCode', type: 'text', label: 'ZIP Code', required: true, placeholder: '85004' },
            { key: 'serviceRadius', type: 'number', label: 'Portfolio Radius (miles)', required: true, placeholder: '35' },
            { key: 'additionalZips', type: 'text', label: 'Additional ZIP Codes', colSpan: 2, placeholder: '85008, 85281, 85282' },
          ],
        },
      ]}
    />
  );
}