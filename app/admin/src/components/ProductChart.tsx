import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Category } from "../api/admin";

export function ProductChart({ categories }: { categories: Category[] }) {
  const chartData = categories
    .filter((category) => category.products > 0)
    .sort((left, right) => right.products - left.products)
    .slice(0, 6);

  if (chartData.length === 0) {
    return (
      <div className="grid h-64 place-items-center rounded-lg bg-[#FBF8F2] text-sm font-semibold text-[#8A8172]">
        No product data yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid stroke="#EFE7D8" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8A8172", fontSize: 11 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8A8172", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "#FBF8F2" }}
            formatter={(value) => [value, "Products"]}
            contentStyle={{
              border: "1px solid #EFE7D8",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgb(36 31 20 / 0.08)",
            }}
          />
          <Bar dataKey="products" radius={[6, 6, 0, 0]}>
            {chartData.map((category, index) => (
              <Cell fill={index % 2 === 0 ? "#34A85B" : "#E8A33D"} key={category.name} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
