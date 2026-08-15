// 今日の日付

const today = new Date();

const dateString =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

document.getElementById("today").textContent = dateString;


// 保存

document
    .getElementById("saveButton")
    .addEventListener("click", () => {

        const data = {

            date: dateString,

            sleep:
                document.getElementById("sleep").value,

            condition:
                document.getElementById("condition").value,

            mood:
                document.getElementById("mood").value,

            money:
                document.getElementById("money").value,

            diary:
                document.getElementById("diary").value,

            good:
                document.getElementById("good").value,

            reflection:
                document.getElementById("reflection").value
        };


        localStorage.setItem(
            "mylife-" + dateString,
            JSON.stringify(data)
        );


        alert("今日の記録を保存しました！");
    });


// AIボタン

document
    .getElementById("aiButton")
    .addEventListener("click", () => {

        alert(
            "AI機能は次のステップで接続します。"
        );

    });