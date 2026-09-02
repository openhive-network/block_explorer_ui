import React from "react";
import type { GetServerSideProps } from "next";
import { LayoutGrid, LucideIcon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import { SeoMeta, noindexMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seo/seoStrings";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import PageTitle from "@/components/PageTitle";
import { useSettings, AppSettings } from "@/contexts/SettingsContext";

//  To add a new setting, Follow these steps:
// Step 1: Update the Settings Context
//    - File: src/contexts/SettingsContext.tsx
//    - Action: Add your new setting's type and update the `AppSettings` interface.
//    - Action: Add a default value for your new setting in the `useState` hook.
//
// Step 2: Add New Translations
//    - Action: Add the new translation keys for the titles, labels, and descriptions.
//
// Step 3: Add the Setting to the Configuration Object Below
//    - Action: Add a new object to the `settingsConfig` array below. This can be
//              in a new section or an existing one. The UI will render automatically.
// Step 4: Use the New Setting
//    - Action: Import `useSettings` in any component and use the new setting to
//              conditionally render UI or apply classes.

interface SettingSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
}) => {
  return (
    <div className="rounded-lg border bg-explorer-slate dark:border-slate-800 shadow-sm">
      <div className="flex items-start gap-2.5 px-4 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 dark:bg-indigo-400/15">
          <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-tight">{title}</h2>
          <p className="mt-0.5 text-xs text-explorer-slate-text">
            {description}
          </p>
        </div>
      </div>
      <div className="border-t dark:border-slate-700/50 p-4 space-y-3">
        {children}
      </div>
    </div>
  );
};

interface SettingItemProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  label,
  description,
  children,
}) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-explorer-slate-text">{description}</span>
      </div>
      {children}
    </div>
  );
};

interface SwitchSettingConfig {
  type: "switch";
  key: keyof AppSettings;
  labelKey: string;
  descriptionKey: string;
  trueValue: AppSettings[keyof AppSettings];
  falseValue: AppSettings[keyof AppSettings];
}

interface RadioSettingConfig {
  type: "radio";
  key: keyof AppSettings;
  titleKey: string;
  options: {
    value: string;
    labelKey: string;
    descriptionKey: string;
  }[];
}

type SettingItemConfig = SwitchSettingConfig | RadioSettingConfig;

interface SettingSectionConfig {
  sectionTitleKey: string;
  sectionDescriptionKey: string;
  icon: LucideIcon;
  items: SettingItemConfig[];
}

const SwitchSettingRenderer: React.FC<{ config: SwitchSettingConfig }> = ({
  config,
}) => {
  const { t } = useI18n();
  const { settings, updateSettings } = useSettings();

  return (
    <SettingItem
      label={t(config.labelKey)}
      description={t(config.descriptionKey)}
    >
      <Switch
        id={config.key}
        checked={settings[config.key] === config.trueValue}
        onCheckedChange={(checked) =>
          updateSettings({
            [config.key]: checked ? config.trueValue : config.falseValue,
          })
        }
      />
    </SettingItem>
  );
};

