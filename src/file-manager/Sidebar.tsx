import { ArrowBackIcon, CalendarIcon, HomeIcon, List, ListItem, StarIcon, Text, TrashIcon } from "@nithin-studio-app/ui-components";
import type { NavSection, NavSectionConfig } from "./types";

const NAV_SECTIONS: NavSectionConfig[] = [
  { key: "home", label: "Home", icon: <HomeIcon /> },
  { key: "recent", label: "Recently Added", icon: <CalendarIcon /> },
  { key: "starred", label: "Starred", icon: <StarIcon /> },
  { key: "trash", label: "Trash", icon: <TrashIcon /> },
];

export { NAV_SECTIONS };

interface SidebarProps {
  serviceName: string;
  onBack?: () => void;
  activeNav: NavSection;
  onGoToRoot: () => void;
  onSwitchNav: (section: NavSection) => void;
}

export function Sidebar({ serviceName, onBack, activeNav, onGoToRoot, onSwitchNav }: SidebarProps) {
  return (
    <div className="file-manager-sidebar">
      <div className="file-manager-panel-header file-manager-service-header">
        {onBack && (
          <button type="button" className="file-manager-back" onClick={onBack} aria-label="Back to services">
            <ArrowBackIcon />
          </button>
        )}
        <Text variant="h6">{serviceName}</Text>
      </div>
      <div className="file-manager-panel-body file-manager-nav-body">
        <List>
          {NAV_SECTIONS.map((section) => (
            <ListItem
              key={section.key}
              icon={section.icon}
              selected={activeNav === section.key}
              onClick={section.key === "home" ? onGoToRoot : () => onSwitchNav(section.key)}
            >
              {section.label}
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
}
