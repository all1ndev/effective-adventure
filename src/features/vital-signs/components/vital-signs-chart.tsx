"use client";

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type VitalEntry } from "../data/schema";

interface VitalSignsChartProps {
	data: VitalEntry[];
}

export function VitalSignsChart({ data }: VitalSignsChartProps) {
	const chartData = data.map((e) => ({
		date: e.date.slice(5),
		sistolica: e.systolic,
		diastolica: e.diastolic,
		puls: e.pulse,
		temperatura: e.temperature,
	}));

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Tensiune arteriala</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={220}>
						<LineChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
							<XAxis
								dataKey="date"
								fontSize={11}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								fontSize={11}
								tickLine={false}
								axisLine={false}
								domain={[60, 160]}
							/>
							<Tooltip />
							<Legend />
							<Line
								type="monotone"
								dataKey="sistolica"
								stroke="hsl(var(--primary))"
								strokeWidth={2}
								dot={false}
							/>
							<Line
								type="monotone"
								dataKey="diastolica"
								stroke="hsl(var(--muted-foreground))"
								strokeWidth={2}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Puls (bpm)</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={220}>
						<LineChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
							<XAxis
								dataKey="date"
								fontSize={11}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								fontSize={11}
								tickLine={false}
								axisLine={false}
								domain={[50, 120]}
							/>
							<Tooltip />
							<Line
								type="monotone"
								dataKey="puls"
								stroke="hsl(var(--primary))"
								strokeWidth={2}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	);
}
