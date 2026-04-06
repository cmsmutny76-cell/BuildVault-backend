'use client';

import AccountProfileWizard from '../../components/web/AccountProfileWizard';

export default function SchoolProfilePage() {
  return (
    <AccountProfileWizard
      pageTitle="Complete Your School Profile"
      pageSubtitle="Set up program offerings, placement outcomes, and campus details for career opportunity matching."
      saveLabel="Save School Profile"
      successMessage="School profile saved. Your programs are ready for employer and opportunity matching."
      initialValues={{
        schoolName: '',
        schoolType: 'vocational-trade-school',
        isAccredited: false,
        enrollmentCapacity: '',
        programsOffered: ['carpentry'],
        programLength: 'months',
        jobPlacementAssistance: true,
        jobPlacementRate: '',
        industryPartners: '',
        contactName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        servesRemoteStudents: false,
      }}
      steps={[
        {
          key: 'school',
          title: '🏫 School Information',
          fields: [
            { key: 'schoolName', type: 'text', label: 'School Name', required: true, colSpan: 2, placeholder: 'North Valley Trade Institute' },
            {
              key: 'schoolType',
              type: 'options',
              label: 'School Type',
              required: true,
              colSpan: 2,
              options: [
                { value: 'vocational-trade-school', label: 'Vocational / Trade School' },
                { value: 'apprenticeship-program', label: 'Apprenticeship Program' },
                { value: 'community-college-trade-department', label: 'Community College Trade Dept' },
                { value: 'industry-training-center', label: 'Industry Training Center' },
              ],
            },
            { key: 'isAccredited', type: 'checkbox', label: 'Accredited Program', colSpan: 2 },
            { key: 'enrollmentCapacity', type: 'number', label: 'Enrollment Capacity', colSpan: 2, placeholder: '240' },
          ],
        },
        {
          key: 'programs',
          title: '🧰 Programs Offered',
          infoBox: {
            tone: 'blue',
            text: 'Program details help match your school with employers looking for specific skilled trades and student pipelines.',
          },
          fields: [
            {
              key: 'programsOffered',
              type: 'chips',
              label: 'Construction Programs',
              required: true,
              colSpan: 2,
              options: [
                { value: 'carpentry', label: 'Carpentry' },
                { value: 'electrical', label: 'Electrical' },
                { value: 'plumbing', label: 'Plumbing' },
                { value: 'hvac', label: 'HVAC' },
                { value: 'welding', label: 'Welding' },
                { value: 'masonry', label: 'Masonry' },
                { value: 'painting', label: 'Painting' },
                { value: 'landscaping', label: 'Landscaping' },
                { value: 'heavy-equipment', label: 'Heavy Equipment' },
                { value: 'construction-management', label: 'Construction Management' },
              ],
            },
            {
              key: 'programLength',
              type: 'options',
              label: 'Typical Program Length',
              required: true,
              colSpan: 2,
              options: [
                { value: 'weeks', label: 'Weeks' },
                { value: 'months', label: 'Months' },
                { value: '1-2-years', label: '1-2 Years' },
                { value: '2-plus-years', label: '2+ Years' },
              ],
            },
          ],
        },
        {
          key: 'placement',
          title: '🤝 Hiring & Placement',
          infoBox: {
            tone: 'green',
            text: 'Employers in construction, landscaping, and trade services can be matched to your programs based on hiring demand and training focus.',
          },
          fields: [
            { key: 'jobPlacementAssistance', type: 'checkbox', label: 'Offers Job Placement Assistance', colSpan: 2 },
            { key: 'jobPlacementRate', type: 'number', label: 'Job Placement Rate (%)', placeholder: '86' },
            { key: 'contactName', type: 'text', label: 'Primary Contact Name', required: true, placeholder: 'Jordan Ellis' },
            { key: 'industryPartners', type: 'textarea', label: 'Industry Partners', colSpan: 2, placeholder: 'ABC Builders, Summit Electric, Evergreen Outdoor' },
            { key: 'email', type: 'email', label: 'Contact Email', required: true, placeholder: 'careers@northvalleytrade.edu' },
            { key: 'phone', type: 'text', label: 'Contact Phone', required: true, placeholder: '(555) 441-8820' },
          ],
        },
        {
          key: 'location',
          title: '📍 Location',
          fields: [
            { key: 'street', type: 'text', label: 'Street Address', required: true, colSpan: 2, placeholder: '1200 Industrial Way' },
            { key: 'city', type: 'text', label: 'City', required: true, placeholder: 'Bakersfield' },
            { key: 'state', type: 'text', label: 'State', required: true, placeholder: 'CA', maxLength: 2 },
            { key: 'zipCode', type: 'text', label: 'ZIP Code', required: true, placeholder: '93301' },
            { key: 'servesRemoteStudents', type: 'checkbox', label: 'Serves Remote or Hybrid Students', colSpan: 2 },
          ],
        },
      ]}
    />
  );
}