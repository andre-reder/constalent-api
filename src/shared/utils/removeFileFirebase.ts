import { deleteObject, getStorage, ref } from 'firebase/storage';

export default async function removeFileFirebase(fileUrl: string) {
  const hasOAtUrl = fileUrl.includes('appspot.com/o/');
  const pathToFile = hasOAtUrl
    ? fileUrl.split('appspot.com/o/')[1].split('?')[0]
    : fileUrl.split('appspot.com/')[1].split('?')[0];
  const pathToFileSplit = pathToFile.split('/');

  const fileFileName = decodeURIComponent(pathToFileSplit.pop());
  const pathToFileFolder = pathToFileSplit.join('/');

  const fullPathTofileFile = `${pathToFileFolder}/${fileFileName}`;

  const storage = getStorage();
  const fileRef = ref(storage, fullPathTofileFile);

  await deleteObject(fileRef);
}
