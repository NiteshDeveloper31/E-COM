import mongoose from "mongoose";

const uris = [
  "mongodb+srv://np370768_db_user:M30vBFDG7c0gnaKi@cluster0.einrbrq.mongodb.net/test?retryWrites=true&w=majority",
  "mongodb+srv://NiteshDeveloper31:NiteshDeveloper31@cluster0.einrbrq.mongodb.net/test?retryWrites=true&w=majority",
  "mongodb+srv://NiteshDeveloper31:Nitesh%402005@cluster0.einrbrq.mongodb.net/test?retryWrites=true&w=majority",
  "mongodb+srv://np370768_db_user:Nitesh2005@cluster0.einrbrq.mongodb.net/test?retryWrites=true&w=majority"
];

for (const uri of uris) {
  try {
    console.log("Trying:", uri.split("@")[0]);
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log("SUCCESS! Connected to host:", conn.connection.host);
    process.exit(0);
  } catch (err) {
    console.log("Failed:", err.message);
    await mongoose.disconnect();
  }
}
process.exit(1);
