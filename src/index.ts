require('dotenv').config()
import express from 'express';
import { WebClient } from '@slack/web-api';
import {createEventAdapter, ErrorCode} from '@slack/events-api';
import { createServer } from 'http';

// 슬랙에서 슬랙봇에게 접근가능한 엔드포인트를 만들기 위해 웹서버(express)를 사용
const app = express();

// .env 변수
const signingSecret = process.env.SLACK_SIGNING_SECRET;
const botToken = process.env.BOT_USER_OAUTH_ACCESS_TOKEN;

const slackEvents = createEventAdapter(signingSecret);
const webClient = new WebClient(botToken)

// 메시지 이벤트 구독하기
slackEvents.on('message', async (event) => {
    console.log(event.text);
try{
    if (event.text === 'test') {
        await webClient.chat.postMessage({
            user:'',
            text: `안녕하세요 <@${event.user}>!\n이건 테스트입니다.`,
            channel: event.channel,
        });
    }
    if( event.text === 'block'){
        await webClient.chat.postMessage({
            channel: event.channel,
            blocks: [
            {
                "type": "actions",
                "block_id": "actions1",
                "elements": [
                    {
                        "type": "static_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select?"
                        },
                        "action_id": "select_2",
                        "options": [
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Matilda"
                                },
                                "value": "matilda"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Glinda"
                                },
                                "value": "glinda"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Granny Weatherwax"
                                },
                                "value": "grannyWeatherwax"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Hermione"
                                },
                                "value": "hermione"
                            }
                        ]
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Cancel"
                        },
                        "value": "cancel",
                        "action_id": "button_1"
                    }
                ]
            }
        ]
        })
    }
}catch (e) {
    if(e.code === ErrorCode.SignatureVerificationFailure){
        console.log(e.data);
    }else{
        console.error(e)
    }
}
});

// 메지지 이벤트 엔드포인트를 express 에 등록하기
app.use('/slack/events', slackEvents.requestListener());

// express 웹 서버 실행
// npx ts-node ./src/index.ts
createServer(app).listen(8080, () => {
    console.log('slack bot 시작');
});