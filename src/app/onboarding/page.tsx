import { OnboardingForm } from "@/features/onboarding/OnboardingForm";
import { APP_NAME } from "@/utils/constants";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background-muted px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <p className="mb-6 text-sm font-semibold text-foreground">{APP_NAME}</p>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-8">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
