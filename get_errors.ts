import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

async function run() {
  const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
  const projectId = config.projectId;
  
  const app = initializeApp({ projectId });
  const db = getFirestore(app, 'ai-studio-53e6bc08-2f74-4f5e-816d-59b2e44f3829');
  const snapshot = await db.collection('email_errors').get();
  
  const errors = [];
  snapshot.forEach(doc => {
    errors.push({ id: doc.id, ...doc.data() });
  });
  console.log(JSON.stringify(errors, null, 2));
}
run().catch(console.error);
