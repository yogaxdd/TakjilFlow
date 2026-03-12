import DashboardSidebar from "@/components/dashboard-sidebar";

export default function QRLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-[#fafaf9]">
			<DashboardSidebar />
			<main className="lg:ml-64 p-6 lg:p-8">{children}</main>
		</div>
	);
}
