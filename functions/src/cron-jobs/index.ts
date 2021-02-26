import * as admin from 'firebase-admin';
import { fetchMehData, saveDealAsPreviousDeal } from './utils';
import { APIData } from '../lib/meh';

export const checkMehForDealUpdate = async (
  database: admin.database.Database
): Promise<boolean> => {
  const results = await Promise.all([
    fetchMehData(database),
    saveDealAsPreviousDeal(database),
  ]);
  const data: APIData = results[0];
  if (data.deal && data.deal.id) {
    await database.ref('currentDeal').set(data);
    return true;
  }
  return false;
};
