import React, { useState } from "react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"

const useFormInput = initialValue => {
  const [value, setValue] = useState(initialValue)

  const handleChange = e => {
    setValue(e.target.value)
  }

  return {
    value,
    onChange: handleChange,
  }
}

export default function Form() {
    const email = useFormInput("")
    const message = useFormInput("")

    const { executeRecaptcha } = useGoogleReCaptcha()
    const [token, setToken] = useState("")
    const [notification, setNotification] = useState("")

    // Value for body-parser
    const emailVal = email.value
    const messageVal = message.value

    const handleSubmit = async (e) => {
      e.preventDefault()

      // Check if the captcha was skipped or not
      if (!executeRecaptcha) {
        return
      }

      // handle empty fields just in case
      if (!email.value) {
        setNotification(`Please don't leave any of the fields empty.`)
      } else if (!message.value) {
        setNotification(`Please don't leave any of the fields empty.`)
      }

      // This is the same as grecaptcha.execute on traditional html script tags
      const result = await executeRecaptcha("homepage")
      setToken(result) //--> grab the generated token by the reCAPTCHA

      // Prepare the data for the server, specifically body-parser
      const data = JSON.stringify({ emailVal, messageVal, token })

      // POST request to your server
      fetch("/submit", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: data,
      })
        .then(res => res.json())
        .then(data => {
          setNotification(data.msg)
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input type="text" name="email" id="email" {...email} required />
            <br />
            <label htmlFor="message">Message</label>
            <textarea
                name="message"
                id="message"
                rows="4"
                {...message}
                required
            ></textarea>
            <br />
            <input type="submit" value="Send" />
            <br />
            {notification && <span>{notification}</span>}
        </form>
    )
}