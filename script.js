function getToday() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function displayToday() {
    const today = getToday();

    document.getElementById("today").textContent = today;
}

function collectData() {

    const data = {
        sleep: document.getElementById("sleep").value,
        health: document.getElementById("health").value,
        mood: document.getElementById("mood").value,

        done: document.getElementById("done").value,

        money: document.getElementById("money").value,
        bigExpense: document.getElementById("bigExpense").value,

        good: document.getElementById("good").value,

        reflection: document.getElementById("reflection").value,

        tomorrow: document.getElementById("tomorrow").value,

        aiQuestion: document.getElementById("aiQuestion").value
    };

    return data;
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

document
    .getElementById("saveButton")
    .addEventListener("click", () => {

        const data = collectData();

        const markdown = createMarkdown(data);

        console.log(markdown);

        document.getElementById("status").textContent =
            "入力内容を作成しました（まだGitHubには保存していません）";

        console.log(markdown);
    });

displayToday();