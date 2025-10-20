import { Section } from "@/types";
import { Circle, Globe, List, Users } from "lucide-react";
import { Button } from "./ui/button";

// Define the navigation items array
const navigationItems = [
  {
    id: "my-issues" as Section,
    label: "My Issues",
    icon: List,
  },
  {
    id: "community" as Section,
    label: "Community",
    icon: Globe,
  },
  {
    id: "status" as Section,
    label: "Status",
    icon: Circle,
  },
];

export const BottomNavigation = ({
  currentSection,
  handleSectionChange,
}: {
  currentSection: Section;
  handleSectionChange: (sec: Section) => void;
}) => {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2 z-20">
      <div className="flex justify-around">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentSection === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col gap-1.5 items-center px-3 my-2  text-xs ${
                isActive
                  ? "text-black font-extrabold "
                  : "text-gray-500 hover:text-black"
              } transition-colors`}
              onClick={() => handleSectionChange(item.id)}
            >
              <IconComponent className="w-10 h-10" size={500} />
              <span className={` ${isActive ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
