import React from "react";
import Link from "next/link";
import { config } from "@/Config";
import { useAddressesContext } from "@/contexts/AddressesContext";
import { useHealthCheckerContext } from "@/contexts/HealthCheckerContext";
import useHafbeVersion from "@/hooks/api/common/useHafbeVersion";
import { useI18n } from "@/i18n/i18n";
import HealthCheckerDialog from "./HealthCheckerDialog";

const { lastCommitHashRepoUrl, gitHash } = config;

const ClassicFooter: React.FC = () => {
  const { t } = useI18n();
  const { hafbeVersionData } = useHafbeVersion();
  const { nodeAddress, apiAddress } = useAddressesContext();
  const { nodeHealthCheckerService, restApiHealthCheckerService } =
    useHealthCheckerContext();

  return (
    <footer
      className="w-full bg-theme mt-5 border-t border-gray-200 dark:border-gray-700"
      data-testid="footer"
    >
      <div className="container flex flex-col items-center gap-2 py-4 text-center text-xs">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <span data-testid="footer-last-commit-hash">
            {t("footer.lastCommit")}#:{" "}
            <Link
              href={lastCommitHashRepoUrl}
              target="_blank"
              className="text-link hover:opacity-75"
            >
              {gitHash}
            </Link>
          </span>
          <span data-testid="footer-hafbe-version-hash">
            {t("footer.hafbeVersion")}#: {hafbeVersionData}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          {!!nodeHealthCheckerService && (
            <HealthCheckerDialog
              trigerText={t("footer.hiveNode")}
              apiAddress={nodeAddress}
              healthCheckerService={nodeHealthCheckerService}
            />
          )}
          {!!restApiHealthCheckerService && (
            <HealthCheckerDialog
              trigerText={t("footer.explorerBackendApi")}
              apiAddress={apiAddress}
              healthCheckerService={restApiHealthCheckerService}
            />
          )}
        </div>
        <p className="text-explorer-dark-gray dark:text-gray-400">
          © {new Date().getFullYear()} HIVE Block Explorer.{" "}
          {t("footer.allRightsReserved")}.
        </p>
      </div>
    </footer>
  );
};

export default ClassicFooter;
