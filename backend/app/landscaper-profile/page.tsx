'use client';

import AccountProfileWizard from '../../components/web/AccountProfileWizard';

export default function LandscaperProfilePage() {
  return (
    <AccountProfileWizard
      pageTitle="Complete Your Landscaper Profile"
      pageSubtitle="Set up your outdoor services, certifications, client mix, and service area for landscaping opportunities."
      saveLabel="Save Landscaper Profile"
      successMessage="Landscaper profile saved. Your business is ready for outdoor services matching."
      initialValues={{
        companyName: '',
        businessType: 'llc',
        yearsInBusiness: '',
        email: '',
        phone: '',
        website: '',
        landscapingServices: ['installation'],
        clientTypes: ['commercial'],
        budgetRanges: ['15k-50k'],
        licenseNumber: '',
        licenseState: '',
        isInsured: false,
        isBonded: false,
        isIsaCertifiedArborist: false,
        isNalpCertified: false,
        city: '',
        state: '',
        zipCode: '',
        serviceRadius: '30',
        additionalZips: '',
        maximumAccounts: '8',
      }}
      steps={[
        {
          key: 'business',
          title: '🌿 Business Information',
          fields: [
            { key: 'companyName', type: 'text', label: 'Company Name', required: true, colSpan: 2, placeholder: 'Evergreen Outdoor Services' },
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
            { key: 'yearsInBusiness', type: 'number', label: 'Years in Business', required: true, placeholder: '11' },
            { key: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'bids@evergreenoutdoor.com' },
            { key: 'phone', type: 'text', label: 'Phone Number', required: true, placeholder: '(555) 702-1900' },
            { key: 'website', type: 'text', label: 'Website', colSpan: 2, placeholder: 'www.evergreenoutdoor.com' },
          ],
        },
        {
          key: 'services',
          title: '🛠️ Services & Specializations',
          infoBox: {
            tone: 'green',
            text: 'Matching prioritizes properties and employers based on service mix, client type, and budget fit for installation and ongoing maintenance work.',
          },
          fields: [
            {
              key: 'landscapingServices',
              type: 'chips',
              label: 'Services Offered',
              required: true,
              colSpan: 2,
              options: [
                { value: 'design', label: 'Design' },
                { value: 'installation', label: 'Installation' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'irrigation', label: 'Irrigation' },
                { value: 'hardscaping', label: 'Hardscaping' },
                { value: 'tree-service', label: 'Tree Service' },
                { value: 'turf-management', label: 'Turf Management' },
                { value: 'snow-removal', label: 'Snow Removal' },
              ],
            },
            {
              key: 'clientTypes',
              type: 'chips',
              label: 'Client Types',
              required: true,
              colSpan: 2,
              options: [
                { value: 'residential', label: 'Residential' },
                { value: 'commercial', label: 'Commercial' },
                { value: 'hoa', label: 'HOA' },
                { value: 'municipal', label: 'Municipal' },
                { value: 'golf-recreation', label: 'Golf / Recreation' },
              ],
            },
            {
              key: 'budgetRanges',
              type: 'chips',
              label: 'Typical Budget Ranges',
              colSpan: 2,
              options: [
                { value: '5k-15k', label: '$5K - $15K' },
                { value: '15k-50k', label: '$15K - $50K' },
                { value: '50k-100k', label: '$50K - $100K' },
                { value: '100k-250k', label: '$100K - $250K' },
              ],
            },
          ],
        },
        {
          key: 'certifications',
          title: '📜 Licenses & Certifications',
          infoBox: {
            tone: 'blue',
            text: 'Certifications and insurance increase confidence for schools, property owners, and commercial sites reviewing your profile.',
          },
          fields: [
            { key: 'licenseNumber', type: 'text', label: 'License Number', placeholder: 'LND-204991' },
            { key: 'licenseState', type: 'text', label: 'License State', placeholder: 'CA', maxLength: 2 },
            { key: 'isInsured', type: 'checkbox', label: 'Currently Insured', colSpan: 2 },
            { key: 'isBonded', type: 'checkbox', label: 'Currently Bonded', colSpan: 2 },
            { key: 'isIsaCertifiedArborist', type: 'checkbox', label: 'ISA Certified Arborist', colSpan: 2 },
            { key: 'isNalpCertified', type: 'checkbox', label: 'NALP Certified', colSpan: 2 },
          ],
        },
        {
          key: 'area',
          title: '📍 Service Area',
          fields: [
            { key: 'city', type: 'text', label: 'Primary City', required: true, placeholder: 'Sacramento' },
            { key: 'state', type: 'text', label: 'State', required: true, placeholder: 'CA', maxLength: 2 },
            { key: 'zipCode', type: 'text', label: 'ZIP Code', required: true, placeholder: '95814' },
            { key: 'serviceRadius', type: 'number', label: 'Service Radius (miles)', required: true, placeholder: '30' },
            { key: 'additionalZips', type: 'text', label: 'Additional ZIP Codes', colSpan: 2, placeholder: '95608, 95610, 95821' },
            { key: 'maximumAccounts', type: 'number', label: 'Maximum Accounts Per Month', colSpan: 2, placeholder: '8' },
          ],
        },
      ]}
    />
  );
}