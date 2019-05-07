import * as admin from "firebase-admin";
import { fetchMehData } from "./utils";
import { APIData } from "../lib/meh";

export const checkMehForDealUpdate = (
  database: admin.database.Database
): Promise<boolean> => {
  return fetchMehData(database)
    .then((data: APIData) => {
      if (data.deal && data.deal.id) {
        let id: string = data.deal.id;
        let date: Date = new Date();
        return database
          .ref(`previousDeal/${id}`)
          .update(data)
          .then(() => {
            return database
              .ref(`previousDeal/${id}`)
              .update({
                time: date.getTime(),
                day: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear()
              })
              .then(() => {
                return database
                  .ref(`currentDeal`)
                  .set(data)
                  .then(() => {
                    return true;
                  })
                  .catch((err: Error) => {
                    console.error("Unable to update current deal!");
                    throw err;
                  });
              })
              .catch((err: Error) => {
                console.error("Unable to update previous deal!");
                throw err;
              });
          })
          .catch((err: Error) => {
            throw err;
          });
      } else {
        console.error("'unable to determine current deal id!");
        throw new Error("Unable to determine current deal id!");
      }
    })
    .catch((err: Error) => {
      console.error("Error fetching meh data!");
      throw err;
    });
};
