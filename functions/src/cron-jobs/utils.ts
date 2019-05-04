import * as admin from "firebase-admin";
import axios, { AxiosResponse } from "axios";
import { APIData } from "../lib/Meh";

export const mehAPI = "https://api.meh.com/1/current.json";

export const getMehAPIKey = (
  database: admin.database.Database
): Promise<string> => {
  return new Promise((resolve, reject) => {
    database
      .ref("API_KEY")
      .once("value", (snapshot: admin.database.DataSnapshot) => {
        if (snapshot.val()) resolve(snapshot.val());
        else reject(new Error("Unable to obtain API key!"));
      });
  });
};

export const fetchMehData = (
  database: admin.database.Database
): Promise<APIData> => {
  return new Promise((resolve, reject) => {
    getMehAPIKey(database)
      .then((API_KEY: string) => {
        axios({
          url: `${mehAPI}?apikey=${API_KEY}`,
          method: "GET"
        }).then((res: AxiosResponse) => {
          resolve(res.data as APIData);
        });
      })
      .catch(reject);
  });
};
