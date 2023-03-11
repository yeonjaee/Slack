require('dotenv').config()
const { WebClient } = require('@slack/web-api');
const { createMessageAdapter } = require('@slack/interactive-messages');
const signingSecret = process.env.SLACK_SIGNING_SECRET;
const botToken = process.env.BOT_USER_OAUTH_ACCESS_TOKEN;

const web = new WebClient(botToken);
const slackInteractions = createMessageAdapter(signingSecret);

const app = require('express')();

app.post('/daily', async (req, res) => {
    const trigger_id = req.body[2];
    try {
        const modal = {
            title: {
                type: 'plain_text',
                text: 'Daily Report'
            },
            submit: {
                type: 'plain_text',
                text: 'Send'
            },
            callback_id: 'daily_report_modal',
            blocks: [
                {
                    type: 'section',
                    block_id: 'daily_report_text',
                    text: {
                        type: 'mrkdwn',
                        text: 'Please enter your daily report:'
                    },
                    accessory: {
                        type: 'plain_text_input',
                        action_id: 'daily_report_input'
                    }
                }
            ]
        };
        await web.views.open({
            trigger_id: trigger_id,
            view: modal
        });
        res.send('');
    } catch (error) {
        console.log(error.stack);
        console.error(error);
        res.status(500).send(error);
    }
});

slackInteractions.action({ callback_id: 'daily_report_modal' }, async (payload, respond) => {
    try {
        const dailyReportText = payload.view.state.values.daily_report_text.daily_report_input.value;

        await web.chat.postMessage({
            channel: payload.user.id,
            text: `*Daily Report*\n${dailyReportText}`
        });

        await respond({
            text: 'Your daily report has been sent.'
        });
    } catch (error) {
        console.error(error.stack);
        console.error(error);
    }
});

// node ./src/slack.ts
app.listen(8080, () => {
    console.log('App is running!');
});