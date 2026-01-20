import { db } from "./db";
import { calculatorConfigs } from "./db/schema";
import { eq, and, desc } from "drizzle-orm";

// Type definitions for calculator configs
export interface SalaryCalculatorConfig {
  version: string;
  year: number;
  insurance: {
    employee_rate: number;
    description: string;
  };
  child_allowance: {
    amount_per_child: number;
    max_children: number;
    description: string;
  };
  overtime: {
    base_hours: number;
    rate_multiplier: number;
    description: string;
  };
  tax_brackets: Array<{
    min: number;
    max: number | null;
    rate: number;
    label: string;
  }>;
}

export interface TaxCalculatorConfig {
  version: string;
  year: number;
  tax_brackets: Array<{
    from: number;
    to: number | null;
    rate: number;
    label: string;
  }>;
}

export interface LoanCalculatorConfig {
  version: string;
  year: number;
  calculation_method: string;
  default_interest_rate: number;
  interest_rate_range: {
    min: number;
    max: number;
  };
  max_term_months: number;
  description: string;
}

// Default fallback configs (current hardcoded values)
const DEFAULT_SALARY_CONFIG: SalaryCalculatorConfig = {
  version: "1.0",
  year: 1403,
  insurance: {
    employee_rate: 7,
    description: "نرخ بیمه سهم کارمند",
  },
  child_allowance: {
    amount_per_child: 110000,
    max_children: 3,
    description: "حق اولاد به ازای هر فرزند",
  },
  overtime: {
    base_hours: 220,
    rate_multiplier: 1.4,
    description: "محاسبه اضافه‌کاری",
  },
  tax_brackets: [
    { min: 0, max: 10000000, rate: 0, label: "تا ۱۰ میلیون - معاف" },
    { min: 10000000, max: 20000000, rate: 0.10, label: "۱۰ تا ۲۰ میلیون - ۱۰٪" },
    { min: 20000000, max: 40000000, rate: 0.15, label: "۲۰ تا ۴۰ میلیون - ۱۵٪" },
    { min: 40000000, max: null, rate: 0.20, label: "بالای ۴۰ میلیون - ۲۰٪" },
  ],
};

const DEFAULT_TAX_CONFIG: TaxCalculatorConfig = {
  version: "1.0",
  year: 1403,
  tax_brackets: [
    { from: 0, to: 10000000, rate: 0, label: "تا ۱۰ میلیون تومان - معاف" },
    { from: 10000000, to: 20000000, rate: 0.10, label: "۱۰ تا ۲۰ میلیون - ۱۰٪" },
    { from: 20000000, to: 40000000, rate: 0.15, label: "۲۰ تا ۴۰ میلیون - ۱۵٪" },
    { from: 40000000, to: null, rate: 0.20, label: "بالای ۴۰ میلیون - ۲۰٪" },
  ],
};

const DEFAULT_LOAN_CONFIG: LoanCalculatorConfig = {
  version: "1.0",
  year: 1403,
  calculation_method: "amortization",
  default_interest_rate: 18,
  interest_rate_range: {
    min: 0,
    max: 30,
  },
  max_term_months: 360,
  description: "محاسبه بر اساس فرمول Amortization",
};

/**
 * Get active salary calculator configuration
 * Falls back to default config if not found in database
 */
export async function getSalaryCalculatorConfig(
  year?: number
): Promise<SalaryCalculatorConfig> {
  try {
    const currentYear = year || 1403;

    const configs = await db
      .select()
      .from(calculatorConfigs)
      .where(
        and(
          eq(calculatorConfigs.calculatorType, "salary"),
          eq(calculatorConfigs.configYear, currentYear),
          eq(calculatorConfigs.isActive, true)
        )
      )
      .orderBy(desc(calculatorConfigs.updatedAt))
      .limit(1);

    if (configs.length > 0 && configs[0].config) {
      return configs[0].config as SalaryCalculatorConfig;
    }

    return DEFAULT_SALARY_CONFIG;
  } catch (error) {
    console.error("Error fetching salary calculator config:", error);
    return DEFAULT_SALARY_CONFIG;
  }
}

/**
 * Get active tax calculator configuration
 * Falls back to default config if not found in database
 */
