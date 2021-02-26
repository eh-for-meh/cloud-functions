import { Change, EventContext } from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as utils from './utils';

export interface Deal extends admin.database.DataSnapshot {
  id?: string;
  items?: Array<any>;
  launches?: Array<any>;
  photos?: Array<string>;
  soldOutAt?: string;
  title?: string;
}

export const sendDealNotification = async (
  database: admin.database.Database,
  messaging: admin.messaging.Messaging,
  change: Change<admin.database.DataSnapshot>,
  context: EventContext
): Promise<boolean> => {
  const before: Deal = change.before.val();
  const after: Deal = change.after.val();
  const title: string | undefined = after.title;
  const imageURL: string | undefined = (after.photos || [undefined])[0];
  let payload: admin.messaging.MessagingPayload | undefined = undefined;
  if (before.id === after.id) {
    const justSoldOut: boolean = Boolean(!before.soldOutAt && after.soldOutAt);
    const itemHasSoldOut: boolean = Boolean(
      (!before.launches && after.launches) ||
        (before.launches &&
          after.launches &&
          before.launches.length !== after.launches.length)
    );
    const allItemsHaveSoldOut: boolean = Boolean(
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
    } else {
      console.log('Deal has not updated or sold out.');
      return true;
    }
  } else {
    payload = utils.generatePayloadForNotification(
      utils.generateNewDealNotificationPayload,
      title,
      imageURL
    );
  }
  if (payload) {
    const tokens = await utils.getNotificationTokensForPath(
      database,
      'notifications'
    );
    return await utils.sendNotification(messaging, tokens, payload);
  } else {
    throw new Error('Unable to determine payload type!');
  }
};
