import React from "react";
import { useI18n } from "@/i18n/i18n";
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
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="rounded border bg-explorer-slate dark:border-slate-800 shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-explorer-slate-text">{description}</p>
      </div>
      <div className="border-t dark:border-slate-700/50 p-6 space-y-6">
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
    <div className="flex items-center justify-between">
      <div className="flex flex-col space-y-1 pr-4">
        <span className="font-medium">{label}</span>
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

  return (
    <div key={config.key}>
      <h3 className="text-base font-semibold mb-3 -mt-1">
        {t(config.titleKey)}
      </h3>
      <RadioGroup
        value={String(settings[config.key])}
        onValueChange={(value) =>
          updateSettings({ [config.key]: value as any })
        }
        className="space-y-4"
      >
        {config.options.map((option) => (
          <div key={option.value}>
            <Label
              htmlFor={`${config.key}-${option.value}`}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <RadioGroupItem
                value={option.value}
                id={`${config.key}-${option.value}`}
              />
              <span className="font-medium">{t(option.labelKey)}</span>
            </Label>
            <p className="pl-8 text-xs text-explorer-slate-text mt-1">
              {t(option.descriptionKey)}
            </p>
          </div>
        ))}
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
      items: [
        {
          type: "switch",
          key: "displayVestHpMode",
          labelKey: "settingsPage.showVestsLabel",
          descriptionKey: "settingsPage.showVestsDescription",
          trueValue: "vests",
          falseValue: "hp",
        },
      ],
    },
    {
      sectionTitleKey: "settingsPage.layoutTitle",
      sectionDescriptionKey: "settingsPage.layoutDescription",
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
  ];

  return (
    <div className="page-container mx-auto space-y-8">
      <header>
        <PageTitle titleKey="pageTitle.settings" className="py-4" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {settingsConfig.map((section, sectionIndex) => (
          <SettingSection
            key={sectionIndex}
            title={t(section.sectionTitleKey)}
            description={t(section.sectionDescriptionKey)}
          >
            {section.items.map((item, itemIndex) => (
              <React.Fragment key={item.key}>
                {itemIndex > 0 && (
                  <hr className="my-6 border-slate-200 dark:border-slate-700/50" />
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

export default SettingsPage;
