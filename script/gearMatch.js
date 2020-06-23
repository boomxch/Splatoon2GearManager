// 自身のGearManager(リリースしてない)のC#コードから移植
// いちいち全ての武器画像やギア画像をキャッシュせずに取ってくるのは、ユーザがそんな頻繁にこの機能を使わないだろうという憶測から
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
                
                gearMatch(ctx.getImageData(0, 0, canvas.width, canvas.height));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
});

let weaponCount;
let minWeaponNumber;
let minWeaponMSE;
let gearCount;
let minMainGearNumber = new Array(3);
let minMainGearMSE;
let minSubGearNumber = new Array(9);
let minSubGearMSE;

function gearMatch(origImg)
{
    weaponCount = 0;
    minWeaponMSE = Number.MAX_VALUE;
    gearCount = 0;
    minMainGearMSE = new Array(3).fill(Number.MAX_VALUE);
    minSubGearMSE = new Array(9).fill(Number.MAX_VALUE);

    for(var i = 0; i <= 138; i++)
    {
        var img = new Image();
        img.onload = function()
        {
            var canvas = document.createElement("canvas");
            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);
            
            var mse = calculateMSE(origImg, ctx.getImageData(0, 0, canvas.width, canvas.height), weaponPos, 30000);
            if(mse < minWeaponMSE)
            {
                minWeaponMSE = mse;
                minWeaponNumber = this.src.match(".+/(.+?)\.[a-z]+$")[1]; // 武器番号をソースから取ってくる
            }

            // 全ての武器を捜査したらMSEが最低値を示したものを表示する
            weaponCount++;
            if(weaponCount < 139) return;

            $('[name=weaponSelect]').val(minWeaponNumber).change();
        };
        img.src = "assets/images/" + i + ".png";
    }

    // ギア画像 + エッジ
    for(var i = 0; i <= 27; i++)
    {
        var img = new Image();
        img.onload = function()
        {
            var canvas = document.createElement("canvas");
            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);

            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var num = this.src.match(".+/(.+?)\.[a-z]+$")[1].substring(1);
            if(num <= 14) // all
            {
                var mses = calculateGearMSE(origImg, imgData, false); // 二次元配列
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
                var mses = calculateGearMSE(origImg, imgData, false);
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
                var mse = calculateGearMSE(origImg, imgData, true, targetMainGearNumber);
                if(mse < minMainGearMSE[targetMainGearNumber])
                {
                    minMainGearMSE[targetMainGearNumber] = mse;
                    minMainGearNumber[targetMainGearNumber] = num;
                }
            }

            gearCount++;
            if(gearCount < 28) return;

            // selectの名前を1~にしたの割と後悔してる
            for(var j = 1; j <= 3; j++)
                $('[name=mainGear' + j + ']').val(minMainGearNumber[j - 1]).change();
            for(var j = 1; j <= 9; j++)
                $('[name=subGear' + j + ']').val(minSubGearNumber[j - 1]).change();
            
            // モーダル解除
            $("#modalCheck").prop('checked', false).change();
        };
        img.src = "assets/images/g" + i + ".png";
    }
}

const weaponPos = [269, 562, 369, 662];
const mainGearPos = 
[
    [402, 663, 439, 700],
    [547, 663, 584, 700],
    [692, 663, 729, 700]
];
const subGearPos = 
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

// 定数あり
function calculateMSE(origImg, weaponImg, origImgPos, c = 0)
{
    var mse = 0;
    
    for(var i = origImgPos[0]; i <= origImgPos[2]; i++)
    {
        var rateX = (i - origImgPos[0]) / (origImgPos[2] - origImgPos[0]);
        for(var j = origImgPos[1]; j <= origImgPos[3]; j++)
        {
            var rateY = (j - origImgPos[1]) / (origImgPos[3] - origImgPos[1]);

            var weaponColor = getColorFromRate(weaponImg, rateX, rateY);
            // 透明部分はカット
            if(weaponColor[3] == 0) continue;

            for(var k = 0; k < 3; k++) // RGBだけのMSE
                mse += Math.pow(origImg.data[(i + j * origImg.width) * 4 + k] - weaponColor[k], 2);
                
            // 一致しているピクセルが多い方がヒットしやすくするため（デコなど）定数を引く(定数部分適当すぎワロタ)
            mse -= c;
        }
    }
    
    return mse / (origImgPos[2] - origImgPos[0]) / (origImgPos[3] - origImgPos[1]);
}

// isOnlyMainGear == false の場合は二次元配列([0][x] = main gear mse, [1][x] = sub gear mse)を返す
// trueの場合は、指定されたmainGearのmseを返す
function calculateGearMSE(origImg, gearImg, isOnlyMainGear, mainGearNumber = 0)
{
    if(isOnlyMainGear)
        return calculateMSE(origImg, gearImg, mainGearPos[mainGearNumber]);

    var ans = [new Array(3), new Array(9)];
    for(var i = 0; i < 3; i++)
        ans[0][i] = calculateMSE(origImg, gearImg, mainGearPos[i]);
    for(var i = 0; i < 9; i++)
        ans[1][i] = calculateMSE(origImg, gearImg, subGearPos[i]);
    
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