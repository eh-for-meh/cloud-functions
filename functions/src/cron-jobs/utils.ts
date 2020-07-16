import * as admin from "firebase-admin";
import fetch from "node-fetch";
import { APIData } from "../lib/meh";

export const mehAPI = "https://api.meh.com/1/current.json";

export const getMehAPIKey = async (
  database: admin.database.Database
): Promise<string> => {
  const snapshot: admin.database.DataSnapshot = await database
    .ref("API_KEY")
    .once("value");
  if (snapshot.exists()) {
    return snapshot.val();
  }
  throw new Error("Unable to obtain API key!");
};

export const fetchMehData = async (
  database: admin.database.Database
): Promise<APIData> => {
  const apiKey = await getMehAPIKey(database);
  const response = await fetch(`${mehAPI}?apikey=${apiKey}`);
  if (response.ok) {
    return await response.json() as APIData;
  }
  throw new Error(`Unable to obtain meh data: ${response.status}.`);
};
