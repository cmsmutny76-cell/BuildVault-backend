'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuthToken, getAuthUser } from '../../lib/web/authStorage';

type FieldOption = {
  value: string;
  label: string;
};

type BaseField = {
  key: string;
  label: string;
  required?: boolean;
  colSpan?: 1 | 2;
  helperText?: string;
  placeholder?: string;
  maxLength?: number;
};

type InputField = BaseField & {
  type: 'text' | 'email' | 'number' | 'textarea';
};

type CheckboxField = BaseField & {
  type: 'checkbox';
};

type OptionsField = BaseField & {
  type: 'options' | 'chips';
  options: FieldOption[];
};

type FieldConfig = InputField | CheckboxField | OptionsField;

type StepConfig = {
  key: string;
  title: string;
  fields: FieldConfig[];
  infoBox?: {
    tone: 'blue' | 'green' | 'violet';
    text: string;
  };
};

type InitialValues = Record<string, string | boolean | string[]>;

type AccountProfileWizardProps = {
  pageTitle: string;
  pageSubtitle: string;
  saveLabel: string;
  successMessage: string;
  steps: StepConfig[];
  initialValues: InitialValues;
};

const toneClasses = {
  blue: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
  green: 'border-green-500/40 bg-green-500/10 text-green-200',
  violet: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
};

function isArrayValue(value: string | boolean | string[]): value is string[] {
  return Array.isArray(value);
}

