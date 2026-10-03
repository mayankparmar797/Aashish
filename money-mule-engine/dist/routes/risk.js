import { assessAccountRisk } from "../analytics/risk-engine";
export async function riskRoutes(app) {
    app.get("/risk/account/:accountId", async (request, reply) => {
        const { accountId } = request.params;
        if (!/^\d{12}$/.test(accountId)) {
            return reply.code(400).send({
                error: "Invalid account number"
            });
        }
        try {
            return await assessAccountRisk(accountId);
        }
        catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                error: "Failed to calculate account risk"
            });
        }
    });
}
