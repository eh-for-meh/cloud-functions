import * as admin from "firebase-admin";
import { fetchMehData } from "./utils";
import { APIData } from "../lib/meh";

export const checkMehForDealUpdate = async (
  database: admin.database.Database
): Promise<boolean> => {
  const data: APIData = await fetchMehData(database);
  if (data.deal && data.deal.id) {
    await database.ref("currentDeal").set(data);
    return true;
  }
  return false;
};
