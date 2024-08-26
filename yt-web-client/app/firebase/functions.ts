import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl');
const getVideosFunction = httpsCallable(functions, 'getVideos');

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: 'processing' | 'processed',
  title?: string,
  description?: string  
}

export async function uploadVideo(file: File) {

  const response: any = await generateUploadUrl({
    fileExtension: file.name.split('.').pop()
  });

  // Upload the file via the signed URL
  // The question mark is an indication to stop the command if the preceding variable
  // is undefined (so in this case, if either response or response.data are undefined)
  const uploadResult = await fetch(response?.data?.url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  });

  return uploadResult;
}

export async function getVideos() {
  const response: any = await getVideosFunction();
  return response.data as Video[];
}