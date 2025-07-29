"use client"

import React, { useState } from "react"
import { CreditCard, Building2, Send } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card1"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import Select from "@/components/ui/Select"
import  Tabs  from "@/components/ui/Tabs"
import TabList from "@/components/ui/Tabs/TabList"
import TabNav from "@/components/ui/Tabs/TabNav"
import TabContent from "@/components/ui/Tabs/TabContent"

// import { Textarea } from "@/components/ui"

export default function BankDepositForm() {
  const [activeTab, setActiveTab] = useState("swift")

  const handleSubmit = () => {
    console.log("Form submitted")
  }

  const currencyOptions = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "PKR", label: "PKR - Pakistani Rupee" },
    { value: "AED", label: "AED - UAE Dirham" }
  ]

  const priorityOptions = [
    { value: "standard", label: "Standard (1-2 days)" },
    { value: "instant", label: "Instant (within minutes)" }
  ]

  const tabItems = [
    {
      key: "swift",
      label: "SWIFT Transfer",
      icon: <Send className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label htmlFor="swift-recipient-name" className="text-sm font-medium ">
                Recipient Name *
              </label>
              <Input size="sm" id="swift-recipient-name"  placeholder="Enter recipient full name" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="swift-bank-name" className="text-sm font-medium ">
                Bank Name *
              </label>
              <Input size="sm" id="swift-bank-name" placeholder="Enter bank name" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="swift-code" className="text-sm font-medium ">
                SWIFT/BIC Code *
              </label>
              <Input size="sm" 
                id="swift-code" 
                placeholder="e.g., DEUTDEFF" 
                className="uppercase" 
                style={{ textTransform: 'uppercase' }}
                required 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="iban-swift" className="text-sm font-medium ">
                IBAN/Account Number *
              </label>
              <Input size="sm" id="iban-swift" placeholder="Enter IBAN or account number" required />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="bank-address" className="text-sm font-medium ">
              Bank Address *
            </label>
            <input size="sm"
            type="textarea"
              id="bank-address"
              placeholder="Enter complete bank address"
              className="min-h-[80px] w-full p-3 border border-gray-300 rounded-md resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="amount-swift" className="text-sm font-medium ">
                Amount *
              </label>
              <Input size="sm" id="amount-swift" type="number" step="0.01" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="currency-swift" className="text-sm font-medium ">
                Currency *
              </label>
              <Select
                options={currencyOptions}
                placeholder="Select currency"
                className="w-full"
                isSearchable={false}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reference-swift" className="text-sm font-medium ">
              Reference/Purpose
            </label>
            <Input size="sm" id="reference-swift" placeholder="Payment reference or purpose" />
          </div>

          <Button 
            onClick={handleSubmit} 
            variant="plain"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Process SWIFT Transfer
          </Button>
        </div>
      )
    },
    {
      key: "sepa",
      label: "SEPA Transfer", 
      icon: <CreditCard className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50   p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> SEPA transfers are only available for EUR transactions within the European
              Economic Area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="sepa-recipient-name" className="text-sm font-medium ">
                Recipient Name *
              </label>
              <Input size="sm" id="sepa-recipient-name" placeholder="Enter recipient full name" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="sepa-iban" className="text-sm font-medium ">
                IBAN *
              </label>
              <Input size="sm" 
                id="sepa-iban" 
                placeholder="e.g., DE89370400440532013000" 
                className="uppercase" 
                style={{ textTransform: 'uppercase' }}
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="sepa-bic" className="text-sm font-medium ">
                BIC/SWIFT Code
              </label>
              <Input size="sm" 
                id="sepa-bic" 
                placeholder="Optional for SEPA zone" 
                className="uppercase"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="amount-sepa" className="text-sm font-medium ">
                Amount (EUR) *
              </label>
              <Input size="sm" id="amount-sepa" type="number" step="0.01" placeholder="0.00" required />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="recipient-address" className="text-sm font-medium ">
              Recipient Address
            </label>
            <input size="sm"
            type="textarea"
              id="recipient-address"
              placeholder="Enter recipient address (optional)"
              className="min-h-[80px] w-full p-3 border border-gray-300 rounded-md resize-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reference-sepa" className="text-sm font-medium ">
              Reference/Purpose
            </label>
            <Input size="sm" 
              id="reference-sepa" 
              placeholder="Payment reference or purpose" 
              maxLength={140} 
            />
            <p className="text-xs text-gray-500">Maximum 140 characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="execution-date" className="text-sm font-medium ">
                Execution Date
              </label>
              <Input size="sm" 
                id="execution-date" 
                type="date" 
                min={new Date().toISOString().split("T")[0]} 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium ">
                Priority
              </label>
              <Select
                options={priorityOptions}
                placeholder="Standard"
                defaultValue={priorityOptions[0]}
                className="w-full"
                isSearchable={false}
              />
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            variant="plain"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Process SEPA Transfer
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className=" p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl border-0">

        <CardContent>
          {/* Tabs Section */}
          <div className="p-6 mt-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg">
            <Tabs
              value={activeTab}
              onChange={setActiveTab}
              className=""
            >
              <TabList>
                {tabItems.map((item) => (
                  <TabNav key={item.key} value={item.key}>
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </TabNav>
                ))}
              </TabList>

              <div className="mt-4">
                {tabItems.map((item) => (
                  <TabContent key={item.key} value={item.key}>
                    {item.content}
                  </TabContent>
                ))}
              </div>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}