import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import { APIData } from '../lib/meh';

export const mehAPI = 'https://api.meh.com/1/current.json';

export const getMehAPIKey = async (
  database: admin.database.Database
): Promise<string> => {
  const snapshot: admin.database.DataSnapshot = await database
    .ref('API_KEY')
    .once('value');
  if (snapshot.exists()) {
    return snapshot.val();
  }
  throw new Error('Unable to obtain API key!');
};

export const fetchMehData = async (
  database: admin.database.Database
): Promise<APIData> => {
  const apiKey = await getMehAPIKey(database);
  const response = await fetch(`${mehAPI}?apikey=${apiKey}`);
  if (response.ok) {
    return (await response.json()) as APIData;
  }
  throw new Error(`Unable to obtain meh data: ${response.status}.`);
};

export const saveDealAsPreviousDeal = async (
  database: admin.database.Database
): Promise<void> => {
  const snapshot = await database.ref('currentDeal').once('value');
  const deal = snapshot.val() as APIData;
  if (deal.deal && deal.deal.id) {
    await database.ref(`previousDeal/${deal.deal.id}`).update(deal);
    const previousDealTimeSnapshot = await database
      .ref(`previousDeal/${deal.deal.id}/time`)
      .once('value');
    if (!previousDealTimeSnapshot.exists()) {
      const date = new Date();
      await Promise.all([
        database.ref(`previousDeal/${deal.deal.id}/time`).set(date.getTime()),
        database.ref(`previousDeal/${deal.deal.id}/date`).set({
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
        }),
      ]);
    }
  } else {
    throw new Error(
      'Unable to save deal as previous deal, missing deal or deal id data!'
    );
  }
};
