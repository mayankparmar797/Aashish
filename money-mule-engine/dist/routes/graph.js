import { getAccountGraph } from "../graph/transaction-graph";
export async function graphRoutes(app) {
    app.get("/graph/account/:accountId", async (request, reply) => {
        const { accountId } = request.params;
        if (!/^\d{12}$/.test(accountId)) {
            return reply.code(400).send({
                error: "Invalid account number"
            });
        }
        return getAccountGraph(accountId);
    });
}
