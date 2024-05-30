import "dotenv/config";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendMail(message) {
    return sgMail.send(message)
}
export default { sendMail }