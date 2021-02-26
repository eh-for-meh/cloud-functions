import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { sendDealNotification } from './notifications';
import * as FCMHandler from './notifications/FCMHandler';
import { checkMehForDealUpdate } from './cron-jobs';

admin.initializeApp(functions.config().firebase);

exports.handleFCM = functions.https.onCall(
  (data: FCMHandler.CallData, _: functions.https.CallableContext) => {
    return FCMHandler.handler(data, admin.database());
  }
);

exports.updateDeal = functions.pubsub
  .schedule('every 5 mins')
  .timeZone('America/New_York')
  .onRun((_: functions.EventContext) => {
    return checkMehForDealUpdate(admin.database());
  });

exports.sendDealNotification = functions.database
  .ref('currentDeal/deal')
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
