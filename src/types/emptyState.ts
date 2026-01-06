import { ReactNode } from "react";

export type EmptyStateConfig = {
  icon: ReactNode;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  hint?: string;
  benefit?: string; // Impact statement (e.g., "3x more views")
};

export type SectionKey =
  | "basicInfo"
  | "profilePhoto"
  | "skills"
  | "experience"
  | "education"
  | "resume"
  | "publicProfile";

export type EmptyStatePreset = {
  isEmpty: (data: any) => boolean;
  config: EmptyStateConfig | ((data: any) => EmptyStateConfig);
};
