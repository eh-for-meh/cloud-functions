import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { sendDealNotification } from "./notifications";
import { checkMehForDealUpdate } from "./cron-jobs";

admin.initializeApp(functions.config().firebase);

exports.updateItem = functions.https.onRequest(
  (_: functions.https.Request, response: functions.Response) => {
    return checkMehForDealUpdate(admin.database())
      .then(() => response.sendStatus(200))
      .catch((err: Error) => {
        console.error("Unexpected error:", err);
        response.sendStatus(500);
      });
  }
);

exports.sendDealNotification = functions.database
  .ref("currentDeal/deal")
  .onUpdate(
    (
      change: functions.Change<admin.database.DataSnapshot>,
      context: functions.EventContext
    ) => {
      return sendDealNotification(
        admin.database(),
        admin.messaging(),
        change,
        context
      );
    }
  );
