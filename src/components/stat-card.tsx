import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	color: "emerald" | "orange" | "blue" | "purple";
	subtitle?: string;
}

const colorMap = {
	emerald: {
		bg: "bg-emerald-50",
		icon: "text-emerald-600",
		border: "border-emerald-100",
	},
	orange: {
		bg: "bg-orange-50",
		icon: "text-orange-600",
		border: "border-orange-100",
	},
	blue: {
		bg: "bg-blue-50",
		icon: "text-blue-600",
		border: "border-blue-100",
	},
	purple: {
		bg: "bg-purple-50",
		icon: "text-purple-600",
		border: "border-purple-100",
	},
};

export default function StatCard({
	title,
	value,
	icon: Icon,
	color,
	subtitle,
}: StatCardProps) {
	const colors = colorMap[color];

	return (
		<Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<p className="text-sm font-medium text-muted-foreground">{title}</p>
						<p className="text-3xl font-bold text-gray-900">{value}</p>
						{subtitle && (
							<p className="text-xs text-muted-foreground">{subtitle}</p>
						)}
					</div>
					<div
						className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
					>
						<Icon className={`w-6 h-6 ${colors.icon}`} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
