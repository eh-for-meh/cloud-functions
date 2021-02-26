import * as admin from "firebase-admin";

export const generateDealNotification = (
  title: string,
  body: string,
  imageURL: string
): admin.messaging.MessagingPayload => {
  return {
    data: {
      ["attachment-url"]: imageURL
    },
    notification: {
      content_available: "true",
      title,
      body,
      mutable_content: "true"
    }
  };
};

export const generateNewDealNotificationPayload = (
  name: string,
  imageURL: string
): admin.messaging.MessagingPayload => {
  return generateDealNotification("Check out this new deal!", name, imageURL);
};

export const generateDealSoldOutNotification = (
  name: string,
  imageURL: string
): admin.messaging.MessagingPayload => {
  return generateDealNotification(
    "The current deal has sold out!",
    `There are no more ${name} left`,
    imageURL
  );
};

export const generateItemSoldOutNotification = (
  name: string,
  imageURL: string
): admin.messaging.MessagingPayload => {
  return generateDealNotification(
    "One of the deal's items has sold out!",
    `Meh is running out of ${name}`,
    imageURL
  );
};

export const generatePayloadForNotification = (
  generator: (
    name: string,
    imageURL: string
  ) => admin.messaging.MessagingPayload,
  title?: string,
  imageURL?: string
): admin.messaging.MessagingPayload | undefined => {
  if (title && imageURL) {
    const secureImageURL = imageURL.replace("http://", "https://");
    return generator(title, secureImageURL);
  }
  return;
};

export const getNotificationTokensForPath = (
  database: admin.database.Database,
  path: string
): Promise<Array<string>> => {
  return new Promise((resolve, reject) => {
    database
      .ref(path)
      .once("value")
      .then((snapshot: admin.database.DataSnapshot) => {
        const tokens: Array<string> = [];
        snapshot.forEach((childSnapshot: admin.database.DataSnapshot) => {
          if (
            childSnapshot.key &&
            childSnapshot.val() &&
            childSnapshot.val() === true
          ) {
            tokens.push(childSnapshot.key);
          }
        });
        resolve(tokens);
      })
      .catch(reject);
  });
};

export const sendNotification = (
  messaging: admin.messaging.Messaging,
  tokens: Array<string>,
  payload: admin.messaging.MessagingPayload
): Promise<boolean> => {
  return messaging
    .sendToDevice(tokens, payload)
    .then((response: admin.messaging.MessagingDevicesResponse) => {
      console.log(
        `
          Success Count: ${response.successCount}
          Failure Count: ${response.failureCount}
        `
      );
      return true;
    })
    .catch((err: Error) => {
      throw err;
    });
};
