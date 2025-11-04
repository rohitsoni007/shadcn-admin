import * as React from 'react'
import { z } from 'zod'
import { FormBuilder, type FormSection } from './form-builder'
import { CommonValidations, ConditionalValidations } from '@/lib/form-validation'

// Example form schema
const exampleFormSchema = z.object({
  // Personal Information
  firstName: CommonValidations.requiredString('First name is required'),
  lastName: CommonValidations.requiredString('Last name is required'),
  email: CommonValidations.email(),
  phone: CommonValidations.phone().optional(),
  dateOfBirth: CommonValidations.pastDate('Date of birth must be in the past').optional(),
  
  // Account Settings
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: CommonValidations.strongPassword(),
  confirmPassword: ConditionalValidations.confirmPassword(),
  
  // Preferences
  theme: z.enum(['light', 'dark', 'system']),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
  newsletter: z.boolean(),
  
  // Profile
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: CommonValidations.url().optional(),
  avatar: CommonValidations.imageFile(2).optional(),
  
  // Additional Info (conditional)
  isCompany: z.boolean(),
  companyName: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  
  // Terms
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
})

// Add conditional validation for company fields
const enhancedSchema = exampleFormSchema.superRefine((data, ctx) => {
  if (data.isCompany && !data.companyName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Company name is required when registering as a company',
      path: ['companyName'],
    })
  }
  
  if (data.isCompany && !data.companySize) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Company size is required when registering as a company',
      path: ['companySize'],
    })
  }
})

type ExampleFormData = z.infer<typeof enhancedSchema>

const defaultValues: Partial<ExampleFormData> = {
  theme: 'system',
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  newsletter: false,
  isCompany: false,
  agreeToTerms: false,
}

const formSections: FormSection[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Basic information about yourself',
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
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: 'Enter your phone number',
        description: 'Optional - for account recovery',
      },
      {
        name: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        placeholder: 'Select your date of birth',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account Settings',
    description: 'Set up your account credentials',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        placeholder: 'Choose a username',
        required: true,
        description: 'Must be at least 3 characters, letters, numbers, and underscores only',
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
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize your experience',
    fields: [
      {
        name: 'theme',
        label: 'Theme',
        type: 'select',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System Default' },
        ],
        required: true,
      },
      {
        name: 'notifications.email',
        label: 'Email Notifications',
        type: 'switch',
        description: 'Receive notifications via email',
      },
      {
        name: 'notifications.sms',
        label: 'SMS Notifications',
        type: 'switch',
        description: 'Receive notifications via SMS',
      },
      {
        name: 'notifications.push',
        label: 'Push Notifications',
        type: 'switch',
        description: 'Receive push notifications in your browser',
      },
      {
        name: 'newsletter',
        label: 'Subscribe to Newsletter',
        type: 'checkbox',
        description: 'Get updates about new features and tips',
      },
    ],
  },
  {
    id: 'profile',
    title: 'Profile Information',
    description: 'Tell us more about yourself',
    fields: [
      {
        name: 'bio',
        label: 'Bio',
        type: 'textarea',
        placeholder: 'Tell us about yourself...',
        rows: 4,
        description: 'Maximum 500 characters',
      },
      {
        name: 'website',
        label: 'Website',
        type: 'url',
        placeholder: 'https://your-website.com',
        description: 'Your personal or company website',
      },
      {
        name: 'avatar',
        label: 'Profile Picture',
        type: 'file',
        accept: 'image/*',
        description: 'Upload a profile picture (max 2MB)',
      },
    ],
  },
  {
    id: 'company',
    title: 'Company Information',
    description: 'Information about your company (if applicable)',
    fields: [
      {
        name: 'isCompany',
        label: 'I am registering on behalf of a company',
        type: 'checkbox',
      },
      {
        name: 'companyName',
        label: 'Company Name',
        type: 'text',
        placeholder: 'Enter your company name',
        dependencies: [{ field: 'isCompany', value: true }],
        required: true,
      },
      {
        name: 'companySize',
        label: 'Company Size',
        type: 'select',
        options: [
          { value: '1-10', label: '1-10 employees' },
          { value: '11-50', label: '11-50 employees' },
          { value: '51-200', label: '51-200 employees' },
          { value: '201-1000', label: '201-1000 employees' },
          { value: '1000+', label: '1000+ employees' },
        ],
        dependencies: [{ field: 'isCompany', value: true }],
        required: true,
      },
    ],
  },
  {
    id: 'terms',
    title: 'Terms and Conditions',
    fields: [
      {
        name: 'agreeToTerms',
        label: 'I agree to the Terms of Service and Privacy Policy',
        type: 'checkbox',
        required: true,
      },
    ],
  },
]

interface ExampleEnhancedFormProps {
  onSubmit?: (data: ExampleFormData) => Promise<void>
  loading?: boolean
}

export function ExampleEnhancedForm({ 
  onSubmit = async (data) => {
    console.log('Form submitted:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
  },
  loading = false 
}: ExampleEnhancedFormProps) {
  const [submitLoading, setSubmitLoading] = React.useState(false)

  const handleSubmit = async (data: ExampleFormData) => {
    setSubmitLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleFieldChange = (name: string, value: any) => {
    console.log(`Field ${name} changed to:`, value)
  }

  return (
    <FormBuilder
      schema={enhancedSchema}
      defaultValues={defaultValues}
      sections={formSections}
      onSubmit={handleSubmit}
      onFieldChange={handleFieldChange}
      title="Enhanced Registration Form"
      description="This form demonstrates all the enhanced form field capabilities including validation, conditional fields, and auto-save."
      submitText="Create Account"
      resetText="Clear Form"
      loading={submitLoading || loading}
      showResetButton={true}
      autoSave={true}
      autoSaveDelay={1000}
      successMessage="Account created successfully! Welcome aboard."
      errorMessage="There was an error creating your account. Please try again."
      className="max-w-2xl mx-auto"
    />
  )
}