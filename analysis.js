const ANALYSIS_API =
    "https://my-life-analysis.yukinariforjob.workers.dev/";



/* =========================
   今日の日付
========================= */

function getToday() {

    const now = new Date();

    const parts =
        new Intl.DateTimeFormat(
            "ja-JP",
            {
                timeZone: "Asia/Tokyo",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        ).formatToParts(now);


    const year =
        parts.find(
            part => part.type === "year"
        ).value;


    const month =
        parts.find(
            part => part.type === "month"
        ).value;


    const day =
        parts.find(
            part => part.type === "day"
        ).value;


    return `${year}-${month}-${day}`;
}



/* =========================
   数値抽出
========================= */

function extractNumber(
    markdown,
    pattern
) {

    const match =
        markdown.match(pattern);


    if (!match) {
        return null;
    }


    const value =
        Number(match[1]);


    return Number.isFinite(value)
        ? value
        : null;
}



/* =========================
   セクション抽出
========================= */

function extractSection(
    markdown,
    startTitle,
    endTitle
) {

    const start =
        markdown.indexOf(
            startTitle
        );


    if (start === -1) {
        return "";
    }


    const contentStart =
        start + startTitle.length;


    const end =
        markdown.indexOf(
            endTitle,
            contentStart
        );


    const content =
        end === -1

            ? markdown.slice(
                contentStart
            )

            : markdown.slice(
                contentStart,
                end
            );


    return content.trim();
}



/* =========================
   Markdown解析
========================= */

function parseMarkdown(entry) {

    if (
        !entry.exists ||
        !entry.markdown
    ) {

        return {

            date: entry.date,

            sleep: null,

            health: null,

            mood: null,

            good: "",

            reflection: "",

            tomorrow: ""

        };

    }


    const markdown =
        entry.markdown;


    const sleep =
        extractNumber(
            markdown,
            /睡眠：\s*([0-9.]+)\s*時間/
        );


    const health =
        extractNumber(
            markdown,
            /体調：\s*([0-9.]+)\s*\/10/
        );


    const mood =
        extractNumber(
            markdown,
            /気分：\s*([0-9.]+)\s*\/10/
        );


    const good =
        extractSection(
            markdown,
            "## 今日よかったこと",
            "## 今日の反省"
        );


    const reflection =
        extractSection(
            markdown,
            "## 今日の反省",
            "## 明日やること"
        );


    const tomorrow =
        extractSection(
            markdown,
            "## 明日やること",
            "## AIに相談したいこと"
        );


    return {

        date: entry.date,

        sleep,

        health,

        mood,

        good,

        reflection,

        tomorrow

    };

}



/* =========================
   平均
========================= */

function average(
    records,
    key
) {

    const values =
        records
            .map(
                record =>
                    record[key]
            )
            .filter(
                value =>
                    typeof value === "number"
            );


    if (
        values.length === 0
    ) {

        return null;

    }


    const total =
        values.reduce(
            (
                sum,
                value
            ) =>
                sum + value,
            0
        );


    return (
        total /
        values.length
    );

}



/* =========================
   傾向
========================= */

function getTrend(
    records,
    key
) {

    const values =
        records
            .filter(
                record =>
                    typeof record[key]
                    === "number"
            )
            .map(
                record =>
                    record[key]
            );


    if (
        values.length < 2
    ) {

        return {

            icon: "→",

            text:
                "まだ十分なデータがありません"

        };

    }


    const first =
        values[0];


    const last =
        values[
            values.length - 1
        ];


    const difference =
        last - first;


    if (
        difference >= 1
    ) {

        return {

            icon: "↑",

            text:
                "改善傾向"

        };

    }


    if (
        difference <= -1
    ) {

        return {

            icon: "↓",

            text:
                "低下傾向"

        };

    }


    return {

        icon: "→",

        text:
            "安定"

    };

}



/* =========================
   日付表示
========================= */

function formatDate(dateString) {

    const parts =
        dateString.split("-");


    return `${Number(parts[1])}/${Number(parts[2])}`;

}



/* =========================
   Plotlyチャート
========================= */

function createLineChart(
    elementId,
    records,
    key,
    title,
    unit,
    yMax
) {

    const container =
        document.getElementById(
            elementId
        );


    const dates =
        records.map(
            record =>
                formatDate(
                    record.date
                )
        );


    const values =
        records.map(
            record =>
                typeof record[key] === "number"
                    ? record[key]
                    : null
        );


    const trace = {

        x: dates,

        y: values,

        mode: "lines+markers",

        connectgaps: false,

        line: {
            width: 3
        },

        marker: {
            size: 8
        },

        hovertemplate:
            "%{x}<br>" +
            title +
            "：%{y}" +
            unit +
            "<extra></extra>"

    };


    const layout = {

        margin: {
            l: 42,
            r: 15,
            t: 10,
            b: 45
        },

        height: 250,

        paper_bgcolor:
            "rgba(0,0,0,0)",

        plot_bgcolor:
            "rgba(0,0,0,0)",

        font: {
            family:
                "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",

            color:
                "#777"
        },

        xaxis: {

            type: "category",

            fixedrange: true,

            tickfont: {
                size: 12
            },

            gridcolor:
                "#eeeeee"

        },

        yaxis: {

            range:
                [0, yMax],

            fixedrange: true,

            dtick:
                key === "mood"
                    ? 2
                    : 2,

            tickfont: {
                size: 12
            },

            gridcolor:
                "#eeeeee"

        },

        showlegend:
            false

    };


    const config = {

        responsive: true,

        displayModeBar: false,

        scrollZoom: false

    };


    Plotly.newPlot(
        container,
        [trace],
        layout,
        config
    );

}



/* =========================
   テキストリスト
========================= */

function createTextList(
    elementId,
    records,
    key
) {

    const container =
        document.getElementById(
            elementId
        );


    container.innerHTML =
        "";


    const values =
        records
            .filter(
                record =>
                    record[key]
            )
            .map(
                record => ({
                    date:
                        record.date,

                    text:
                        record[key]
                })
            );


    if (
        values.length === 0
    ) {

        container.textContent =
            "まだ記録がありません。";

        return;

    }


    values.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "text-list-item";


            const date =
                document.createElement(
                    "span"
                );


            date.className =
                "text-list-date";


            date.textContent =
                item.date;


            const text =
                document.createElement(
                    "p"
                );


            text.textContent =
                item.text;


            div.appendChild(
                date
            );


            div.appendChild(
                text
            );


            container.appendChild(
                div
            );

        }
    );

}



