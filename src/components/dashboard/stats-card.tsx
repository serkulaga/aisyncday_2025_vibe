import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  variant?: "default" | "green" | "yellow" | "red";
}

const variantStyles = {
  default: "text-muted-foreground",
  green: "text-green-600 dark:text-green-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  red: "text-red-600 dark:text-red-400",
};

const variantBgStyles = {
  default: "bg-muted",
  green: "bg-green-100 dark:bg-green-900/20",
  yellow: "bg-yellow-100 dark:bg-yellow-900/20",
  red: "bg-red-100 dark:bg-red-900/20",
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
}: StatsCardProps) {
  const cardGradients = {
    default: "bg-gradient-to-br from-primary/10 via-purple-50 to-pink-50 border-primary/20",
    green: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200",
    yellow: "bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-yellow-200",
    red: "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-red-200",
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</CardTitle>
        <div className={cn("rounded-lg p-2", variantBgStyles[variant])}>
          <Icon className={cn("h-4 w-4", variantStyles[variant])} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          variant === "default" && "text-gray-900 dark:text-gray-100",
          variant === "green" && "text-green-600 dark:text-green-400",
          variant === "yellow" && "text-yellow-600 dark:text-yellow-400",
          variant === "red" && "text-red-600 dark:text-red-400"
        )}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

