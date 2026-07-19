const express = require('express');
const app = express();
app.use(express.json());

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Render मध्ये Environment Variable सेट करू

app.post('/webhook', async (req, res) => {
    const payload = req.body;
    // Razorpay Webhook signature verification सुरक्षिततेसाठी करू शकता (पर्यायी)
    if (payload.event === 'payment.captured') {
        const customerEmail = payload.payload.payment.entity.email;
        const msg = {
            to: customerEmail,
            from: 'yourverified@domain.com', // SendGrid मध्ये verify केलेला ईमेल
            subject: 'तुमचे पुस्तक - धन्यवाद!',
            text: 'खालील लिंकवरून तुमचे पुस्तक डाउनलोड करा.',
            attachments: [
                {
                    content: Buffer.from('...').toString('base64'), // इथे तुम्ही पुस्तकाची PDF बेस६४ मध्ये घालू शकता किंवा स्टोरेज लिंक वापरू शकता.
                    filename: 'book.pdf',
                    type: 'application/pdf',
                    disposition: 'attachment'
                }
            ]
        };
        try {
            await sgMail.send(msg);
            console.log('Email sent to ' + customerEmail);
            res.status(200).send('OK');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('Event ignored');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