/* =========================
   メイン
========================= */

async function loadAnalysis() {

    const status =
        document.getElementById(
            "status"
        );


    try {

        status.textContent =
            "GitHubから記録を取得しています...";


        const response =
            await fetch(
                ANALYSIS_API
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.error ||
                "データ取得に失敗しました"
            );

        }


        console.log(
            "取得データ:",
            result
        );



        /* =========================
           Markdown解析
        ========================= */

        const records =
            result.entries
                .map(
                    entry =>
                        parseMarkdown(
                            entry
                        )
                )
                .reverse();



        /* =========================
           期間
        ========================= */

        document
            .getElementById(
                "period"
            )
            .textContent =
            `${result.period.from} 〜 ${result.period.to}`;



        /* =========================
           記録数
        ========================= */

        document
            .getElementById(
                "recordCount"
            )
            .textContent =
            result.recordedCount;


        document
            .getElementById(
                "recordSummary"
            )
            .textContent =
            `${result.recordedCount}日分の記録があります。`;



        /* =========================
           平均
        ========================= */

        const avgSleep =
            average(
                records,
                "sleep"
            );


        const avgHealth =
            average(
                records,
                "health"
            );


        const avgMood =
            average(
                records,
                "mood"
            );


        document
            .getElementById(
                "averageSleep"
            )
            .textContent =
            avgSleep === null
                ? "-"
                : avgSleep.toFixed(1);


        document
            .getElementById(
                "averageHealth"
            )
            .textContent =
            avgHealth === null
                ? "-"
                : avgHealth.toFixed(1);


        document
            .getElementById(
                "averageMood"
            )
            .textContent =
            avgMood === null
                ? "-"
                : avgMood.toFixed(1);



        /* =========================
           Plotly
        ========================= */

        createLineChart(
            "moodChart",
            records,
            "mood",
            "気分",
            "",
            10
        );


        createLineChart(
            "sleepChart",
            records,
            "sleep",
            "睡眠",
            "h",
            12
        );



        /* =========================
           傾向
        ========================= */

        const trendList =
            document.getElementById(
                "trendList"
            );


        trendList.innerHTML =
            "";


        const trends = [

            {
                label: "睡眠",
                key: "sleep"
            },

            {
                label: "体調",
                key: "health"
            },

            {
                label: "気分",
                key: "mood"
            }

        ];


        trends.forEach(
            trend => {

                const result =
                    getTrend(
                        records,
                        trend.key
                    );


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "trend-item";


                const label =
                    document.createElement(
                        "span"
                    );


                label.textContent =
                    trend.label;


                const strong =
                    document.createElement(
                        "strong"
                    );


                strong.textContent =
                    `${result.icon} ${result.text}`;


                div.appendChild(
                    label
                );


                div.appendChild(
                    strong
                );


                trendList.appendChild(
                    div
                );

            }
        );



        /* =========================
           よかったこと
        ========================= */

        createTextList(
            "goodList",
            records,
            "good"
        );



        /* =========================
           反省
        ========================= */

        createTextList(
            "reflectionList",
            records,
            "reflection"
        );



        /* =========================
           記録一覧
        ========================= */

        const recordList =
            document.getElementById(
                "recordList"
            );


        recordList.innerHTML =
            "";


        [...records]
            .reverse()
            .forEach(
                record => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "record-item";


                    const date =
                        document.createElement(
                            "span"
                        );


                    date.textContent =
                        record.date;


                    const status =
                        document.createElement(
                            "span"
                        );


                    const hasRecord =
                        record.sleep !== null ||
                        record.health !== null ||
                        record.mood !== null ||
                        record.good !== "" ||
                        record.reflection !== "" ||
                        record.tomorrow !== "";


                    if (hasRecord) {

                        status.textContent =
                            "記録あり";

                        status.className =
                            "record-exists";

                    } else {

                        status.textContent =
                            "未記録";

                        status.className =
                            "record-missing";

                    }


                    item.appendChild(
                        date
                    );


                    item.appendChild(
                        status
                    );


                    recordList.appendChild(
                        item
                    );

                }
            );



        /* =========================
           完了
        ========================= */

        status.textContent =
            "分析データを更新しました。";


    } catch (error) {

        console.error(
            error
        );


        status.textContent =
            `分析に失敗しました：${error.message}`;

    }

}



/* =========================
   初期化
========================= */

document
    .getElementById(
        "today"
    )
    .textContent =
    getToday();


loadAnalysis();