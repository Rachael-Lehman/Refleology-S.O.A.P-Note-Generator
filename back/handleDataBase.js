import dotenv from 'dotenv';
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
    S3Client,
    HeadBucketCommand,
    CreateBucketCommand,
    PutBucketCorsCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command
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
        const clientKey = `CLIENT#${firstName}-${lastName}-${dob}`;
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
            }

        }
        catch (err) {
            console.log("Error uploading files ", err);
            return;
        }
    }
}


const safeName = (str) => str.replace(/[^a-zA-Z0-9_-]/g, '');
const isValidDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};

