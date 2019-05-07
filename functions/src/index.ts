import * as functions from "firebase-functions";
import { Change, EventContext } from "firebase-functions";
import * as admin from "firebase-admin";

import { sendDealNotification } from "./notifications";
import { checkMehForDealUpdate } from "./cron-jobs";

admin.initializeApp(functions.config().firebase);

exports.updateItem = functions.https.onRequest(
  (request: functions.https.Request, response: functions.Response) => {
    return checkMehForDealUpdate(admin.database())
      .then(() => {
        response.sendStatus(200);
      })
      .catch((err: Error) => {
        console.error("Unexpected error:", err);
        response.sendStatus(500);
      });
  }
);

exports.sendDealNotification = functions.database
  .ref("currentDeal/deal")
  .onUpdate(
    (change: Change<admin.database.DataSnapshot>, context: EventContext) => {
      sendDealNotification(
        admin.database(),
        admin.messaging(),
        change,
        context
      );
    }
  );
