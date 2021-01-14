// 自身のGearManager(リリースしてない)のC#コードから移植
// いちいち全ての武器画像やギア画像をキャッシュせずに取ってくるのは、ユーザがそんな頻繁にこの機能を使わないだろうという憶測から
// 本来はconstやletを用いてスコープ毎に変数を分離していたが、safariではconstやletが対応していないため、varを使用
{
    $(function() 
    {
        $("#file").change(function() 
        {
            var file = $(this).prop('files')[0];
            var reader = new FileReader();

            if(file == null)
            {
                return;
            }
            else if (!file.type.match("image/*"))
            {
                alert("選択できるファイルは画像ファイルだけです。");
                return;
            }

            reader.onload = function()
            {
                var img = new Image();
                img.onload = function()
                {
                    if(img.naturalWidth != 1280 || img.naturalHeight != 720)
                    {
                        alert("無編集の画像を選択してください。");
                        return;
                    }

                    var canvas = document.createElement("canvas");
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;

                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    gearMatch(ctx.getImageData(0, 0, canvas.width, canvas.height), true);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });

        $("#file2").change(function() 
        {
            // startTime = performance.now();
            console.log("Read");
            var file = $(this).prop('files')[0];
            var reader = new FileReader();

            if(file == null)
            {
                return;
            }
            else if (!file.type.match("image/*"))
            {
                alert("選択できるファイルは画像ファイルだけです。");
                return;
            }

            reader.onload = function()
            {
                console.log("Function");
                var img = new Image();
                img.onload = function()
                {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;

                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    getGearAreaImage(img, ctx.getImageData(0, 0, canvas.width, canvas.height));
                };
                img.src = reader.result;
            };
            console.log("DataURL");
            reader.readAsDataURL(file);
        });
    });

    function getGearAreaImage(origImg, canvasImg)
    {
        console.log("AreaImage");
        let aboveY = getGearAreaEndPos(canvasImg, 0, canvasImg.height, canvasImg.width / 2, false);
        let belowY = getGearAreaEndPos(canvasImg, canvasImg.height * 14 / 15 - 1, -1, canvasImg.width / 2, false); // 下からも見るけど下からの場合、下が灰色なら詰み 詰んだので1/15を引く
        let leftX = getGearAreaEndPos(canvasImg, 0, canvasImg.width, (aboveY + belowY) / 2, true);
        let rightX = getGearAreaEndPos(canvasImg, canvasImg.width - 1, -1, (aboveY + belowY) / 2, true);

        var canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 1000;
        console.log("Canvas");
        var ctx = canvas.getContext("2d");
        ctx.drawImage(origImg, leftX, aboveY, rightX - leftX + 1, belowY - aboveY + 1, 0, 0, canvas.width, canvas.height);
        // console.log(canvas.toDataURL());
        gearMatch(ctx.getImageData(0, 0, canvas.width, canvas.height), false);
    }

    // ギアの領域(灰色の部分)の模索
    function getGearAreaEndPos(img, start, end, midPos, isXAxis)
    {
        start = Math.ceil(start);
        end = Math.ceil(end);
        midPos = Math.ceil(midPos);

        let ans = 0;
        let increment = start < end ? 1 : -1;
        for(var i = start; i != end; i += increment)
        {
            var index = isXAxis ? (i + midPos * img.width) * 4 : (midPos + i * img.width) * 4;
            if(!(120 <= img.data[index] && img.data[index] <= 140 &&
                120 <= img.data[index + 1] && img.data[index + 1] <= 140 &&
                120 <= img.data[index + 2] && img.data[index + 2] <= 140)) continue;

            ans = i;
            break;
        }

        return ans;
    }

    var weaponCount;
    var minWeaponNumber;
    var minWeaponMSE;
    var gearCount;
    var minMainGearNumber = new Array(3);
    var minMainGearMSE;
    var minSubGearNumber = new Array(9);
    var minSubGearMSE;

    function gearMatch(origImg, isGame)
    {
        weaponCount = 0;
        minWeaponMSE = Number.MAX_VALUE;
        gearCount = 0;
        minMainGearMSE = new Array(3).fill(Number.MAX_VALUE);
        minSubGearMSE = new Array(9).fill(Number.MAX_VALUE);

        // 武器画像比較
        for(var i = 0; i <= 138; i++)
        {
            console.log("weapon" + i);
            var img = new Image();
            img.onload = function()
            {
                var canvas = document.createElement("canvas");
                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight;

                var ctx = canvas.getContext("2d");
                ctx.drawImage(this, 0, 0);
                
                var mse = isGame ? calculateMSE(origImg, ctx.getImageData(0, 0, canvas.width, canvas.height), weaponPos1, 30000) : calculateMSE(origImg, ctx.getImageData(0, 0, canvas.width, canvas.height), weaponPos2, 30000, 4, true);
                if(mse < minWeaponMSE)
                {
                    minWeaponMSE = mse;
                    minWeaponNumber = this.src.match(".+/(.+?)\.[a-z]+$")[1]; // 武器番号をソースから取ってくる
                }

                // 全ての武器を捜査したらMSEが最低値を示したものを表示する
                weaponCount++;
                if(weaponCount < 139) return;

                // console.log(performance.now() - startTime);
                $('[name=weaponSelect]').val(minWeaponNumber).change();
            };
            img.src = "assets/images/" + i + ".png";
        }

        // ギア画像 + エッジ
        for(var i = 0; i <= 27; i++)
        {
            console.log("gear" + i);
            var img = new Image();
            img.onload = function()
            {
                var canvas = document.createElement("canvas");
                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight;

                var ctx = canvas.getContext("2d");
                ctx.drawImage(this, 0, 0);

                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var num = isGame ? this.src.match(".+/(.+?)\.[a-z]+$")[1].substring(1) : this.src.match(".+/(.+?)\.[a-z]+$")[1].substring(2);
                console.log(num);
                if(num <= 14 || (!isGame && num == 27)) // all !isGameの時は、エッジではなく、灰色の壁紙との照合
                {
                    var mses = calculateGearMSE(origImg, imgData, false, isGame); // 二次元配列
                    for(var j = 0; j < 3; j++)
                    {
                        if(mses[0][j] >= minMainGearMSE[j]) continue;
                        minMainGearMSE[j] = mses[0][j];
                        minMainGearNumber[j] = num;
                    }
                    for(var j = 0; j < 9; j++)
                    {
                        if(mses[1][j] >= minSubGearMSE[j]) continue;
                        minSubGearMSE[j] = mses[1][j];
                        minSubGearNumber[j] = num;
                    }
                }
                else if(num == 27) // エッジ
                {
                    var mses = calculateGearMSE(origImg, imgData, false, isGame);
                    for(var j = 0; j < 3; j++)
                    {
                        if(mses[0][j] <= 6500) continue;// 境目の定数(ギア開けしていない場所)

                        minMainGearMSE[j] = 0;
                        minMainGearNumber[j] = 0;
                    }
                    for(var j = 0; j < 9; j++)
                    {
                        if(mses[1][j] <= 6500) continue;

                        minSubGearMSE[j] = 0;
                        minSubGearNumber[j] = 0;
                    }
                }
                else
                {
                    var targetMainGearNumber = num <= 18 ? 0 : num <= 23 ? 1 : 2;
                    var mse = calculateGearMSE(origImg, imgData, true, isGame, targetMainGearNumber);
                    if(mse < minMainGearMSE[targetMainGearNumber])
                    {
                        minMainGearMSE[targetMainGearNumber] = mse;
                        minMainGearNumber[targetMainGearNumber] = num;
                    }
                }

                gearCount++;
                if(gearCount < 28) return;

                // console.log(performance.now() - startTime);
                // selectの名前を1~にしたの割と後悔してる
                // ga27はギア開けしていない場合の表示なので、unknownに変更する
                for(var j = 1; j <= 3; j++)
                    $('[name=mainGear' + j + ']').val(minMainGearNumber[j - 1] == 27 ? 0 : minMainGearNumber[j - 1]).change();
                for(var j = 1; j <= 9; j++)
                    $('[name=subGear' + j + ']').val(minSubGearNumber[j - 1] == 27 ? 0 : minSubGearNumber[j - 1]).change();

                // モーダル解除
                $("#modalCheck").prop('checked', false).change();
            };
            img.src = isGame ? "assets/images/g" + i + ".png" : "assets/images/ga" + i + ".png";
        }
    }

    // ゲーム内画像
    var weaponPos1 = [269, 562, 369, 662];
    var mainGearPos1 = 
    [
        [402, 663, 439, 700],
        [547, 663, 584, 700],
        [692, 663, 729, 700]
    ];
    var subGearPos1 = 
    [
        [439, 673, 467, 700],
        [468, 673, 496, 700],
        [496, 673, 524, 700],
        [584, 673, 612, 700],
        [613, 673, 641, 700],
        [641, 673, 669, 700],
        [729, 673, 757, 700],
        [758, 673, 786, 700],
        [786, 673, 814, 700]
    ];

    // アプリ内画像(width,height共に1000の場合)
    var weaponPos2 = [320, 165, 681, 396];
    var mainGearPos2 = 
    [
        [437,547,550,621],
        [437,699,550,773],
        [437,851,550,925]
    ];
    var subGearPos2 = 
    [
        [566,560,641,609],
        [657,560,732,609],
        [748,560,823,609],
        [566,712,641,761],
        [657,712,732,761],
        [748,712,823,761],
        [566,864,641,913],
        [657,864,732,913],
        [748,864,823,913]
    ];

    // 定数あり
    function calculateMSE(origImg, weaponImg, origImgPos, c = 0, skipNum = 1, skipGray = false)
    {
        var mse = 0;

        for(var i = origImgPos[0]; i <= origImgPos[2]; i+=skipNum)
        {
            var rateX = (i - origImgPos[0]) / (origImgPos[2] - origImgPos[0]);
            for(var j = origImgPos[1]; j <= origImgPos[3]; j+=skipNum)
            {
                var rateY = (j - origImgPos[1]) / (origImgPos[3] - origImgPos[1]);

                var weaponColor = getColorFromRate(weaponImg, rateX, rateY);
                // 灰色部分はカット
                var index = (i + j * origImg.width) * 4;
                if(skipGray && 120 <= origImg.data[index] && origImg.data[index] <= 140 &&
                    120 <= origImg.data[index + 1] && origImg.data[index + 1] <= 140 &&
                    120 <= origImg.data[index + 2] && origImg.data[index + 2] <= 140) continue;
                // 透明部分はカット
                if(weaponColor[3] == 0) continue;

                for(var k = 0; k < 3; k++) // RGBだけのMSE
                    mse += Math.pow(origImg.data[index + k] - weaponColor[k], 2);

                // 一致しているピクセルが多い方がヒットしやすくするため（デコなど）定数を引く(定数部分適当すぎワロタ)
                mse -= c;
            }
        }

        return mse / (origImgPos[2] - origImgPos[0]) / (origImgPos[3] - origImgPos[1]);
    }

    // isOnlyMainGear == false の場合は二次元配列([0][x] = main gear mse, [1][x] = sub gear mse)を返す
    // trueの場合は、指定されたmainGearのmseを返す
    function calculateGearMSE(origImg, gearImg, isOnlyMainGear, isGame, mainGearNumber = 0)
    {
        if(isOnlyMainGear)
        {
            if(isGame)
                return calculateMSE(origImg, gearImg, mainGearPos1[mainGearNumber]);
            else
                return calculateMSE(origImg, gearImg, mainGearPos2[mainGearNumber], 1, 4);
        }

        var ans = [new Array(3), new Array(9)];
        for(var i = 0; i < 3; i++)
        {
            if(isGame)
                ans[0][i] = calculateMSE(origImg, gearImg, mainGearPos1[i]);
            else
                ans[0][i] = calculateMSE(origImg, gearImg, mainGearPos2[i], 1, 4);
        }
        for(var i = 0; i < 9; i++)
        {
            if(isGame)
                ans[1][i] = calculateMSE(origImg, gearImg, subGearPos1[i]);
            else
                ans[1][i] = calculateMSE(origImg, gearImg, subGearPos2[i], 1, 4);
        }

        return ans;
    }

    function getColorFromRate(img, x, y)
    {
        if(x < 0 || x > 1 || y < 0 || y > 1) 
            return null;

        var posX = (img.width - 1) * x;
        var posY = (img.height - 1) * y;
        var floorX = Math.floor(posX);
        var floorY = Math.floor(posY);
        var rateX = posX - floorX;
        var rateY = posY - floorY;

        var index = [(floorX + floorY * img.width) * 4, (floorX + 1 + floorY * img.width) * 4,
                     (floorX + (floorY + 1) * img.width) * 4, (floorX + 1 + (floorY + 1) * img.width) * 4];
        // 境界の処理
        if(x == 1)
        {
            index[1] -= 4;
            index[3] -= 4;
        }
        if(y == 1)
        {
            index[2] -= img.width * 4;
            index[3] -= img.width * 4;
        }
        var rate = [(1 - rateX) * (1 - rateY), rateX * (1 - rateY), 
                    (1 - rateX) * rateY, rateX * rateY];

        var ans = new Array(4);
        for(var i = 0; i < 4; i++) // 色のループ
        {
            ans[i] = 0;
            for(var j = 0; j < 4; j++) // indexとrateのループ(周囲4つの色から取る)
                ans[i] += img.data[index[j] + i] * rate[j];
        }

        return ans;
    }
}