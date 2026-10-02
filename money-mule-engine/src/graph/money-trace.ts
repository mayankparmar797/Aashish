import {
  buildTransactionIndex,
  IndexedTransaction
} from "../analytics/transaction-index";

import {
  GraphNode,
  GraphEdge,
  TransactionGraph
} from "./types";

interface TraceResult extends TransactionGraph {
  root: string;
  maxDepth: number;
  visitedAccounts: number;
}

interface QueueItem {
  account: string;
  depth: number;
}

function transactionToEdge(
  tx: IndexedTransaction
): GraphEdge {
  return {
    id: tx.transactionId,
    source: tx.sender,
    target: tx.receiver,
    amount: tx.amount,
    timestamp: tx.timestamp.toISOString(),
    paymentMode: tx.paymentMode,
    transactionId: tx.transactionId
  };
}

export async function traceMoney(
  rootAccount: string,
  maxDepth = 4
): Promise<TraceResult> {

  /*
   * Build the transaction index once.
   *
   * We no longer scan the entire transactions table
   * for every account during traversal.
   */
  const index = await buildTransactionIndex();

  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();

  const visited = new Set<string>();

  const queue: QueueItem[] = [];

  /*
   * Root = hop 0
   */
  nodes.set(rootAccount, {
    id: rootAccount,
    label: rootAccount,
    type: "account",
    hop: 0
  });

  visited.add(rootAccount);

  queue.push({
    account: rootAccount,
    depth: 0
  });

  /*
   * Breadth First Search
   */
  while (queue.length > 0) {

    const current = queue.shift()!;

    /*
     * Don't traverse beyond requested depth.
     */
    if (current.depth >= maxDepth) {
      continue;
    }

    /*
     * Get ONLY transactions connected
     * to the current account.
     */
    const outgoing =
      index.outgoing.get(current.account) ?? [];

    const incoming =
      index.incoming.get(current.account) ?? [];

    /*
     * Combine incoming + outgoing.
     */
    const connectedTransactions = [
      ...outgoing,
      ...incoming
    ];

    /*
     * Protect against duplicate processing.
     *
     * A transaction cannot create two graph edges.
     */
    const processedTransactions = new Set<string>();

    for (const tx of connectedTransactions) {

      if (processedTransactions.has(tx.transactionId)) {
        continue;
      }

      processedTransactions.add(tx.transactionId);

      /*
       * Add edge.
       */
      if (!edges.has(tx.transactionId)) {
        edges.set(
          tx.transactionId,
          transactionToEdge(tx)
        );
      }

      /*
       * Determine neighboring account.
       */
      const nextAccount =
        tx.sender === current.account
          ? tx.receiver
          : tx.sender;

      /*
       * Ignore self-transactions.
       */
      if (nextAccount === current.account) {
        continue;
      }

      /*
       * Add node if not already present.
       */
      if (!nodes.has(nextAccount)) {
        nodes.set(nextAccount, {
          id: nextAccount,
          label: nextAccount,
          type: "account",
          hop: current.depth + 1
        });
      }

      /*
       * Queue unseen accounts.
       */
      if (!visited.has(nextAccount)) {

        visited.add(nextAccount);

        queue.push({
          account: nextAccount,
          depth: current.depth + 1
        });
      }
    }
  }

  return {
    root: rootAccount,
    maxDepth,
    visitedAccounts: visited.size,
    nodes: Array.from(nodes.values()),
    edges: Array.from(edges.values())
  };
}
