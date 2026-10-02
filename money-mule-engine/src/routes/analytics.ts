import { FastifyInstance } from "fastify";
import { getAccountAnalytics } from "../analytics/account-analytics";

interface AccountParams {
  accountId: string;
}

export async function analyticsRoutes(app: FastifyInstance) {
  app.get<{ Params: AccountParams }>(
    "/analytics/account/:accountId",
    async (request, reply) => {
      const { accountId } = request.params;

      if (!/^\d{12}$/.test(accountId)) {
        return reply.code(400).send({
          error: "Invalid account number"
        });
      }

      return getAccountAnalytics(accountId);
    }
  );
}