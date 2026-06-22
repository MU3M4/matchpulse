// src/lib/db.ts
import { RDSDataClient, ExecuteStatementCommand } from "@aws-sdk/client-rds-data";

const rdsDataClient = new RDSDataClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

// FIX: Explicitly tell TypeScript this ALWAYS returns an array
export async function query(sql: string): Promise<any[]> {
    const command = new ExecuteStatementCommand({
        resourceArn: process.env.DB_CLUSTER_ARN,
        secretArn: process.env.DB_SECRET_ARN,
        database: "postgres",
        sql: sql,
        includeResultMetadata: true,
    });

    try {
        const response = await rdsDataClient.send(command);

        // FIX: If it's an INSERT/UPDATE with no records, return an empty array instead of the raw AWS object
        if (!response.records || response.records.length === 0) {
            return [];
        }

        // For SELECT queries, parse the AWS Data API format into normal JSON
        const columnMetadata = response.columnMetadata || [];

        return response.records.map((record) => {
            const row: any = {};
            record.forEach((field, index) => {
                const colName = columnMetadata[index]?.name || `col_${index}`;

                if (field.isNull) {
                    row[colName] = null;
                } else if (field.stringValue !== undefined) {
                    row[colName] = field.stringValue;
                } else if (field.longValue !== undefined) {
                    row[colName] = field.longValue;
                } else if (field.doubleValue !== undefined) {
                    row[colName] = field.doubleValue;
                } else if (field.booleanValue !== undefined) {
                    row[colName] = field.booleanValue;
                }
            });
            return row;
        });
    } catch (error) {
        console.error("Database query error:", error);
        throw error;
    }
}