import { PortalLoginCard } from "@/components/auth/PortalLoginCard";

export default function CitizenLoginPage() {
  return (
    <main className="bg-[radial-gradient(circle_at_top_left,_#d1fae5_0,_transparent_36%),linear-gradient(135deg,#f8fafc,#eef2f7)] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-5xl justify-center">
        <PortalLoginCard audience="citizen" destination="/portal/minha-area" />
      </div>
    </main>
  );
}
