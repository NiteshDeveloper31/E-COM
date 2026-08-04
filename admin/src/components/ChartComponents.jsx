import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";

// Format currency helper
const formatINR = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
};

export const SalesAreaChart = ({ data }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1F3B2D" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#1F3B2D" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C8A25D" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#C8A25D" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => `₹${value / 1000}k`}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value, name) => [
              name === "revenue" ? formatINR(value) : value,
              name === "revenue" ? "Revenue" : "Orders"
            ]}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "0.75rem",
              border: "1px solid rgba(31, 59, 45, 0.1)",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#1F3B2D"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#C8A25D"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOrders)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryPieChart = ({ data }) => {
  const COLORS = ["#1F3B2D", "#C8A25D", "#A58042", "#2D523F"];

  return (
    <div className="w-full h-80 flex flex-col justify-between">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [`${value}%`, props.payload.name || "Category"]}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "0.75rem",
                border: "1px solid rgba(31, 59, 45, 0.1)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold px-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-charcoal-light">{entry.name} ({entry.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProductPerformanceBar = ({ data }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6B7280", fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(value) => `₹${value / 1000}k`}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value, name) => [
              name === "revenue" ? formatINR(value) : value,
              name === "revenue" ? "Revenue" : "Sales (Units)"
            ]}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "0.75rem",
              border: "1px solid rgba(31, 59, 45, 0.1)",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
            }}
          />
          <Bar dataKey="revenue" fill="#1F3B2D" radius={[4, 4, 0, 0]} barSize={25} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CustomerGrowthLine = ({ data }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "0.75rem",
              border: "1px solid rgba(31, 59, 45, 0.1)",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          <Line
            type="monotone"
            dataKey="newCustomers"
            name="New Registrations"
            stroke="#C8A25D"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 1 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="activeUsers"
            name="Active Users"
            stroke="#1F3B2D"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 1 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
