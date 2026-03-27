"use client";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ReferenceLine,
	ResponsiveContainer,
	Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientSummary {
	id: string;
	name: string;
	status: "activ" | "inactiv";
	complianceRate: number;
}

interface ComplianceChartProps {
	patients: PatientSummary[];
}

export function ComplianceChart({ patients }: ComplianceChartProps) {
	const chartData = patients
		.filter((p) => p.status === "activ")
		.map((p) => ({
			name: p.name.split(" ")[0],
			rate: p.complianceRate,
		}));

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">
					Rata de conformitate medicatie
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={200}>
					<BarChart data={chartData} barSize={32}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
						<XAxis
							dataKey="name"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							fontSize={12}
							tickLine={false}
							axisLine={false}
							domain={[0, 100]}
							unit="%"
						/>
						<Tooltip formatter={(v) => [`${v}%`, "Conformitate"]} />
						<ReferenceLine y={90} stroke="#22c55e" strokeDasharray="4 4" />
						<Bar dataKey="rate" radius={[4, 4, 0, 0]}>
							{chartData.map((entry, index) => (
								<Cell
									key={index}
									fill={
										entry.rate >= 90
											? "#22c55e"
											: entry.rate >= 70
												? "#f97316"
												: "#ef4444"
									}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
