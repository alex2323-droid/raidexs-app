import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'ai-studio-53e6bc08-2f74-4f5e-816d-59b2e44f3829');

async function run() {
  const querySnapshot = await getDocs(collection(db, 'email_errors'));
  const errors = [];
  querySnapshot.forEach((doc) => {
    errors.push({ id: doc.id, ...doc.data() });
  });
  console.log(JSON.stringify(errors, null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
