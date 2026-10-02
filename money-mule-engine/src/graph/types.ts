export interface GraphNode {
  id: string;
  label: string;
  type: "account";
  hop: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  timestamp: string;
  paymentMode: string;
  transactionId: string;
}

export interface TransactionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
