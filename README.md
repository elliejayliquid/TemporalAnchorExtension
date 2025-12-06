# TemporalAnchorExtension
A lightweight Chrome extension that appends a local timestamp to the end of each ChatGPT message.
It improves quality of life by letting ChatGPT reference your local date/time and helping you see exactly when each message was sent, which is especially handy for searching and long conversations.

It will appear at the end of the message in this format, using your system's default timezone:

⌚ [Sent: 12/3/25, 3:13:07 PM]

**How to Install Locally (Chrome)**

**1.** Download or clone the repository.

**2.** Go to chrome://extensions/ (or Edge equivalent).

**3.** Enable **Developer mode** (top right).

**4.** Click **Load unpacked**.

**5.** Select the folder where your extension lives.

**6.** The extension should be **ON** by default, with a little green icon; you might need to reload your page with the current chat to start using it. **Toggle it OFF/ON if you're having any issues**.

**7.** It will add the timestamp whenever you hit **ENTER**. Shift + Enter still works as before. Clicking the send icon manually won't add the timestamp.


**Privacy Disclaimer**

This extension does not collect, store, transmit, or share any personal data.
All processing happens locally in your browser, in real time, and nothing is sent to any server.
The extension simply listens for text you type into the ChatGPT input box and appends a timestamp (if enabled).
No logs, no analytics, no tracking, no external requests.
