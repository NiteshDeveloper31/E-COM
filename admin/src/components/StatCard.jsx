import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const StatCard = ({ title, value, icon: Icon, trend, trendType = "up", description }) => {
  const isTrendUp = trendType === "up";

  return (
    <div className="bg-white p-6 rounded-xl border border-primary/10 shadow-xs hover:shadow-md transition-all duration-200 flex items-start justify-between group">
      <div className="space-y-2.5">
        <span className="text-xs font-display font-bold uppercase tracking-wider text-charcoal-light">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-display font-bold text-primary">
            {value}
          </span>
          {trend && (
            <span
              className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-sm ${
                isTrendUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}
            >
              {isTrendUp ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
              {trend}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-charcoal-light font-medium">{description}</p>
        )}
      </div>

      <div className="p-3.5 rounded-lg bg-primary/5 text-primary group-hover:bg-secondary group-hover:text-primary transition-all duration-300">
        <Icon size={20} className="transition-transform group-hover:scale-110" />
      </div>
    </div>
  );
};