export async function getTaxCalculatorConfig(
  year?: number
): Promise<TaxCalculatorConfig> {
  try {
    const currentYear = year || 1403;

    const configs = await db
      .select()
      .from(calculatorConfigs)
      .where(
        and(
          eq(calculatorConfigs.calculatorType, "tax"),
          eq(calculatorConfigs.configYear, currentYear),
          eq(calculatorConfigs.isActive, true)
        )
      )
      .orderBy(desc(calculatorConfigs.updatedAt))
      .limit(1);

    if (configs.length > 0 && configs[0].config) {
      return configs[0].config as TaxCalculatorConfig;
    }

    return DEFAULT_TAX_CONFIG;
  } catch (error) {
    console.error("Error fetching tax calculator config:", error);
    return DEFAULT_TAX_CONFIG;
  }
}

/**
 * Get active loan calculator configuration
 * Falls back to default config if not found in database
 */
export async function getLoanCalculatorConfig(
  year?: number
): Promise<LoanCalculatorConfig> {
  try {
    const currentYear = year || 1403;

    const configs = await db
      .select()
      .from(calculatorConfigs)
      .where(
        and(
          eq(calculatorConfigs.calculatorType, "loan"),
          eq(calculatorConfigs.configYear, currentYear),
          eq(calculatorConfigs.isActive, true)
        )
      )
      .orderBy(desc(calculatorConfigs.updatedAt))
      .limit(1);

    if (configs.length > 0 && configs[0].config) {
      return configs[0].config as LoanCalculatorConfig;
    }

    return DEFAULT_LOAN_CONFIG;
  } catch (error) {
    console.error("Error fetching loan calculator config:", error);
    return DEFAULT_LOAN_CONFIG;
  }
}

/**
 * Validate calculator configuration based on type
 */
export function validateCalculatorConfig(
  type: "salary" | "tax" | "loan",
  config: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.version) {
    errors.push("فیلد version الزامی است");
  }

  if (!config.year || config.year < 1400) {
    errors.push("سال باید بزرگتر از ۱۴۰۰ باشد");
  }

  switch (type) {
    case "salary":
      if (!config.insurance?.employee_rate || config.insurance.employee_rate < 0) {
        errors.push("نرخ بیمه باید عددی مثبت باشد");
      }
      if (!config.child_allowance?.amount_per_child || config.child_allowance.amount_per_child < 0) {
        errors.push("مبلغ حق اولاد باید عددی مثبت باشد");
      }
      if (!config.overtime?.base_hours || config.overtime.base_hours <= 0) {
        errors.push("ساعت پایه اضافه‌کاری باید بزرگتر از صفر باشد");
      }
      if (!Array.isArray(config.tax_brackets) || config.tax_brackets.length === 0) {
        errors.push("پله‌های مالیاتی الزامی است");
      }
      break;

    case "tax":
      if (!Array.isArray(config.tax_brackets) || config.tax_brackets.length === 0) {
        errors.push("پله‌های مالیاتی الزامی است");
      } else {
        config.tax_brackets.forEach((bracket: any, index: number) => {
          if (bracket.rate < 0 || bracket.rate > 100) {
            errors.push(`نرخ مالیات پله ${index + 1} باید بین ۰ تا ۱۰۰ باشد`);
          }
        });
      }
      break;

    case "loan":
      if (!config.calculation_method) {
        errors.push("روش محاسبه الزامی است");
      }
      if (config.default_interest_rate < 0) {
        errors.push("نرخ بهره نمی‌تواند منفی باشد");
      }
      if (!config.interest_rate_range || config.interest_rate_range.min < 0) {
        errors.push("محدوده نرخ بهره باید معتبر باشد");
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default configuration for a calculator type
 */
export function getDefaultConfig(
  type: "salary" | "tax" | "loan"
): SalaryCalculatorConfig | TaxCalculatorConfig | LoanCalculatorConfig {
  switch (type) {
    case "salary":
      return DEFAULT_SALARY_CONFIG;
    case "tax":
      return DEFAULT_TAX_CONFIG;
    case "loan":
      return DEFAULT_LOAN_CONFIG;
  }
}
