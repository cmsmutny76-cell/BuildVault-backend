'use client';

import AccountProfileWizard from '../../components/web/AccountProfileWizard';

export default function DeveloperProfilePage() {
  return (
    <AccountProfileWizard
      pageTitle="Complete Your Developer Profile"
      pageSubtitle="Set up pipeline focus, portfolio scale, capital stack, and market coverage for development matching."
      saveLabel="Save Developer Profile"
      successMessage="Developer profile saved. Your pipeline is ready for partner and contractor matching."
      initialValues={{
        companyName: '',
        businessType: 'llc',
        yearsInBusiness: '',
        email: '',
        phone: '',
        website: '',
        developmentTypes: ['mixed-use'],
        developmentStages: ['pre-development'],
        portfolioValueRange: '10m-50m',
        activeProjectCount: '',
        completedDevelopments: '',
        financingSources: ['construction-loan'],
        maxProjects: '3',
        city: '',
        state: '',
        zipCode: '',
        serviceRadius: '75',
        additionalMarkets: '',
      }}
      steps={[
        {
          key: 'organization',
          title: '🏗️ Organization',
          fields: [
            { key: 'companyName', type: 'text', label: 'Development Company', required: true, colSpan: 2, placeholder: 'Harbor Point Development Group' },
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
            { key: 'yearsInBusiness', type: 'number', label: 'Years in Development', required: true, placeholder: '14' },
            { key: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'pipeline@harborpointdev.com' },
            { key: 'phone', type: 'text', label: 'Phone Number', required: true, placeholder: '(555) 602-1133' },
            { key: 'website', type: 'text', label: 'Website', colSpan: 2, placeholder: 'www.harborpointdev.com' },
          ],
        },
        {
          key: 'focus',
          title: '📐 Development Focus',
          infoBox: {
            tone: 'blue',
            text: 'Project stage data helps prioritize the right contractors and consultants based on where each development sits in the pipeline.',
          },
          fields: [
            {
              key: 'developmentTypes',
              type: 'chips',
              label: 'Development Types',
              required: true,
              colSpan: 2,
              options: [
                { value: 'residential', label: 'Residential' },
                { value: 'commercial', label: 'Commercial' },
                { value: 'mixed-use', label: 'Mixed Use' },
                { value: 'industrial', label: 'Industrial' },
                { value: 'land-development', label: 'Land Development' },
                { value: 'adaptive-reuse', label: 'Adaptive Reuse' },
              ],
            },
            {
              key: 'developmentStages',
              type: 'chips',
              label: 'Current Project Stages',
              required: true,
              colSpan: 2,
              options: [
                { value: 'pre-development', label: 'Pre-Development' },
                { value: 'under-construction', label: 'Under Construction' },
                { value: 'stabilized', label: 'Stabilized' },
                { value: 'value-add', label: 'Value Add' },
              ],
            },
          ],
        },
        {
          key: 'portfolio',
          title: '💼 Portfolio',
          infoBox: {
            tone: 'green',
            text: 'Matching will factor in deal stage, project type, capital structure, and portfolio scale when ranking contractors and project partners.',
          },
          fields: [
            {
              key: 'portfolioValueRange',
              type: 'options',
              label: 'Portfolio Value Range',
              required: true,
              colSpan: 2,
              options: [
                { value: '1m-10m', label: '$1M - $10M' },
                { value: '10m-50m', label: '$10M - $50M' },
                { value: '50m-100m', label: '$50M - $100M' },
                { value: '100m-plus', label: '$100M+' },
              ],
            },
            { key: 'activeProjectCount', type: 'number', label: 'Active Projects', placeholder: '7' },
            { key: 'completedDevelopments', type: 'number', label: 'Completed Developments', placeholder: '24' },
            {
              key: 'financingSources',
              type: 'chips',
              label: 'Financing Sources',
              colSpan: 2,
              options: [
                { value: 'private-equity', label: 'Private Equity' },
                { value: 'construction-loan', label: 'Construction Loan' },
                { value: 'cmbs', label: 'CMBS' },
                { value: 'self-financed', label: 'Self-Financed' },
              ],
            },
            { key: 'maxProjects', type: 'number', label: 'Maximum Active Deals to Source Per Month', colSpan: 2, placeholder: '3' },
          ],
        },
        {
          key: 'location',
          title: '📍 Primary Market',
          fields: [
            { key: 'city', type: 'text', label: 'Market City', required: true, placeholder: 'Nashville' },
            { key: 'state', type: 'text', label: 'State', required: true, placeholder: 'TN', maxLength: 2 },
            { key: 'zipCode', type: 'text', label: 'ZIP Code', required: true, placeholder: '37203' },
            { key: 'serviceRadius', type: 'number', label: 'Market Radius (miles)', required: true, placeholder: '75' },
            { key: 'additionalMarkets', type: 'text', label: 'Additional Markets', colSpan: 2, placeholder: 'Franklin, Murfreesboro, Hendersonville' },
          ],
        },
      ]}
    />
  );
}