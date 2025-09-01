import dotenv from 'dotenv';
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectsCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3';

dotenv.config();
console.log('Checking AWS configuration...');

const DynamoClient = new DynamoDBClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const s3 = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const ddbDocClient = DynamoDBDocumentClient.from(DynamoClient);

export async function getClients(userId) {
    if (userId) {
        try {
            const result = await ddbDocClient.send(new QueryCommand({
                TableName: process.env.AWS_DynamoDB_TableName,
                KeyConditionExpression: "userId = :uid",
                ExpressionAttributeValues: {
                    ":uid": userId,
                },
                ProjectionExpression: "firstName, lastName, dob, clientKey"
            }));
            return result.Items;
        }
        catch (err) {
            console.log("Error getting clients ", err);
            return [];
        }
    }
}

export async function uploadClientDocument(userId, body) {
    const { note, clientData, date } = body;
    if (userId && note && clientData && date && isValidDate(date)) {
        userId = String(userId);
        const { firstName, lastName, dob } = clientData;
        const clientKey = `CLIENT#${sanitize(firstName)}-${sanitize(lastName)}-${sanitize(dob)}`;
        const filename = `Date${safeName(date)}-${uuidv4()}.txt`;
        const s3Key = `${userId}/${filename}`;
        const rawDate = new Date(date);
        const formattedDate = rawDate.toLocaleDateString('en-US');

        try {
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BucketName,
                Key: s3Key,
                Body: note,
                ContentType: "text/plain",
            });
            const results = await s3.send(command);
            if (results.$metadata && results.$metadata.httpStatusCode === 200) {
                console.log("Uploaded note to S3:");

                // Check if the client already exists in DynamoDB
                const clientResult = await ddbDocClient.send(new GetCommand({
                    TableName: process.env.AWS_DynamoDB_TableName,
                    Key: {
                        userId,
                        clientKey
                    }
                }));

                if (clientResult.Item) {
                    console.log("Client found. Creating new session entry...");
                    const existingFiles = clientResult.Item.sessionFiles || [];
                    existingFiles.push({
                        s3Key,
                        date: formattedDate
                    });
                    await ddbDocClient.send(new UpdateCommand({
                        TableName: process.env.AWS_DynamoDB_TableName,
                        Key: {
                            userId,
                            clientKey
                        },
                        UpdateExpression: 'SET sessionFiles = :updatedFiles',
                        ExpressionAttributeValues: {
                            ':updatedFiles': existingFiles
                        }
                    }));
                }
                else {
                    // If no record found, create a new client entry
                    console.log("Client not found. Creating new client entry...");
                    await ddbDocClient.send(new PutCommand({
                        TableName: process.env.AWS_DynamoDB_TableName,
                        Item: {
                            userId,
                            clientKey,
                            firstName,
                            lastName,
                            dob,
                            createdAt: new Date().toISOString(),
                            sessionFiles: [
                                {
                                    s3Key,
                                    date: formattedDate
                                }
                            ]
                        }
                    }));
                }
                return true;
            }

        }
        catch (err) {
            console.log("Error uploading files ", err);
            return false;
        }
    }
    return false;
}

export async function getNotes(userId, clientKey) {
    let files = [];
    let clientInfo = {};

    if (userId && clientKey) {
        try {
            const clientResult = await ddbDocClient.send(new GetCommand({
                TableName: process.env.AWS_DynamoDB_TableName,
                Key: {
                    userId,
                    clientKey
                }
            }));
            if (clientResult.Item) {
                clientInfo = {
                    firstName: clientResult.Item.firstName || '',
                    lastName: clientResult.Item.lastName || '',
                    dob: clientResult.Item.dob || ''
                };

                const existingFiles = clientResult.Item.sessionFiles || [];
                for (const file of existingFiles) {

                    const s3Response = await s3.send(new GetObjectCommand({
                        Bucket: process.env.AWS_S3_BucketName,
                        Key: file.s3Key
                    }));

                    const fileContent = await streamToString(s3Response?.Body);
                    console.log("File content:", fileContent);

                    files.push({
                        key: file.s3Key,
                        date: file.date,
                        content: fileContent
                    });
                }
            }
        }
        catch (err) {
            console.error("Error getting file from S3:", err);
            return { clientInfo: {}, files: [] };
        }
    }
    return { clientInfo, files };
}

export async function updateNote(userId, s3Key, content) {
    const [keyUserId, fileName] = s3Key.split("/", 2);

    try {
        if (keyUserId !== userId) {
            throw new Error("Unauthorized: S3 key does not belong to this user");
        }
        const putCommand = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BucketName,
            Key: s3Key,
            Body: content,
            ContentType: "text/plain"
        });

        const response = await s3.send(putCommand);

        if (response.$metadata && response.$metadata.httpStatusCode === 200) {
            console.log("Note updated successfully");
            return true;
        } else {
            console.error("S3 responded with unexpected status", response);
            return false;
        }

    } catch (err) {
        console.error("Failed to update note:", err);
        return false;
    }
}

