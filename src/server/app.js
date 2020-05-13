const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const request = require('request')

// Config
const app = express()
const port = process.env.PORT || 5000
const publicPath = path.join(__dirname, '../..', 'public')
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use(express.static(publicPath))
const secretKey = process.env.RECAPTCHA_SECRET_KEY

// Render landing page
app.get('', (req, res) => {
    res.sendfile(path.join(publicPath, 'index.html'))
})

app.post('/submit', (req, res) => {
    const {
        emailVal,
        messageVal,
        token
    } = req.body
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`

    if (!token) {
        return res.json({
            "msg": 'There was a problem with your request. Please try again later.',
        })
    }

    request(verificationUrl, (err, response, body) => {
        // Stop process for any errors
        if (err) {
            return res.json({
                "msg": "Unable to process request."
            })
        }
        // Destructure body object
        // Check the reCAPTCHA v3 documentation for more information
        const {
            success,
            score
        } = JSON.parse(body)
        // reCAPTCHA validation
        if (!success || score < 0.4) {
            return res.json({
                "msg": "Sending failed. Robots aren't allowed here.",
                "score": score
            })
        }

        // When no problems occur, "send" the form
        console.log('Congrats you sent the form:\n', emailVal, messageVal)

        // Return feedback to user with msg
        return res.json({
            "msg": "Your message was sent successfully!",
            "score": score
        })
    })
})

// Render 404 page
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, '404.html'))
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`)
    console.log(publicPath);
})