import { traceMoney } from "../graph/money-trace";
export async function traceRoutes(app) {
    app.get("/graph/trace/:accountId", async (request, reply) => {
        const { accountId } = request.params;
        if (!/^\d{12}$/.test(accountId)) {
            return reply.code(400).send({
                error: "Invalid account number"
            });
        }
        const requestedDepth = Number(request.query.depth ?? 4);
        const depth = Math.min(Math.max(requestedDepth, 1), 4);
        return traceMoney(accountId, depth);
    });
}
