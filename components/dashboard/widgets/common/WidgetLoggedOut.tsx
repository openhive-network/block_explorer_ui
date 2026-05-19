import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/i18n";

interface WidgetLoggedOutProps {
  icon: LucideIcon;
  message: string;
}

const WidgetLoggedOut: React.FC<WidgetLoggedOutProps> = ({
  icon: Icon,
  message,
}) => {
  const { t } = useI18n();
  return (
    <Card className="col-span-12 lg:col-span-3 mb-2">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center gap-2">
        <Icon className="h-8 w-8 opacity-20" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link
          href="/login"
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("auth.signIn")}
        </Link>
      </CardContent>
    </Card>
  );
};

export default WidgetLoggedOut;
