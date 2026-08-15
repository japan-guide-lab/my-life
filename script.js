const WORKER_URL =
    "https://my-life-api.yukinariforjob.workers.dev";


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


function displayToday() {

    document
        .getElementById("today")
        .textContent = getToday();

}


function collectData() {

    return {

        sleep:
            document.getElementById("sleep").value,

        health:
            document.getElementById("health").value,

        mood:
            document.getElementById("mood").value,

        done:
            document.getElementById("done").value,

        money:
            document.getElementById("money").value,

        bigExpense:
            document.getElementById("bigExpense").value,

        good:
            document.getElementById("good").value,

        reflection:
            document.getElementById("reflection").value,

        tomorrow:
            document.getElementById("tomorrow").value,

        aiQuestion:
            document.getElementById("aiQuestion").value

    };

}


function createMarkdown(data) {

    const today = getToday();


    return `# ${today}

## 今日の状態

- 睡眠：${data.sleep || "-"} 時間
- 体調：${data.health || "-"}/10
- 気分：${data.mood || "-"}/10

## 今日やったこと

${data.done || "-"}

## お金

- 今日使った金額：${data.money || "-"} 円
- 大きな支出：${data.bigExpense || "-"}

## 今日よかったこと

${data.good || "-"}

## 今日の反省

${data.reflection || "-"}

## 明日やること

${data.tomorrow || "-"}

## AIに相談したいこと

${data.aiQuestion || "-"}
`;

}


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
            "GitHubへの保存に失敗しました"
        );

    }


    return result;

}


const saveButton =
    document.getElementById(
        "saveButton"
    );


if (saveButton) {

    saveButton.addEventListener(
        "click",
        async () => {

            const status =
                document.getElementById(
                    "status"
                );


            try {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "保存中...";

                status.textContent =
                    "";


                const data =
                    collectData();


                const markdown =
                    createMarkdown(data);


                const result =
                    await saveToGitHub(
                        markdown
                    );


                status.textContent =
                    `保存しました ✓`;


                console.log(
                    "保存結果:",
                    result
                );


            } catch (error) {

                console.error(error);

                status.textContent =
                    `保存に失敗しました：${error.message}`;


            } finally {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "今日の記録を保存";

            }

        }
    );

}


displayToday();