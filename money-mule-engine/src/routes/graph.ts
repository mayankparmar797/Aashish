import { FastifyInstance } from "fastify";
import { getAccountGraph } from "../graph/transaction-graph";

interface GraphParams {
  accountId: string;
}

export async function graphRoutes(
  app: FastifyInstance
) {
  app.get<{ Params: GraphParams }>(
    "/graph/account/:accountId",
    async (request, reply) => {
      const { accountId } = request.params;

      if (!/^\d{12}$/.test(accountId)) {
        return reply.code(400).send({
          error: "Invalid account number"
        });
      }

      return getAccountGraph(accountId);
    }
  );
}
