// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// console.log(accountSid,authToken)
// const client = require("twilio")(accountSid, authToken);
const client = require("twilio")(
  "ACe673369bdbe2edccdb82293a153dbaf8",
  "8fc82c23562eb8e5ec9b195422ef8314"
);

function message(messageBody, to) {
  console.log("in message ");
  client.messages
    .create({
      body: messageBody,
      from: "+17572804619",
      //   to: "+923056320218",
      to,
    })
    // .then((message) => console.log(message.sid))
    .then(console.log(`message sent....`))
    .catch((error) => console.log(error));
}
module.exports = { message };
