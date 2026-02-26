export type KycStepProps = {
  onNext: () => void
  onBack?: () => void
  onRefresh?: () => void | Promise<void>
  kycData?: any
}