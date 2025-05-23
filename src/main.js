const sdk = require("node-appwrite");

/* module.exports = async function ({ req, res }) {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)
    .setSelfSigned(true);

  const database = new sdk.Databases(client);
  const account = new sdk.Account(client);

  console.log("Req body", req.bodyJson);
  console.log("req", req);

  const { email, otp } = req.bodyJson;

  const documents = await database.listDocuments(
    process.env.DATABASE_ID,
    process.env.COLLECTION_ID,
    [sdk.Query.equal("email", email), sdk.Query.equal("otp", otp)]
  );

  if (documents.total === 0) {
    return res.json({ success: false, message: "Invalid OTP" });
  }

  const doc = documents.documents[0];
  const now = new Date().toISOString();
  if (now > doc.expireAt) {
    return res.json({ success: false, message: "OTP expired" });
  }

  await database.deleteDocument(
    process.env.DATABASE_ID,
    process.env.COLLECTION_ID,
    doc.$id
  );

  let user;
  try {
    user = await account.createEmailSession(email, otp);
  } catch (err) {
    user = await account.create("unique()", email, otp);
    await account.createEmailSession(email, otp);
  }

  return res.json({ success: true, message: "User logged in" });
}; */

module.exports = async function ({ req, res }) {
  const { email, otp } = req.bodyJson;

  const response = await fetch(
    `${process.env.APPWRITE_ENDPOINT}/databases/${process.env.DATABASE_ID}/collections/${process.env.COLLECTION_ID}/documents`,
    {
      method: "GET",
      headers: {
        "X-Appwrite-Project": process.env.APPWRITE_PROJECT_ID,
        "X-Appwrite-Key": process.env.APPWRITE_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  const doc = data.documents.find((d) => d.email === email && d.otp === otp);
  if (!doc) {
    return res.send({ success: false, message: "Invalid OTP" });
  }

  const now = new Date().toISOString();
  if (now > doc.expireAt) {
    return res.send({ success: false, message: "OTP expired" });
  }

  await fetch(
    `${process.env.APPWRITE_ENDPOINT}/databases/${process.env.DATABASE_ID}/collections/${process.env.COLLECTION_ID}/documents/${doc.$id}`,
    {
      method: "DELETE",
      headers: {
        "X-Appwrite-Project": process.env.APPWRITE_PROJECT_ID,
        "X-Appwrite-Key": process.env.APPWRITE_API_KEY,
      },
    }
  );

  return res.send({ success: true, message: "User logged in" });
};
