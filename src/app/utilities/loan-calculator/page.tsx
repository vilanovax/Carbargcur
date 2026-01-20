import { getLoanCalculatorConfig } from "@/lib/calculator-config";
import LoanCalculatorClient from "./LoanCalculatorClient";

export default async function LoanCalculatorPage() {
  const config = await getLoanCalculatorConfig();

  return <LoanCalculatorClient config={config} />;
}
