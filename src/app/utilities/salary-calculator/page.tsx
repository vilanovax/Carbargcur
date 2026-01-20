import { getSalaryCalculatorConfig } from "@/lib/calculator-config";
import SalaryCalculatorClient from "./SalaryCalculatorClient";

export default async function SalaryCalculatorPage() {
  const config = await getSalaryCalculatorConfig();

  return <SalaryCalculatorClient config={config} />;
}
