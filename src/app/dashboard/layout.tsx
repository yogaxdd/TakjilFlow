import DashboardSidebar from "@/components/dashboard-sidebar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-[#fafaf9]">
			<DashboardSidebar />
			<main className="lg:ml-64 min-h-screen">
				<div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
			</main>
		</div>
	);
}
