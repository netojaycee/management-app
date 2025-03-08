import { prisma } from "@/lib/prisma";

/**
 * Logs user actions to the database
 * @param userId - The ID of the user performing the action
 * @param action - A description of the action
 * @param details - Additional details (optional)
 */
export async function logAction(userId: string, action: string, details?: string) {
    try {
        await prisma.log.create({
            data: {
                userId,
                action,
                details,
            },
        });
    } catch (error) {
        console.error("Error logging action:", error);
    }
}
