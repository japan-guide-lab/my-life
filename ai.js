const AI_API =
    "https://my-life-ai.yukinariforjob.workers.dev/";


/* =========================
   LocalStorage
========================= */

const HISTORY_KEY =
    "my-life-ai-history";

const MAX_HISTORY =
    20;


/* =========================
   会話履歴
========================= */

let conversationHistory =
    loadHistory();


function loadHistory() {

    try {

        const saved =
            localStorage.getItem(
                HISTORY_KEY
            );


        if (!saved) {
            return [];
        }


        const history =
            JSON.parse(saved);


        if (!Array.isArray(history)) {
            return [];
        }


        return history
            .filter(item =>
                item &&
                (
                    item.role === "user" ||
                    item.role === "assistant"
                ) &&
                typeof item.content === "string"
            )
            .slice(-MAX_HISTORY);


    } catch (error) {

        console.error(
            "会話履歴の読み込みに失敗:",
            error
        );

        return [];

    }

}


/* =========================
   会話履歴保存
========================= */

function saveHistory() {

    try {

        localStorage.setItem(

            HISTORY_KEY,

            JSON.stringify(
                conversationHistory
            )

        );

    } catch (error) {

        console.error(
            "会話履歴の保存に失敗:",
            error
        );

    }

}


/* =========================
   今日の日付
========================= */

function getToday() {

    const now =
        new Date();


    const parts =
        new Intl.DateTimeFormat(
            "ja-JP",
            {
                timeZone:
                    "Asia/Tokyo",

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit"
            }
        ).formatToParts(now);


    const year =
        parts.find(
            part =>
                part.type === "year"
        ).value;


    const month =
        parts.find(
            part =>
                part.type === "month"
        ).value;


    const day =
        parts.find(
            part =>
                part.type === "day"
        ).value;


    return `${year}-${month}-${day}`;

}


/* =========================
   今日を表示
========================= */

function displayToday() {

    document
        .getElementById("today")
        .textContent =
        getToday();

}


/* =========================
   メッセージ追加
========================= */

function addMessage(
    type,
    text
) {

    const chat =
        document.getElementById(
            "chat"
        );


    const message =
        document.createElement(
            "div"
        );


    message.className =
        `message ${type}`;


    const label =
        document.createElement(
            "div"
        );


    label.className =
        "message-label";


    label.textContent =
        type === "user"
            ? "あなた"
            : "MY LIFE AI";


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "message-content";


    content.textContent =
        text;


    message.appendChild(
        label
    );


    message.appendChild(
        content
    );


    chat.appendChild(
        message
    );


    /* 一番下までスクロール */

    chat.scrollTop =
        chat.scrollHeight;

}


/* =========================
   保存されている会話を画面に表示
========================= */

function restoreConversation() {

    conversationHistory.forEach(
        item => {

            addMessage(

                item.role === "user"
                    ? "user"
                    : "ai",

                item.content

            );

        }
    );

}


/* =========================
   履歴に追加
========================= */

function addToHistory(
    role,
    content
) {

    conversationHistory.push({

        role:
            role,

        content:
            content

    });


    /* 最新20メッセージだけ */

    if (
        conversationHistory.length >
        MAX_HISTORY
    ) {

        conversationHistory =
            conversationHistory.slice(
                -MAX_HISTORY
            );

    }


    saveHistory();

}


/* =========================
   AI問い合わせ
========================= */

async function askAI(
    message
) {

    const response =
        await fetch(

            AI_API,

            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        message:
                            message,

                        history:
                            conversationHistory

                    })

            }

        );


    const result =
        await response.json();


    if (
        !response.ok ||
        !result.success
    ) {

        console.error(
            "AI API response:",
            result
        );


        const detail =
            result.message ||
            result.error ||
            "AIとの通信に失敗しました";


        throw new Error(

            `Gemini API error (${result.status || response.status}): ${detail}`

        );

    }


    return result.answer;

}


/* =========================
   送信
========================= */

async function sendMessage() {

    const input =
        document.getElementById(
            "aiInput"
        );


    const button =
        document.getElementById(
            "sendButton"
        );


    const status =
        document.getElementById(
            "status"
        );


    const message =
        input.value.trim();


    if (!message) {

        status.textContent =
            "メッセージを入力してください。";

        return;

    }


    /* =========================
       ユーザーのメッセージを表示
    ========================= */

    addMessage(
        "user",
        message
    );


    /* =========================
       LocalStorageに保存
    ========================= */

    addToHistory(
        "user",
        message
    );


    /* =========================
       入力欄を空にする
    ========================= */

    input.value =
        "";


    /* =========================
       ボタン無効化
    ========================= */

    button.disabled =
        true;


    button.textContent =
        "AIが考えています...";


    status.textContent =
        "";


    try {

        const answer =
            await askAI(
                message
            );


        /* =========================
           AI回答表示
        ========================= */

        addMessage(
            "ai",
            answer
        );


        /* =========================
           AI回答を保存
        ========================= */

        addToHistory(
            "assistant",
            answer
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        addMessage(

            "ai",

            `エラーが発生しました。\n${error.message}`

        );

    } finally {

        button.disabled =
            false;


        button.textContent =
            "AIに送信";


        input.focus();

    }

}


/* =========================
   会話履歴をクリア
========================= */

function clearConversation() {

    conversationHistory =
        [];


    localStorage.removeItem(
        HISTORY_KEY
    );


    const chat =
        document.getElementById(
            "chat"
        );


    chat.innerHTML =
        "";


    const status =
        document.getElementById(
            "status"
        );


    status.textContent =
        "会話履歴を削除しました。";

}


/* =========================
   ボタン
========================= */

document
    .getElementById(
        "sendButton"
    )
    .addEventListener(
        "click",
        sendMessage
    );


/* =========================
   Ctrl + Enter
========================= */

document
    .getElementById(
        "aiInput"
    )
    .addEventListener(
        "keydown",
        event => {

            if (
                event.ctrlKey &&
                event.key === "Enter"
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


/* =========================
   初期化
========================= */

displayToday();

restoreConversation();