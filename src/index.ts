import express from 'express';
import { WebClient } from '@slack/web-api';
import {createEventAdapter, ErrorCode} from '@slack/events-api';
import { createServer } from 'http';

// 생성한 슬랙봇에 대한 키값들
import CONFIG from '../config/bot.json';

// 슬랙에서 슬랙봇에게 접근가능한 엔드포인트를 만들기 위해 웹서버(express)를 사용
const app = express();

const slackEvents = createEventAdapter(CONFIG.SIGNING_SECRET);
const webClient = new WebClient(CONFIG.BOT_USER_OAUTH_ACCESS_TOKEN)

// 메시지 이벤트 구독하기
slackEvents.on('message', async (event) => {
    console.log(event);
try{
    if (event.text === '스탠드업') {
        await webClient.chat.postMessage({
            user:'',
            text: `안녕하세요 <@유저아이디>!\n할 일을 보여줍니다.. 이건 테스트입니다.`,
            channel: event.channel,

        });
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
// ngrok 으로 생성한 외부 포트를 슬랙의 Request URL 에 등록.
// https://~.ngrok.io/slack/events
createServer(app).listen(8080, () => {
    console.log('slack bot 시작');
});