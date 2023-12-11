const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const handlebars = require('handlebars');
const os = require('os');
const path = require('path');
const fs = require('fs');
admin.initializeApp();

const CLIENT_ID = '1018301921500-htic816g4ouqkq5ce154h3n3njohnljc.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04e_lQ3r63v6DCgYIARAAGAQSNwF-L9IrwqYdR7yUJNG_4Aejy3o6g8OIDp7cjK9XXsSa0OzN7AkHzX9WX2IjXXnyrPDYF826ico'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

let senderMail;
let senderName;
let location, pincode, email, developer, project, phoneNumber, configuration;

async function sendMail() {
    try {
        const filePath = path.join(__dirname, './email.html');
        const source = fs.readFileSync(filePath, 'utf-8').toString();
        const template = handlebars.compile(source);


        const replacements = {
            name: senderName,
            email: senderMail,
            location, pincode, email, developer, project, phoneNumber, configuration,
        };
        const htmlToSend = template(replacements);

        const accessToken = await oAuth2Client.getAccessToken()

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'contact@gurunetwork.in',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        });
        const from = {
            name: 'Guru Network',
            address: 'contact@gurunetwork.in'
        }

        const mailOptions = {
            from,
            to: `${senderMail}`,
            subject: `Hi ${senderName}, Here is your Digital Parchi`,
            html: htmlToSend,
        }
        const result = await transporter.sendMail(mailOptions)
        return result;
    }
    catch (error) {
        return error
    }
}

exports.sendParchiEmail = functions.https.onRequest((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://gurunetwork.in');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true)
    senderName = req.body.name;
    senderMail = req.body.email;
    location = req.body.location;
    pincode = req.body.pincode;
    phoneNumber = req.body.phoneNumber;
    project = req.body.project;
    developer = req.body.developer;
    configuration = req.body.configuration;
    console.log('email = ',senderMail);
    sendMail()
        .then((result) => res.send(`sent mail`))
        .catch((error) => res.send('error'));
})