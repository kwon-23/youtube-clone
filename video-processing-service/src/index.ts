import express from "express";
// wrapper for CLI tool
import ffmpeg from "fluent-ffmpeg";
import { convertVideo, 
        deleteProcessedVideo, 
        deleteRawVideo, 
        downloadRawVideo, 
        setupDirectories, 
        uploadProcessedVideo 
    } from "./storage";
import { isVideoNew, setVideo } from "./firestore";

setupDirectories();

const app = express();
app.use(express.json());

/*Creating simple root route, and each end point has a request and a response
app.get("/", (req, res) => {
    // http get endpoint
    res.send("hello world"); 
});*/

app.post("/process-video", async (req, res) => {
    // Get the bucket and filename from the Cloud Pub/Sub message (message cue)
    // This endpoint is notified via the Pub/Sub message every time a file is 
    // uploaded to the rawVideoBucket
    // Refer to documentation for code for more information/how to write/setup
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload recieved.');
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send('Bad Request: missing filename.');
    }

    const inputFileName = data.name; // In format of <UID>-<DATE>.<EXTENSION>
    const outputFileName = `processed-${inputFileName}`;
    const videoId = inputFileName.split('.')[0];

    if (!isVideoNew(videoId)) {
      return res.status(400).send('Bad Request: video already processing or processed.');
    } else {
      await setVideo(videoId, {
        id: videoId,
        uid: videoId.split('-')[0],
        status: 'processing'
      });
    }

    // For Downloading the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);

    // Convert video to 360p
    try {  
        await convertVideo(inputFileName, outputFileName);
    } catch (err) {
        // To clean up after fail
        // Do them both asynchronously at the same time
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
        
        console.error(err);
        return res.status(500).send('Internal Server Error: video processing failed.');
    }


    // Upload the processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);

    // Update video status to processed
    await setVideo(videoId, {
        status: 'processed',
        filename: outputFileName,
    });

    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);

    return res.status(200).send('Processeing finished successfully.');

});

// Standard way to provide the port at runtime or set to 3000
const port = process.env.PORT || 3000;
// Used to start a server
app.listen(port, () =>{
    console.log(
        `Video processing service listening at http://localhost:${port}`);
});
