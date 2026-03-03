"use client";

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Area,
	AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesData } from "@/types";

interface DailyOrdersChartProps {
	data: SalesData[];
}

export default function DailyOrdersChart({ data }: DailyOrdersChartProps) {
	return (
		<Card className="rounded-2xl border-0 shadow-sm">
			<CardHeader>
				<CardTitle className="text-lg font-semibold text-gray-900">
					Pesanan Harian
				</CardTitle>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<div className="h-[300px] flex items-center justify-center text-muted-foreground">
						<p>Belum ada data pesanan</p>
					</div>
				) : (
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart data={data}>
							<defs>
								<linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
									<stop offset="95%" stopColor="#059669" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
							<XAxis
								dataKey="date"
								tick={{ fontSize: 12, fill: "#9ca3af" }}
								axisLine={{ stroke: "#e5e7eb" }}
								tickLine={false}
							/>
							<YAxis
								tick={{ fontSize: 12, fill: "#9ca3af" }}
								axisLine={{ stroke: "#e5e7eb" }}
								tickLine={false}
							/>
							<Tooltip
								contentStyle={{
									borderRadius: "12px",
									border: "none",
									boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
									padding: "12px 16px",
								}}
								labelStyle={{ fontWeight: 600, marginBottom: 4 }}
							/>
							<Area
								type="monotone"
								dataKey="orders"
								stroke="#059669"
								strokeWidth={2.5}
								fill="url(#colorOrders)"
								name="Pesanan"
								dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
								activeDot={{ r: 6, strokeWidth: 0 }}
							/>
							<Line
								type="monotone"
								dataKey="items"
								stroke="#f97316"
								strokeWidth={2}
								name="Items"
								dot={{ fill: "#f97316", strokeWidth: 2, r: 3 }}
							/>
						</AreaChart>
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	);
}
