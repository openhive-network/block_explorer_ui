import React from "react";
import { Download } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

const ExportsComingSoon: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-theme px-6 py-16 text-center shadow-sm dark:border-slate-700">
      <Download className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
        {t("tools.exports.comingSoon")}
      </h2>
      <p className="mt-1 max-w-sm text-sm text-slate-400 dark:text-slate-500">
        {t("tools.exports.body")}
      </p>
    </div>
  );
};

export default ExportsComingSoon;
