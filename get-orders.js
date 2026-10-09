const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, orderBy, limit, query } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, 'orders'), orderBy('date', 'desc'), limit(5));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`Order ${doc.id}: status=${data.status}, assaxResult=${JSON.stringify(data.assaxResult || data.hankGamesResult)}`);
  });
}
run();
