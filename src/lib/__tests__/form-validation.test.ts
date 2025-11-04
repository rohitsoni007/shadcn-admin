import { describe, it, expect } from 'vitest'
import { CommonValidations, ValidationPatterns } from '../form-validation'

describe('ValidationPatterns', () => {
  it('validates email pattern correctly', () => {
    expect(ValidationPatterns.email.test('test@example.com')).toBe(true)
    expect(ValidationPatterns.email.test('invalid-email')).toBe(false)
    expect(ValidationPatterns.email.test('test@')).toBe(false)
  })

  it('validates phone pattern correctly', () => {
    expect(ValidationPatterns.phone.test('+1234567890')).toBe(true)
    expect(ValidationPatterns.phone.test('1234567890')).toBe(true)
    expect(ValidationPatterns.phone.test('abc123')).toBe(false)
  })

  it('validates strong password pattern correctly', () => {
    expect(ValidationPatterns.strongPassword.test('Password123!')).toBe(true)
    expect(ValidationPatterns.strongPassword.test('password')).toBe(false)
    expect(ValidationPatterns.strongPassword.test('PASSWORD123')).toBe(false)
  })
})

describe('CommonValidations', () => {
  it('validates required string', () => {
    const schema = CommonValidations.requiredString()
    
    expect(schema.safeParse('test').success).toBe(true)
    expect(schema.safeParse('').success).toBe(false)
    // Note: Zod's min(1) allows whitespace strings, use .trim() for stricter validation
    expect(schema.safeParse('   ').success).toBe(true)
  })

  it('validates email format', () => {
    const schema = CommonValidations.email()
    
    expect(schema.safeParse('test@example.com').success).toBe(true)
    expect(schema.safeParse('invalid-email').success).toBe(false)
  })

  it('validates positive numbers', () => {
    const schema = CommonValidations.positiveNumber()
    
    expect(schema.safeParse(5).success).toBe(true)
    expect(schema.safeParse(0).success).toBe(false)
    expect(schema.safeParse(-1).success).toBe(false)
  })

  it('validates future dates', () => {
    const schema = CommonValidations.futureDate()
    const futureDate = new Date(Date.now() + 86400000) // Tomorrow
    const pastDate = new Date(Date.now() - 86400000) // Yesterday
    
    expect(schema.safeParse(futureDate).success).toBe(true)
    expect(schema.safeParse(pastDate).success).toBe(false)
  })
})