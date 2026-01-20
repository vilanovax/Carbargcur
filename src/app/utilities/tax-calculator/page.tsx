import { getTaxCalculatorConfig } from "@/lib/calculator-config";
import TaxCalculatorClient from "./TaxCalculatorClient";

export default async function TaxCalculatorPage() {
  const config = await getTaxCalculatorConfig();

  return <TaxCalculatorClient config={config} />;
}
