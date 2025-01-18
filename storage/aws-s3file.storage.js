import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})

async function getObjectURL(key) {
    const command = new GetObjectCommand({
        Bucket: "my-bucket-17-01-2025",
        Key: key,
    });
    const url = await getSignedUrl(S3client, command);
    return url;
}

async function init() {
    console.log("URL for abhishek21.jpg", await getObjectURL("abhishek21.jpg"))
}

init();