export async function DeleteAccount(userId) {
    let message = "Failed to Delete Account";
    let success = false;

    if (!userId) {
        console.error("No userId provided.");
        return false;
    }

    try {
        const result = await ddbDocClient.send(new QueryCommand({
            TableName: process.env.AWS_DynamoDB_TableName,
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: {
                ":uid": userId
            }
        }));

        const clients = result.Items || [];

        for (const client of clients) {
            const deleted = await DeleteClient(userId, client.clientKey);
            if (!deleted) {
                console.warn(`Failed to delete client: ${client.clientKey}`);
            }
        }
        success = true;
        console.log(`All clients deleted for user: ${userId}`);
    } catch (err) {
        console.error(`${message}:`, err);
    }

    return success;
}
export async function editClient(userId, clientKey, first, last, DOB) {
    if (!userId || !clientKey || !first || !last || !DOB) {
        console.warn("Missing credentials.");
        return { success: false, message: "Missing credentials or update data." };
    }
    try {
        const result = await ddbDocClient.send(new UpdateCommand({
            TableName: process.env.AWS_DynamoDB_TableName,
            Key: { userId, clientKey },
            UpdateExpression: "SET firstName = :first, lastName = :last, dob = :dob",
            ExpressionAttributeValues: {
                ":first": first,
                ":last": last,
                ":dob": DOB,
            }
        }));
        console.log('Client updated successfully.');
        return { success: true, message: "Client updated successfully." };
    } catch (err) {
        console.error(`Edit Client error for ${clientKey}:`, err);
        return { success: false, message: "Edit Client Error" };
    }
}
export async function editNoteDate(userId, clientKey, noteS3Key, newDate) {

    if (!userId || !clientKey || !newDate || !noteS3Key || !isValidDate(newDate)) {
        return { success: false, message: "Missing credentials or update data." };
    }

    try {
        const clientResult = await ddbDocClient.send(new GetCommand({
            TableName: process.env.AWS_DynamoDB_TableName,
            Key: { userId, clientKey }
        }));

        if (!clientResult.Item) {
            console.warn(`editNoteDate: Client with key ${clientKey} not found in DynamoDB.`);
            return { success: false, message: "Client not found." };
        }

        const files = clientResult.Item.sessionFiles || [];
        const fileIndex = files.findIndex(f => f.s3Key === noteS3Key);

        if (fileIndex === -1) {
            console.warn(`editNoteDate: Note with s3Key ${noteS3Key} not found under client ${clientKey}.`);
            return { success: false, message: "Note not found under client." };
        }

       const result = await ddbDocClient.send(new UpdateCommand({
    TableName: process.env.AWS_DynamoDB_TableName,
    Key: { userId, clientKey },
    UpdateExpression: `SET sessionFiles[${fileIndex}].#d = :newDate`,
    ExpressionAttributeNames: {
        "#d": "date"
    },
    ExpressionAttributeValues: {
        ":newDate": newDate
    }
}));
        return { success: true, message: "Note date updated successfully." };

    } catch (err) {
        console.error(`editNoteDate: Error occurred for clientKey ${clientKey}:`, err);
        return { success: false, message: "Edit Note Date Error" };
    }
}

export async function DeleteClient(userId, clientKey) {
    if (!userId || !clientKey) {
        console.warn("Missing userId or clientKey.");
        return { success: false, message: "Missing credentials." };
    }

    try {
        const clientResult = await ddbDocClient.send(new GetCommand({
            TableName: process.env.AWS_DynamoDB_TableName,
            Key: { userId, clientKey }
        }));

        if (!clientResult.Item) {
            console.warn(`DeleteClient: Client not found`);
            return { success: false, message: "Client not found" };
        }

        const files = clientResult.Item.sessionFiles || [];
        for (const file of files) {
            const deleted = await DeleteNote(userId, clientKey, file.s3Key);

            // Important: DeleteNote returns { success, message } — check result:
            if (!deleted.success) {
                console.warn(`DeleteClient: Failed to delete note ${file.s3Key}`);
            }
        }

        console.log(`DeleteClient: Deleted all notes for client ${clientKey}`);

        return { success: true, message: "Client and notes deleted" };
    } catch (err) {
        console.error(`DeleteClient error for ${clientKey}:`, err);
        return { success: false, message: "DeleteClient Error" };
    }
}

export async function DeleteNote(userId, clientKey, noteKey) {
    if (!noteKey || !userId || !clientKey) {
        console.warn("DeleteNote: Missing required parameters.");
        return { success: false, message: "Missing credentials" };
    }

    try {
        const clientResult = await ddbDocClient.send(new GetCommand({
            TableName: process.env.AWS_DynamoDB_TableName,
            Key: { userId, clientKey }
        }));
        if (!clientResult.Item) {
            console.warn(`DeleteNote: Client not found.`);
            return { success: false, message: "DeleteNote: Client not found." };
        }
        const files = clientResult.Item.sessionFiles || [];
        const fileMatch = files.find(f => f.s3Key === noteKey);

        if (!fileMatch) {
            console.warn(`DeleteNote: Note key ${noteKey} not found under client ${clientKey}`);
            return { success: false, message: "DeleteNote: Note not found under client" };
        }
        await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BucketName,
                Key: noteKey
            })
        );
        const remainingFiles = files.filter(f => f.s3Key !== noteKey);

        if (remainingFiles.length === 0) {
            await ddbDocClient.send(new DeleteCommand({
                TableName: process.env.AWS_DynamoDB_TableName,
                Key: { userId, clientKey }
            }));
            console.log(`DeleteNote: Deleted empty client ${clientKey}.`);

            return { success: true, message: "Note and empty client deleted" };
        } else {
            await ddbDocClient.send(new UpdateCommand({
                TableName: process.env.AWS_DynamoDB_TableName,
                Key: { userId, clientKey },
                UpdateExpression: "SET sessionFiles = :newFiles",
                ExpressionAttributeValues: {
                    ":newFiles": remainingFiles
                }
            }));

            return { success: true, message: "Note deleted" };
        }

    } catch (err) {
        console.error(`DeleteNote error for noteKey ${noteKey}:`, err);
        return { success: false, message: "DeleteNote error" };
    }
}



const safeName = (str) => str.replace(/[^a-zA-Z0-9_-]/g, '');
const sanitize = str => String(str).replace(/[^a-zA-Z0-9_-]/g, '');
const isValidDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};


function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
}

