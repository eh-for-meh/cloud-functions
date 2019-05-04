import * as functions from "firebase-functions";
import { Change, EventContext } from "firebase-functions";
import * as admin from "firebase-admin";

import { sendDealNotification } from "./notifications";

admin.initializeApp(functions.config().firebase);

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
