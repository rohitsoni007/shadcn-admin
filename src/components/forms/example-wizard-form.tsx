import * as React from 'react'
import { z } from 'zod'
import { FormWizard, type WizardStep } from './form-wizard'
import { CommonValidations, ConditionalValidations } from '@/lib/form-validation'

// Wizard form schema
const wizardFormSchema = z.object({
  // Step 1: Personal Information
  firstName: CommonValidations.requiredString('First name is required'),
  lastName: CommonValidations.requiredString('Last name is required'),
  email: CommonValidations.email(),
  phone: CommonValidations.phone().optional(),
  
  // Step 2: Account Setup
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: CommonValidations.strongPassword(),
  confirmPassword: ConditionalValidations.confirmPassword(),
  
  // Step 3: Business Information (conditional)
  accountType: z.enum(['personal', 'business']),
  businessName: z.string().optional(),
  businessType: z.enum(['startup', 'small', 'medium', 'enterprise']).optional(),
  businessDescription: z.string().optional(),
  
  // Step 4: Preferences
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    marketing: z.boolean(),
  }),
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  
  // Step 5: Documents (optional)
  profilePicture: CommonValidations.imageFile(5).optional(),
  businessLicense: CommonValidations.fileSize(10).optional(),
  
  // Step 6: Review and Terms
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
  agreeToPrivacy: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy policy'
  }),
})

// Add conditional validation for business fields
const enhancedWizardSchema = wizardFormSchema.superRefine((data, ctx) => {
  if (data.accountType === 'business') {
    if (!data.businessName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business name is required for business accounts',
        path: ['businessName'],
      })
    }
    
    if (!data.businessType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business type is required for business accounts',
        path: ['businessType'],
      })
    }
  }
})

type WizardFormData = z.infer<typeof enhancedWizardSchema>

const defaultValues: Partial<WizardFormData> = {
  accountType: 'personal',
  notifications: {
    email: true,
    sms: false,
    marketing: false,
  },
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  agreeToTerms: false,
  agreeToPrivacy: false,
}