export default function AccountProfileWizard({
  pageTitle,
  pageSubtitle,
  saveLabel,
  successMessage,
  steps,
  initialValues,
}: AccountProfileWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(steps[0]?.key ?? '');
  const [values, setValues] = useState<InitialValues>(initialValues);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = getAuthUser();
    const token = getAuthToken();
    if (!user || !token) {
      router.replace('/');
    }
  }, [router]);

  const stepIndex = steps.findIndex((step) => step.key === currentStep);

  const previousStep = () => {
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key);
    }
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].key);
    }
  };

  const setFieldValue = (key: string, value: string | boolean | string[]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const toggleArrayField = (key: string, option: string) => {
    const currentValue = values[key];
    const nextValue = isArrayValue(currentValue) ? currentValue : [];
    if (nextValue.includes(option)) {
      setFieldValue(
        key,
        nextValue.filter((item) => item !== option)
      );
      return;
    }
    setFieldValue(key, [...nextValue, option]);
  };

  const handleSave = () => {
    setError('');
    setMessage('');

    for (const step of steps) {
      for (const field of step.fields) {
        if (!field.required) {
          continue;
        }

        const value = values[field.key];
        if (field.type === 'checkbox') {
          continue;
        }

        if (field.type === 'chips') {
          if (!isArrayValue(value) || value.length === 0) {
            setError(`Please complete the required field: ${field.label}.`);
            return;
          }
          continue;
        }

        if (typeof value !== 'string' || !value.trim()) {
          setError(`Please complete the required field: ${field.label}.`);
          return;
        }
      }
    }

    setMessage(successMessage);
  };

  const activeStep = steps.find((step) => step.key === currentStep) ?? steps[0];

  return (
    <div className="min-h-screen bg-slate-900 px-6 py-10 text-slate-100">
      <main className="mx-auto w-full max-w-4xl space-y-6">
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <Link href="/profile" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
            ← Back
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-white">{pageTitle}</h1>
          <p className="mt-1 text-sm text-slate-300">{pageSubtitle}</p>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = index < stepIndex;
              return (
                <div key={step.key} className="flex flex-1 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.key)}
                    className={`h-9 w-9 rounded-full border text-sm font-bold ${
                      isActive
                        ? 'border-amber-400 bg-amber-400 text-slate-900'
                        : isCompleted
                          ? 'border-amber-400 bg-amber-400/30 text-amber-300'
                          : 'border-slate-600 bg-slate-700 text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                  {index < steps.length - 1 && <div className="h-0.5 flex-1 bg-slate-600" />}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="text-xl font-bold text-white">{activeStep.title}</h2>

          {activeStep.infoBox && (
            <div className={`mt-5 rounded-lg border p-4 text-sm ${toneClasses[activeStep.infoBox.tone]}`}>
              {activeStep.infoBox.text}
            </div>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {activeStep.fields.map((field) => {
              const value = values[field.key];
              const spanClass = field.colSpan === 2 ? 'md:col-span-2' : '';

              if (field.type === 'checkbox') {
                return (
                  <label key={field.key} className={`flex items-center gap-3 text-slate-200 ${spanClass}`}>
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(event) => setFieldValue(field.key, event.target.checked)}
                    />
                    {field.label}
                  </label>
                );
              }

              if (field.type === 'options') {
                return (
                  <div key={field.key} className={`space-y-2 ${spanClass}`}>
                    <span className="text-sm font-semibold text-slate-200">{field.label}{field.required ? ' *' : ''}</span>
                    <div className="flex flex-wrap gap-2">
                      {field.options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFieldValue(field.key, option.value)}
                          className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                            value === option.value
                              ? 'border-amber-400 bg-amber-400 text-slate-900'
                              : 'border-slate-600 bg-slate-700 text-slate-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {field.helperText && <p className="text-xs text-slate-400">{field.helperText}</p>}
                  </div>
                );
              }

              if (field.type === 'chips') {
                const chipValues = isArrayValue(value) ? value : [];
                return (
                  <div key={field.key} className={`space-y-2 ${spanClass}`}>
                    <span className="text-sm font-semibold text-slate-200">{field.label}{field.required ? ' *' : ''}</span>
                    <div className="flex flex-wrap gap-2">
                      {field.options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleArrayField(field.key, option.value)}
                          className={`rounded-full border px-4 py-2 text-sm ${
                            chipValues.includes(option.value)
                              ? 'border-amber-400 bg-amber-400/30 text-amber-200'
                              : 'border-slate-600 bg-slate-700 text-slate-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {field.helperText && <p className="text-xs text-slate-400">{field.helperText}</p>}
                  </div>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <label key={field.key} className={`space-y-2 ${spanClass}`}>
                    <span className="text-sm font-semibold text-slate-200">{field.label}{field.required ? ' *' : ''}</span>
                    <textarea
                      className="h-24 w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-slate-100"
                      value={typeof value === 'string' ? value : ''}
                      onChange={(event) => setFieldValue(field.key, event.target.value)}
                      placeholder={field.placeholder}
                    />
                    {field.helperText && <p className="text-xs text-slate-400">{field.helperText}</p>}
                  </label>
                );
              }

              return (
                <label key={field.key} className={`space-y-2 ${spanClass}`}>
                  <span className="text-sm font-semibold text-slate-200">{field.label}{field.required ? ' *' : ''}</span>
                  <input
                    type={field.type}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-slate-100"
                    value={typeof value === 'string' ? value : ''}
                    onChange={(event) => setFieldValue(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                  />
                  {field.helperText && <p className="text-xs text-slate-400">{field.helperText}</p>}
                </label>
              );
            })}
          </div>
        </section>

        {error && <div className="rounded-lg border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
        {message && <div className="rounded-lg border border-green-400/50 bg-green-500/10 p-3 text-sm text-green-200">{message}</div>}

        <section className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex flex-wrap justify-end gap-3">
            {currentStep !== steps[0]?.key && (
              <button type="button" onClick={previousStep} className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600">
                ← Previous
              </button>
            )}
            {currentStep !== steps[steps.length - 1]?.key ? (
              <button type="button" onClick={nextStep} className="rounded-lg border border-amber-400 bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">
                Next →
              </button>
            ) : (
              <button type="button" onClick={handleSave} className="rounded-lg border border-amber-400 bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">
                {saveLabel}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}