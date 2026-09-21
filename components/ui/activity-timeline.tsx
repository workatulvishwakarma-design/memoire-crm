import React from "react";
import { ActivityItem } from "@/types";
import { Avatar } from "./avatar";
import { CheckCircle2, Clock, FileText, UserPlus, Briefcase, Calendar, DollarSign } from "lucide-react";

export function ActivityTimeline({ activities }: { activities: ActivityItem[] }) {
  if (!activities || activities.length === 0) {
    return <p className="text-xs text-gray-500 italic py-4">No recent activity logged.</p>;
  }

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "lead":
        return <UserPlus className="w-3.5 h-3.5 text-blue-600" />;
      case "client":
        return <Briefcase className="w-3.5 h-3.5 text-indigo-600" />;
      case "project":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case "task":
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case "report":
        return <FileText className="w-3.5 h-3.5 text-purple-600" />;
      case "finance":
        return <DollarSign className="w-3.5 h-3.5 text-[#F26722]" />;
      case "attendance":
        return <Calendar className="w-3.5 h-3.5 text-teal-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((act, idx) => (
          <li key={act.id}>
            <div className="relative pb-8">
              {idx !== activities.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              )}
              <div className="relative flex space-x-3 items-start">
                <div className="relative">
                  <Avatar name={act.user} src={act.avatar} size="sm" />
                  <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs border border-gray-100">
                    {getIcon(act.type)}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-xs text-gray-900 font-medium">
                      <span className="font-bold">{act.user}</span>{" "}
                      <span className="text-gray-600">{act.action}</span>{" "}
                      <span className="font-semibold text-gray-900">{act.target}</span>
                    </p>
                  </div>
                  <div className="text-right text-[10px] whitespace-nowrap text-gray-400 font-medium">
                    {act.timestamp}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