const wizardSteps: WizardStep[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Let\'s start with your basic information',
    fields: [
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        placeholder: 'Enter your first name',
        required: true,
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        placeholder: 'Enter your last name',
        required: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter your email address',
        required: true,
        description: 'We\'ll use this for account verification and notifications',
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: 'Enter your phone number',
        description: 'Optional - for account recovery and SMS notifications',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account Setup',
    description: 'Create your account credentials',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        placeholder: 'Choose a unique username',
        required: true,
        description: 'This will be your unique identifier on the platform',
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Create a strong password',
        required: true,
        showPasswordToggle: true,
        description: 'Must contain uppercase, lowercase, number, and special character',
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        placeholder: 'Confirm your password',
        required: true,
        showPasswordToggle: true,
      },
    ],
  },
  {
    id: 'business',
    title: 'Account Type',
    description: 'Tell us about your account type',
    fields: [
      {
        name: 'accountType',
        label: 'Account Type',
        type: 'radio',
        options: [
          { value: 'personal', label: 'Personal Account' },
          { value: 'business', label: 'Business Account' },
        ],
        required: true,
      },
      {
        name: 'businessName',
        label: 'Business Name',
        type: 'text',
        placeholder: 'Enter your business name',
        dependencies: [{ field: 'accountType', value: 'business' }],
        required: true,
      },
      {
        name: 'businessType',
        label: 'Business Type',
        type: 'select',
        options: [
          { value: 'startup', label: 'Startup (1-10 employees)' },
          { value: 'small', label: 'Small Business (11-50 employees)' },
          { value: 'medium', label: 'Medium Business (51-200 employees)' },
          { value: 'enterprise', label: 'Enterprise (200+ employees)' },
        ],
        dependencies: [{ field: 'accountType', value: 'business' }],
        required: true,
      },
      {
        name: 'businessDescription',
        label: 'Business Description',
        type: 'textarea',
        placeholder: 'Briefly describe your business...',
        rows: 3,
        dependencies: [{ field: 'accountType', value: 'business' }],
        description: 'Optional - help us understand your business better',
      },
    ],
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize your experience',
    fields: [
      {
        name: 'notifications.email',
        label: 'Email Notifications',
        type: 'switch',
        description: 'Receive important updates via email',
      },
      {
        name: 'notifications.sms',
        label: 'SMS Notifications',
        type: 'switch',
        description: 'Receive urgent notifications via SMS',
      },
      {
        name: 'notifications.marketing',
        label: 'Marketing Communications',
        type: 'switch',
        description: 'Receive newsletters and promotional content',
      },
      {
        name: 'theme',
        label: 'Theme Preference',
        type: 'select',
        options: [
          { value: 'light', label: 'Light Theme' },
          { value: 'dark', label: 'Dark Theme' },
          { value: 'system', label: 'System Default' },
        ],
        required: true,
      },
      {
        name: 'language',
        label: 'Language',
        type: 'select',
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
          { value: 'zh', label: 'Chinese' },
        ],
        required: true,
      },
      {
        name: 'timezone',
        label: 'Timezone',
        type: 'select',
        options: [
          { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
          { value: 'America/New_York', label: 'Eastern Time (ET)' },
          { value: 'America/Chicago', label: 'Central Time (CT)' },
          { value: 'America/Denver', label: 'Mountain Time (MT)' },
          { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
          { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
          { value: 'Europe/Paris', label: 'Central European Time (CET)' },
          { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
          { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
          { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
        ],
        required: true,
      },
    ],
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Upload your documents (optional)',
    optional: true,
    fields: [
      {
        name: 'profilePicture',
        label: 'Profile Picture',
        type: 'file',
        accept: 'image/*',
        description: 'Upload a profile picture (max 5MB)',
      },
      {
        name: 'businessLicense',
        label: 'Business License',
        type: 'file',
        accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
        dependencies: [{ field: 'accountType', value: 'business' }],
        description: 'Upload your business license or registration document (max 10MB)',
      },
    ],
  },
  {
    id: 'review',
    title: 'Review & Terms',
    description: 'Review your information and accept our terms',
    fields: [
      {
        name: 'agreeToTerms',
        label: 'I agree to the Terms of Service',
        type: 'checkbox',
        required: true,
        description: 'Please read and accept our terms of service to continue',
      },
      {
        name: 'agreeToPrivacy',
        label: 'I agree to the Privacy Policy',
        type: 'checkbox',
        required: true,
        description: 'Please read and accept our privacy policy to continue',
      },
    ],
  },
]

interface ExampleWizardFormProps {
  onSubmit?: (data: WizardFormData) => Promise<void>
  loading?: boolean
}

export function ExampleWizardForm({ 
  onSubmit = async (data) => {
    console.log('Wizard form submitted:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000))
  },
  loading = false 
}: ExampleWizardFormProps) {
  const [submitLoading, setSubmitLoading] = React.useState(false)
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)

  const handleSubmit = async (data: WizardFormData) => {
    setSubmitLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleStepChange = (stepIndex: number, direction: 'next' | 'previous') => {
    setCurrentStepIndex(stepIndex)
    console.log(`Moved to step ${stepIndex + 1} (${direction})`)
  }

  const handleStepValidation = (stepId: string, isValid: boolean, errors: any) => {
    console.log(`Step ${stepId} validation:`, { isValid, errors })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <FormWizard
        steps={wizardSteps}
        schema={enhancedWizardSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onStepChange={handleStepChange}
        onStepValidation={handleStepValidation}
        title="Account Registration Wizard"
        description="Complete all steps to create your account. Your progress is automatically saved."
        submitText="Create Account"
        loading={submitLoading || loading}
        allowStepNavigation={true}
        autoSave={true}
        autoSaveDelay={1000}
        showProgress={true}
        showStepNumbers={true}
        validateOnStepChange={true}
        className="w-full"
      />

      {/* Progress Summary */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Wizard Features Demonstrated:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Multi-step form with progress tracking</li>
          <li>• Step-by-step validation with error handling</li>
          <li>• Conditional fields based on previous selections</li>
          <li>• Auto-save functionality with draft recovery</li>
          <li>• Optional steps that can be skipped</li>
          <li>• Step navigation with validation checks</li>
          <li>• File upload support in wizard context</li>
          <li>• Real-time form state management</li>
        </ul>
      </div>
    </div>
  )
}

// Simplified wizard for quick setup
export function QuickSetupWizard() {
  const quickSteps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Info',
      fields: [
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      fields: [
        {
          name: 'theme',
          label: 'Theme',
          type: 'select',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ],
          required: true,
        },
      ],
    },
  ]

  const quickSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    theme: z.enum(['light', 'dark']),
  })

  return (
    <FormWizard
      steps={quickSteps}
      schema={quickSchema}
      defaultValues={{ theme: 'light' }}
      onSubmit={async (data) => {
        console.log('Quick setup:', data)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }}
      title="Quick Setup"
      description="Get started in just 2 steps"
      submitText="Get Started"
      showProgress={true}
      autoSave={false}
      className="max-w-md mx-auto"
    />
  )
}