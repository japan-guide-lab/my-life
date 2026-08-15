const WORKER_URL =
    "https://my-life-api.yukinariforjob.workers.dev";


/* =========================
   Date
========================= */

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getJapaneseDate() {

    const now = new Date();

    const weekdays = [
        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"
    ];

    return `${now.getFullYear()}年${
        now.getMonth() + 1
    }月${
        now.getDate()
    }日（${
        weekdays[now.getDay()]
    }）`;
}


function displayToday() {

    document.getElementById("today")
        .textContent =
        getJapaneseDate();
}


/* =========================
   Score
========================= */

function setupScoreButtons(
    containerId,
    inputId
) {

    const container =
        document.getElementById(containerId);

    const input =
        document.getElementById(inputId);

    const buttons =
        container.querySelectorAll("button");

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(b =>
                    b.classList.remove("selected")
                );

                button.classList.add("selected");

                input.value =
                    button.dataset.value;
            }
        );
    });
}


/* =========================
   Collect Data
========================= */

function collectData() {

    return {

        sleep:
            document.getElementById("sleep").value
                .trim(),

        health:
            document.getElementById("health").value,

        mood:
            document.getElementById("mood").value,

        done:
            document.getElementById("done").value
                .trim(),

        money:
            document.getElementById("money").value
                .trim(),

        bigExpense:
            document.getElementById("bigExpense").value
                .trim(),

        good:
            document.getElementById("good").value
                .trim(),

        reflection:
            document.getElementById("reflection").value
                .trim(),

        tomorrow: [
            document.getElementById("tomorrow1").value.trim(),
            document.getElementById("tomorrow2").value.trim(),
            document.getElementById("tomorrow3").value.trim()
        ],

        aiQuestion:
            document.getElementById("aiQuestion").value
                .trim()
    };
}


/* =========================
   Validation
========================= */

function validateData(data) {

    if (!data.sleep) {

        return "睡眠時間を入力してください。";

    }

    if (!data.health) {

        return "体調を選択してください。";

    }

    if (!data.mood) {

        return "気分を選択してください。";

    }

    if (!data.done) {

        return "「今日やったこと」を入力してください。";

    }

    return null;
}


/* =========================
   Markdown
========================= */

function createMarkdown(data) {

    const today =
        getToday();

    const tomorrow =
        data.tomorrow
            .filter(Boolean)
            .map(
                (item, index) =>
                    `${index + 1}. ${item}`
            )
            .join("\n") || "-";


    return `# ${today}

## 今日の状態

- 睡眠：${data.sleep}時間
- 体調：${data.health}/10
- 気分：${data.mood}/10

## 今日やったこと

${data.done || "-"}

## お金

- 今日使った金額：${data.money ? `${data.money}円` : "-"}
- 大きな支出：${data.bigExpense || "-"}

## 今日よかったこと

${data.good || "-"}

## 今日の反省

${data.reflection || "-"}

## 明日やること

${tomorrow}

## AIに相談したいこと

${data.aiQuestion || "-"}
`;
}


/* =========================
   Save to GitHub
========================= */

async function saveToGitHub(markdown) {

    const response =
        await fetch(
            WORKER_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    date: getToday(),

                    markdown: markdown

                })
            }
        );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.error ||
            result.message ||
            "GitHubへの保存に失敗しました"
        );
    }


    return result;
}


/* =========================
   Save Button
========================= */

document
    .getElementById("saveButton")
    .addEventListener(
        "click",
        async () => {

            const button =
                document.getElementById(
                    "saveButton"
                );

            const status =
                document.getElementById(
                    "status"
                );


            status.className =
                "status";

            status.textContent =
                "保存しています...";


            button.disabled = true;


            try {

                const data =
                    collectData();


                const validationError =
                    validateData(data);


                if (validationError) {

                    throw new Error(
                        validationError
                    );
                }


                const markdown =
                    createMarkdown(data);


                console.log(
                    "生成されたMarkdown:"
                );

                console.log(markdown);


                const result =
                    await saveToGitHub(
                        markdown
                    );


                console.log(
                    "保存結果:",
                    result
                );


                status.className =
                    "status success";


                status.textContent =
                    `✓ 保存しました`;
                

            } catch (error) {

                console.error(error);


                status.className =
                    "status error";


                status.textContent =
                    `保存できませんでした：${error.message}`;

            } finally {

                button.disabled = false;

            }
        }
    );


/* =========================
   Initialize
========================= */

setupScoreButtons(
    "healthScore",
    "health"
);

setupScoreButtons(
    "moodScore",
    "mood"
);

displayToday();