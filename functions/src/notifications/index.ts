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
      utils
        .getNotificationTokensForPath(database, "notifications")
        .then((tokens: Array<string>) => {
          let title: string | undefined = after.title;
          let imageURL: string | undefined = (after.photos || [undefined])[0];
          if (title && imageURL) {
            let secureImageURL = imageURL.replace("http://", "https://");
            let payload: admin.messaging.MessagingPayload = utils.generateDealSoldOutNotification(
              title,
              secureImageURL
            );
            utils.sendNotification(messaging, tokens, payload);
          } else {
            throw new Error("Error parsing deal title/imageURL!");
          }
        });
    } else if (itemHasSoldOut) {
      utils
        .getNotificationTokensForPath(database, "notifications")
        .then((tokens: Array<string>) => {
          let title: string | undefined = after.title;
          let imageURL: string | undefined = (after.photos || [undefined])[0];
          if (title && imageURL) {
            let secureImageURL = imageURL.replace("http://", "https://");
            let payload: admin.messaging.MessagingPayload = utils.generateItemSoldOutNotification(
              title,
              secureImageURL
            );
            utils.sendNotification(messaging, tokens, payload);
          } else {
            throw new Error("Error parsing deal title/imageURL!");
          }
        });
    }
  } else {
    utils
      .getNotificationTokensForPath(database, "notifications")
      .then((tokens: Array<string>) => {
        let title: string | undefined = after.title;
        let imageURL: string | undefined = (after.photos || [undefined])[0];
        if (title && imageURL) {
          let secureImageURL = imageURL.replace("http://", "https://");
          let payload: admin.messaging.MessagingPayload = utils.generateNewDealNotificationPayload(
            title,
            secureImageURL
          );
          utils.sendNotification(messaging, tokens, payload);
        } else {
          throw new Error("Error parsing deal title/imageURL!");
        }
      });
  }
};
