'use strict'
{
    const body = document.querySelector('body');
    let scoreNum = 0;
    let currentNum = 0;

    //セッターとゲッター
    class SetGet {
        // setter
        set dataArray(value) {
            this._dataArray = value;
        }

        // getter
        get dataArray() {
            return this._dataArray;
        }

        constructor(value) {
            this._dataArray = value;
        }
    }

    //データをセットするクラス...➀
    class GetData {

        //Open Trivia DBからデータの取得（クイズのデータ１０問）
        getData() {
            fetch('https://opentdb.com/api.php?amount=10&type=multiple', {
                method: "GET",
                redirect: "follow"
            }).then(function (resp) {
                if (resp.ok) {
                    //jsonデータでの取り出し
                    resp.json().then(data => {

                        const setGet = new SetGet(data['results']);

                        //➁のインスタンスを作成し、jsonデータを表示するメソッドを呼ぶ
                        const display = new DisplayData(setGet.dataArray);
                        
                        display.displayData;
                        
                    });
                } else {
                    console.error('通信エラー')
                }
            });

            //データを取得している間、画面に以下の表示をする
            let h1 = document.createElement('h1');
            h1.textContent = '取得中';
            body.appendChild(h1);

            let h2 = document.createElement('h2');
            h2.classList.add('grayBorder');
            h2.textContent = '少々お待ちください'
            body.appendChild(h2);
        };
    };

    //➀でセットしたデータをhtml上で表示する...➁
    class DisplayData {

        //dataArrayは➀で取得したOpen Trivia DBOpen Trivia DBのデータ１０問
        constructor(dataArray) {
            //1.画面上に表示されているhtmlを消去する
            this.deleteData();
            //2.真っ白な画面に、➀で取得したデータをhtmlで表示する
            this.displayData(dataArray);
        }

        //画面上に表示されているhtmlを消去する
        deleteData() {
            while (body.firstChild) {
                body.removeChild(body.firstChild);
            };
        }

        //Open Trivia DBから取得したデータの選択肢をシャッフル
        shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                //選択肢のj番目とi番目を入れ替える
                [arr[j], arr[i]] = [arr[i], arr[j]]
            }
            return arr;
        }

        //➀で取得したデータをhtmlで表示する
        displayData(dataArray) {

            //クラスGetDataで取得したcurrentNum番目のデータを呼ぶ
            let dataNumber = dataArray[currentNum];

            //問題〇
            let h1 = document.createElement('h1');
            h1.textContent = `問題${currentNum + 1}`;
            body.appendChild(h1);

            //ジャンル
            let h2Category = document.createElement('h2');
            h2Category.textContent = '［ジャンル］' + dataNumber['category'];
            body.appendChild(h2Category);

            //難易度
            let h2difficulty = document.createElement('h2');
            h2difficulty.textContent = '［難易度］' + dataNumber['difficulty'];
            body.appendChild(h2difficulty);

            //問題文
            let h2Question = document.createElement('h2');
            h2Question.classList.add('grayBorder');
            //innertextだと実態参照がそのまま表示されるのでinnerHTML
            h2Question.innerHTML = dataNumber['question'];
            body.appendChild(h2Question);

            //回答ボタンの箱
            const buttonColumn = document.createElement('div');
            body.appendChild(buttonColumn);
            buttonColumn.classList.add('buttonColumn');

            //4択の回答をシャッフルする
            let quizSet = this.shuffle([
                ...dataNumber['incorrect_answers'],
                dataNumber['correct_answer']
            ]);

            //シャッフルした回答をボタンにして表示
            quizSet.forEach(choice => {
                const choiceButton = document.createElement('button');
                choiceButton.textContent = choice;
                buttonColumn.appendChild(choiceButton);
            });

            //➂のインスタンスを作成し、正誤を判断するメソッドを呼ぶ
            let answer = new Answer();
            answer.selectAnswer(dataArray,dataNumber['correct_answer']);

            //現在の問題数が10なら、⓸のインスタンスを作成しクイズを終了する
            if (currentNum === 9) {
                this.deleteData();
                let result = new Result();
                result.resultDisplay();
            }
        }
    }

    //➁で作成した選択肢ボタンの正誤を判定する...➂
    class Answer {
        constructor(dataArray) {
            //1.画面上に表示されているhtmlを消去する
            this.dataArray = dataArray;
        }

        //➁で作成した選択肢ボタンをクリックしたときのイベント
        selectAnswer(dataArray,correctAnswer) {
            //選択肢をクリックする
            body.querySelectorAll('button').forEach(function (button) {
                button.addEventListener('click', e => {
                    let selectButton = e.currentTarget.textContent;
                    //coreNumはクイズの正答数。選択肢が正解なら１加算する
                    if (correctAnswer === selectButton) {
                        scoreNum++;
                    }
                    //currentNumは現在の問題番号。選択肢を選んだ後に１加算する
                    currentNum++

                    //➁のインスタンスを再び作成し、次の問題に進む
                    const display = new DisplayData(dataArray);
                    display.displayData;
                });
            });
        }
    }

    //最終的な結果を出力する...⓸
    class Result {

        resultDisplay() {
            //あなたの正答数は〇です
            let h1 = document.createElement('h1');
            h1.textContent = `あなたの正答数は${scoreNum}です！！`;
            body.appendChild(h1);

            //再度チャレンジしたい場合は以下をクリック
            let h2Restart = document.createElement('h2');
            h2Restart.classList.add('grayBorder');
            h2Restart.textContent = '再度チャレンジしたい場合は以下をクリック！！';
            body.appendChild(h2Restart);

            //クリックすると最初のページindex_test.htmlへ戻る
            let homeButton = document.createElement('button');
            homeButton.setAttribute('id', homeButton);
            homeButton.textContent = 'ホームに戻る';
            body.appendChild(homeButton);
            homeButton.addEventListener('click', e => {
                location.href = "index_test.html";
            });
        }
    }

    /*簡単な流れ
    //➀：Open Trivia DBからデータの取得後、クラス➁のインスタンスのメソッドを呼ぶ
    //➁：クラス➀の変数currentNum番目（現在の問題番号）のデータ整形後、htmlで出力しクラス➂のインスタンスのメソッドを呼ぶ
    //➂：整形後データの選択肢ボタンをクリックし、正誤を判断、正解なら加点し、最後に
    currentNumに１を加算し、再び➁へ（currentNumが９までループ）
    //⓸：currentNumが９になったらクラス⓸のインスタンスを呼びクイズの結果を出力し、再び➀へ
    */

    let data = new GetData();
    data.getData();
}