import { useI18n } from '@/i18n/i18n';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import PageTitle from '@/components/PageTitle';
import { useSettings, ViewMode } from '@/contexts/SettingsContext';

interface SettingSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, description, children }) => {
  return (
    <div className="rounded-xl border bg-explorer-slate dark:border-slate-800 shadow-sm">
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

const SettingItem: React.FC<SettingItemProps> = ({ label, description, children }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col space-y-1 pr-4">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-explorer-slate-text">
          {description}
        </span>
      </div>
      {children}
    </div>
  );
};


const SettingsPage = () => {
  const { t } = useI18n();
  const { settings, updateSettings } = useSettings();

  const handleViewChange = (value: string) => {
    updateSettings({ accountPageView: value as ViewMode });
  };

  const handleDisplayModeChange = (checked: boolean) => {
    updateSettings({ displayMode: checked ? 'vests' : 'hp' });
  };

  return (
    <div className="page-container mx-auto space-y-8">
      <header>
         <PageTitle
              titleKey="pageTitle.settings"
              className="py-4"
            />
        <p className="mt-2">{t('settingsPage.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       {/* --- Show Vests Card --- */}
        <SettingSection
          title={t('settingsPage.displayTitle')}
          description={t('settingsPage.displayDescription')}
        >
          <SettingItem
            label={t('settingsPage.showVestsLabel')}
            description={t('settingsPage.showVestsDescription')}
          >
            <Switch
              id="display-mode"
              checked={settings.displayMode === 'vests'}
              onCheckedChange={handleDisplayModeChange}
            />
          </SettingItem>

        </SettingSection>
        
        {/* Account Page View Setting */}
        <SettingSection
          title={t('settingsPage.layoutTitle')}
          description={t('settingsPage.layoutDescription')}
        >
          
          <RadioGroup
            value={settings.accountPageView}
            onValueChange={handleViewChange}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="view-tabbed" className="flex items-center space-x-3 cursor-pointer">
                <RadioGroupItem value="tabbed" id="view-tabbed" />
                <span className="font-medium">{t('settingsPage.tabbedViewLabel')}</span>
              </Label>
              <p className="pl-8 text-xs text-explorer-slate-text mt-1">{t('settingsPage.tabbedViewDescription')}</p>
            </div>
            <div>
              <Label htmlFor="view-original" className="flex items-center space-x-3 cursor-pointer">
                <RadioGroupItem value="original" id="view-original" />
                <span className="font-medium">{t('settingsPage.originalViewLabel')}</span>
              </Label>
              <p className="pl-8 text-xs text-explorer-slate-text mt-1">{t('settingsPage.originalViewDescription')}</p>
            </div>
          </RadioGroup>
        </SettingSection>

        {/* --- How to add a new setting in the future --- */}
        {/* 
        <SettingSection
          title={t('settingsPage.newFeatureTitle')}
          description={t('settingsPage.newFeatureDescription')}
        >
          <SettingItem
            label={t('settingsPage.newFeatureLabel')}
            description={t('settingsPage.newFeatureSubDescription')}
          >
            <Switch id="new-feature-toggle" />
          </SettingItem>
        </SettingSection>
        */}

      </div>
    </div>
  );
};

export default SettingsPage;