import dotenv from 'dotenv';
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectsCommand
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
    if (userId) {
        try {   // getting all clients
            const result = await ddbDocClient.send(new QueryCommand({
                TableName: process.env.AWS_DynamoDB_TableName,
                KeyConditionExpression: "userId = :uid",
                ExpressionAttributeValues: {
                    ":uid": userId
                }
            }));

            const clients = result.Items;
            const allS3Keys = [];

            for (const client of clients) {         // finding all sessionFiles
                if (client.sessionFiles && Array.isArray(client.sessionFiles)) {
                    for (const session of client.sessionFiles) {
                        if (session.s3Key) {
                            allS3Keys.push({ Key: session.s3Key });
                        }
                    }
                }
            }
            if (allS3Keys.length > 0) {
                const deleteResult = await s3.send(new DeleteObjectsCommand({
                    Bucket: process.env.AWS_S3_BucketName,
                    Delete: {
                        Objects: allS3Keys,
                        Quiet: false
                    }
                }));

                console.log("S3 deleted:", deleteResult);
            }
            for (const client of clients) {
                await ddbDocClient.send(new DeleteCommand({
                    TableName: process.env.AWS_DynamoDB_TableName,
                    Key: {
                        userId: userId,
                        clientKey: client.clientKey
                    }
                }));
            }
            success = true;
        }
        catch (err) {
            console.error(message);
            success = false;
        }
    }
    else {
        console.error(message);
        success = false;
    }
    return success;
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

