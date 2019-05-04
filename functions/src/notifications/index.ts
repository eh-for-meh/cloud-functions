import { Change, EventContext } from "firebase-functions";
import * as admin from "firebase-admin";
import * as utils from "./utils";

export interface Deal extends admin.database.DataSnapshot {
  id?: string;
  items?: Array<any>;
  launches?: Array<any>;
  photos?: Array<string>;
  soldOutAt?: string;
  title?: string;
}

export const sendDealNotification = (
  database: admin.database.Database,
  messaging: admin.messaging.Messaging,
  change: Change<admin.database.DataSnapshot>,
  context: EventContext
) => {
  const before: Deal = change.before.val();
  const after: Deal = change.after.val();
  let title: string | undefined = after.title;
  let imageURL: string | undefined = (after.photos || [undefined])[0];
  let payload: admin.messaging.MessagingPayload | undefined = undefined;
  if (before.id === after.id) {
    let justSoldOut: boolean = Boolean(!before.soldOutAt && after.soldOutAt);
    let itemHasSoldOut: boolean = Boolean(
      (!before.launches && after.launches) ||
        (before.launches &&
          after.launches &&
          before.launches.length !== after.launches.length)
    );
    let allItemsHaveSoldOut: boolean = Boolean(
      before.launches &&
        before.items &&
        before.launches.length !== before.items.length &&
        after.launches &&
        after.items &&
        after.launches.length === after.items.length
    );
    if (justSoldOut || allItemsHaveSoldOut) {
      payload = utils.generatePayloadForNotification(
        utils.generateDealSoldOutNotification,
        title,
        imageURL
      );
    } else if (itemHasSoldOut) {
      payload = utils.generatePayloadForNotification(
        utils.generateDealSoldOutNotification,
        title,
        imageURL
      );
    }
  } else {
    payload = utils.generatePayloadForNotification(
      utils.generateNewDealNotificationPayload,
      title,
      imageURL
    );
  }
  if (payload) {
    utils
      .getNotificationTokensForPath(database, "notifications")
      .then((tokens: Array<string>) => {
        utils.sendNotification(messaging, tokens, payload!);
      });
  }
};
