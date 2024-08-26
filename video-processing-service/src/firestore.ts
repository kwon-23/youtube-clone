import { credential } from "firebase-admin";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";

initializeApp({credential: credential.applicationDefault()});

const firestore = new Firestore();

// Note: This requires setting an env variable in Cloud Run
/** if (process.env.NODE_ENV !== 'production') {
  firestore.settings({
      host: "localhost:8080", // Default port for Firestore emulator
      ssl: false
  });
} */

const videoCollectionId = 'videos';

// What documents in firestore will look like (like formatting)
export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: 'processing' | 'processed',
  title?: string,
  description?: string
}

/**
 * Given a video ID, fetch from Firestore
 * @param videoId 
 * @returns a firebase document containing the video
 */
async function getVideo(videoId: string) {
  // Must be await since the snapshot must be created in order to return data
  const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get();
  return (snapshot.data() as Video) ?? {};
}

/**
 * Writing to firestore
 * @param videoId 
 * @param video 
 * @returns resolved promise of data uploaded to firestore
 */
export function setVideo(videoId: string, video: Video) {
  // The merge:true is set so that partial information to update will not completely
  // overwrite the potentially already existing data/video
  return firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .set(video, { merge: true })
}

/**
 * Determine if a video is new
 * @param videoId 
 * @returns 
 */
export async function isVideoNew(videoId: string) {
  const video = await getVideo(videoId);
  return video?.status === undefined;
}
