"use client"

import { useState, useEffect, useRef } from "react"
import classNames from "classnames"
import { Input } from "@/components/ui"


// Main Card Payment Component
export default function CardPaymentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardholderName: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.amount) {
      newErrors.amount = "Please enter an amount"
    } else if (Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.cardNumber) {
      newErrors.cardNumber = "Please enter card number"
    } else if (formData.cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.cardNumber = "Card number must be 16 digits"
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Please enter expiry date"
    }

    if (!formData.cvc) {
      newErrors.cvc = "Please enter CVC"
    } else if (formData.cvc.length < 3) {
      newErrors.cvc = "CVC must be 3-4 digits"
    }

    if (!formData.cardholderName) {
      newErrors.cardholderName = "Please enter cardholder name"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsProcessing(false)
    // Here you would integrate with actual payment processor
    alert("Payment processed successfully!")
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const StepIndicator = ({ step, active }: { step: number; active: boolean }) => (
    <div
      className={classNames(
        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
        active ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
      )}
    >
      {step}
    </div>
  )

  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="max-w-2xl mx-auto p-6">

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          {/* Header */}
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-8">Enter payment information</h1>

          {/* Step Indicators */}
          <div className="flex items-center justify-center space-x-8 mb-12">
            <StepIndicator step={1} active={currentStep === 1} />
            <div className="w-16 h-px bg-gray-300 dark:bg-gray-600"></div>
            <StepIndicator step={2} active={currentStep === 2} />
            <div className="w-16 h-px bg-gray-300 dark:bg-gray-600"></div>
            <StepIndicator step={3} active={currentStep === 3} />
          </div>

          {/* Step 1: USD Amount */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enter the amount in USD*
                </label>
                <Input
                  type="number"
                  placeholder="Deposit Amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  invalid={!!errors.amount}
                  prefix="$"
                />
                {errors.amount && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Card Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cardholder Name*
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                  invalid={!!errors.cardholderName}
                />
                {errors.cardholderName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.cardholderName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number*</label>
                <Input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                  invalid={!!errors.cardNumber}
                  maxLength={19}
                />
                {errors.cardNumber && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiry Date*
                  </label>
                  <Input
                    type="text"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", formatExpiryDate(e.target.value))}
                    invalid={!!errors.expiryDate}
                    maxLength={5}
                  />
                  {errors.expiryDate && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.expiryDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVC*</label>
                  <Input
                    type="text"
                    placeholder="123"
                    value={formData.cvc}
                    onChange={(e) => handleInputChange("cvc", e.target.value.replace(/\D/g, ""))}
                    invalid={!!errors.cvc}
                    maxLength={4}
                  />
                  {errors.cvc && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.cvc}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment Review & Process */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Review Your Payment</h2>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">${formData.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Card:</span>
                  <span className="text-gray-800 dark:text-gray-200">
                    **** **** **** {formData.cardNumber.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Cardholder:</span>
                  <span className="text-gray-800 dark:text-gray-200">{formData.cardholderName}</span>
                </div>
                <hr className="border-gray-300 dark:border-gray-600" />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-800 dark:text-gray-200">Total:</span>
                  <span className="text-gray-800 dark:text-gray-200">${formData.amount}</span>
                </div>
              </div>

              {/* Process Payment Button */}
              <div className="text-center">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={classNames(
                    "w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors",
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800",
                  )}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    `Pay $${formData.amount}`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 3 && (
            <div className="flex justify-between mt-12">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                >
                  PREVIOUS
                </button>
              )}

              <button
                onClick={handleNext}
                className={classNames(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  currentStep === 1 ? "ml-auto" : "",
                  "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/50",
                )}
              >
                NEXT
              </button>
            </div>
          )}

          {/* Back button for step 3 */}
          {currentStep === 3 && (
            <div className="flex justify-start mt-8">
              <button
                onClick={handlePrevious}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                ← Back to Card Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
