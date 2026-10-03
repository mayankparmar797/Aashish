import { getAccountAnalytics } from "../analytics/account-analytics";
export async function analyticsRoutes(app) {
    app.get("/analytics/account/:accountId", async (request, reply) => {
        const { accountId } = request.params;
        if (!/^\d{12}$/.test(accountId)) {
            return reply.code(400).send({
                error: "Invalid account number"
            });
        }
        return getAccountAnalytics(accountId);
    });
}
