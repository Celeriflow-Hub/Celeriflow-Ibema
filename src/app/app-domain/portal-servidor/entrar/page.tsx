import { PortalLoginCard } from "@/components/auth/PortalLoginCard";

export default function EmployeeLoginPage() {
  return (
    <div className="flex min-h-[calc(100dvh-9rem)] items-center justify-center bg-[radial-gradient(circle_at_top_right,_#dbeafe_0,_transparent_35%),linear-gradient(135deg,#f8fafc,#e2e8f0)] px-4 py-8">
      <PortalLoginCard audience="employee" destination="/portal-servidor" />
    </div>
  );
}
