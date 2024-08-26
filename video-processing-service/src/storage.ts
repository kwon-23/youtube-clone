// This file's purpose:
// 1. All of the Google Cloud Service (GCS) file interactions
// 2. All of the local file interactions

import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

// Need to be globally unique
const rawVideoBucketName = "bk-yt-raw-videos-382";
const processedVideoBucketName = "bk-yt-processed-videos-382";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/**
 * Creates the local directories for raw and processed videos
 */
export function setupDirectories(){
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * @param rawVideoName - The name of the file to convert from
 * @param processedVideoName - The name of the file to convert to
 * @returns - A promise that resolves when the video has been converted
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        // If ffmpeg is not found, or some other ffmpeg related error occurs, try
        // uncommenting this initiating code in the index.ts file
        /*const ffmpegStatic = require('ffmpeg-static');
        const ffmpeg = require('fluent-ffmpeg');
        ffmpeg.setFfmpegPath(ffmpegStatic);*/

        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
            .outputOptions("-vf", "scale=-1:360") // 360p
            .on("end", function () {
                console.log("Processing finished successfully");
                resolve();
            })
            .on("error", function (err: any) {
                console.log("An error occurred: " + err.message);
                reject(err);
            })
            .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

/**
 * @param fileName - The name of the file to be downloaded from the
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder
 * @returns A promise that resolves when the file has been downloaded
 */
export async function downloadRawVideo(fileName: string){
    // The await blocks any code from running after the specified line until the  
    // command has completed due to the asynchronous nature of the command
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({ destination: `${localRawVideoPath}/${fileName}` });

    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to 
        ${localRawVideoPath}/${fileName}.`
    );
}

/**
 * @param fileName - The name of the file to upload from the
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string){
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`,{
        destination: fileName
    });
    console.log(`${localProcessedVideoPath}/${fileName} uploaded to gs://
        ${processedVideoBucketName}/${fileName}.`)

    await bucket.file(fileName).makePublic();
}


/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */
export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}
  
  
/**
* @param fileName - The name of the file to delete from the
* {@link localProcessedVideoPath} folder.
* @returns A promise that resolves when the file has been deleted.
* 
*/
export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}




/**
 * @param filePath - The path of the file to delete
 * @returns A promise that resolves when the file has been deleted
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}.`);
                    resolve();
                }
            })
        } else {
            console.log(`File not found at ${filePath}, skipping the delete.`);
            // Reject or resolve up for personal preference
            resolve();
        }
    });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check
 */
function ensureDirectoryExistence(dirPath: string) {
    // Either the directory exists, or it is created
    if (!fs.existsSync(dirPath)) {
        // The recursive:true enables creating nested directories
        fs.mkdirSync(dirPath, {recursive: true});
        console.log(`Directory created at ${dirPath}`);
    }
}