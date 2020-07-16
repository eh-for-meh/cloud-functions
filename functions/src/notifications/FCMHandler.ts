import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export type FCMMethod = "POST" | "DELETE";

export interface CallData {
  method: FCMMethod;
  token: string;
}

export const handler = async (
  data: CallData,
  database: admin.database.Database
) => {
  const { method = "INVALID", token = "" } = data;
  if (!["POST", "DELETE"].includes(method)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid method!");
  } else if (token.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "No token provided!"
    );
  }
  switch (method) {
    case "POST":
      await database.ref(`notifications/${token}`).set(true);
      break;
    case "DELETE":
      await database.ref(`notifications/${token}`).remove();
      break;
  }
};
