import {
  getAccountAnalytics,
  AccountAnalytics
} from "./account-analytics";

export interface RiskFactor {
  factor: string;
  score: number;
  reason: string;
}

export interface AccountRisk {
  account: string;
  riskScore: number;
  riskFactors: RiskFactor[];
}

export async function getAccountRisk(
  accountId: string
): Promise<AccountRisk> {
  const analytics: AccountAnalytics =
    await getAccountAnalytics(accountId);

  const riskFactors: RiskFactor[] = [];

  let riskScore = 0;

  /*
   * 1. Transaction volume
   *
   * More transactions can indicate high activity.
   */
  if (analytics.transactionCount >= 15) {
    riskScore += 20;

    riskFactors.push({
      factor: "High transaction volume",
      score: 20,
      reason: `Account has ${analytics.transactionCount} transactions`
    });
  }

  /*
   * 2. Many counterparties
   */
  const totalCounterparties =
    analytics.incoming.uniqueAccounts +
    analytics.outgoing.uniqueAccounts;

  if (totalCounterparties >= 6) {
    riskScore += 20;

    riskFactors.push({
      factor: "Many counterparties",
      score: 20,
      reason: `Account interacted with ${totalCounterparties} unique counterparties`
    });
  }

  /*
   * 3. High outgoing flow
   *
   * Compare outgoing money with incoming money.
   */
  if (
    analytics.incoming.amount > 0 &&
    analytics.outgoing.amount /
      analytics.incoming.amount >=
      0.8
  ) {
    riskScore += 20;

    const ratio =
      analytics.outgoing.amount /
      analytics.incoming.amount;

    riskFactors.push({
      factor: "High outgoing flow",
      score: 20,
      reason: `Outgoing/incoming ratio is ${ratio.toFixed(2)}`
    });
  }

  /*
   * 4. High transaction velocity
   *
   * Currently using transaction count as a simple
   * velocity indicator. We can improve this later
   * using timestamps.
   */
  if (analytics.transactionCount >= 10) {
    riskScore += 20;

    riskFactors.push({
      factor: "High transaction velocity",
      score: 20,
      reason: `${analytics.transactionCount} transactions detected`
    });
  }

  /*
   * 5. High overall money flow
   */
  if (analytics.totalFlow >= 500000) {
    riskScore += 20;

    riskFactors.push({
      factor: "High money flow",
      score: 20,
      reason: `Total transaction flow is ₹${analytics.totalFlow}`
    });
  }

  /*
   * Maximum score = 100
   */
  riskScore = Math.min(riskScore, 100);

  return {
    account: accountId,
    riskScore,
    riskFactors
  };
}