const RadioSettingRenderer: React.FC<{ config: RadioSettingConfig }> = ({
  config,
}) => {
  const { t } = useI18n();
  const { settings, updateSettings } = useSettings();

  const selected = String(settings[config.key]);
  // Spelled out so Tailwind can see both column counts.
  const columns =
    config.options.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div key={config.key}>
      <h3 className="mb-2 text-sm font-semibold">{t(config.titleKey)}</h3>
      <RadioGroup
        value={selected}
        onValueChange={(value) =>
          updateSettings({ [config.key]: value as any })
        }
        className={cn("grid grid-cols-1 gap-2", columns)}
      >
        {config.options.map((option) => {
          const id = `${config.key}-${option.value}`;
          const isSelected = selected === option.value;

          return (
            <Label
              key={option.value}
              htmlFor={id}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-lg border p-2.5 transition-colors",
                isSelected
                  ? "border-indigo-500 bg-indigo-500/10 dark:bg-indigo-400/15"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
              )}
            >
              <span className="flex items-center gap-2">
                <RadioGroupItem value={option.value} id={id} />
                <span className="text-sm font-medium">
                  {t(option.labelKey)}
                </span>
              </span>
              <span className="text-xs text-explorer-slate-text">
                {t(option.descriptionKey)}
              </span>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
};

// --- Main SettingsPage Component ---

const SettingsPage = () => {
  const { t } = useI18n();

  const settingsConfig: SettingSectionConfig[] = [
    {
      sectionTitleKey: "settingsPage.displayTitle",
      sectionDescriptionKey: "settingsPage.displayDescription",
      icon: Monitor,
      items: [
        {
          type: "switch",
          key: "displayVestHpMode",
          labelKey: "settingsPage.showVestsLabel",
          descriptionKey: "settingsPage.showVestsDescription",
          trueValue: "vests",
          falseValue: "hp",
        },
        // App-wide, unlike the page-scoped pickers under Layout Preferences.
        {
          type: "switch",
          key: "layoutWidth",
          labelKey: "settingsPage.compactLayoutLabel",
          descriptionKey: "settingsPage.compactLayoutDescription",
          trueValue: "compact", // When switch is ON, layout is 'compact' (75%)
          falseValue: "full", // When switch is OFF, layout is 'full' (98%)
        },
      ],
    },
    {
      sectionTitleKey: "settingsPage.layoutTitle",
      sectionDescriptionKey: "settingsPage.layoutDescription",
      icon: LayoutGrid,
      items: [
        {
          type: "radio",
          key: "accountPageView",
          titleKey: "settingsPage.accountPageViewTitle",
          options: [
            {
              value: "tabbed",
              labelKey: "settingsPage.tabbedViewLabel",
              descriptionKey: "settingsPage.tabbedViewDescription",
            },
            {
              value: "original",
              labelKey: "settingsPage.originalViewLabel",
              descriptionKey: "settingsPage.originalViewDescription",
            },
          ],
        },
        {
          type: "radio",
          key: "progressBarType",
          titleKey: "settingsPage.resourceBarStyleTitle",
          options: [
            {
              value: "radial",
              labelKey: "settingsPage.radialViewLabel",
              descriptionKey: "settingsPage.radialViewDescription",
            },
            {
              value: "linear",
              labelKey: "settingsPage.linearViewLabel",
              descriptionKey: "settingsPage.linearViewDescription",
            },
          ],
        },
        {
          type: "radio",
          key: "dataViewSwitchStyle",
          titleKey: "settingsPage.dataViewSwitchStyle",
          options: [
            {
              value: "popover",
              labelKey: "settingsPage.popoverDataViewLabel",
              descriptionKey: "settingsPage.popoverDataViewDescription",
            },
            {
              value: "icons",
              labelKey: "settingsPage.iconDataViewLabel",
              descriptionKey: "settingsPage.iconDataViewDescription",
            },
            {
              value: "cycle",
              labelKey: "settingsPage.cycleDataViewLabel",
              descriptionKey: "settingsPage.cycleDataViewDescription",
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="page-container mx-auto space-y-4">
      <header>
        <PageTitle titleKey="pageTitle.settings" className="py-4" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {settingsConfig.map((section, sectionIndex) => (
          <SettingSection
            key={sectionIndex}
            title={t(section.sectionTitleKey)}
            description={t(section.sectionDescriptionKey)}
            icon={section.icon}
          >
            {section.items.map((item, itemIndex) => (
              <React.Fragment key={item.key}>
                {itemIndex > 0 && (
                  <hr className="border-slate-200 dark:border-slate-700/50" />
                )}

                {item.type === "switch" && (
                  <SwitchSettingRenderer config={item} />
                )}
                {item.type === "radio" && (
                  <RadioSettingRenderer config={item} />
                )}
              </React.Fragment>
            ))}
          </SettingSection>
        ))}
      </div>
    </div>
  );
};

// noindex has to come from getServerSideProps: a <Head> inside the page body
// sits under the hiveChain-gated <Layout>, which renders null on the server, so
// a crawler would never see it. _app emits this meta above <Providers>.
export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: noindexMeta(
        req,
        "/settings",
        seoText("seo.settings.title"),
        seoText("seo.settings.description")
      ),
    },
  };
};

export default SettingsPage;
