let mainWeaponData = null;
let subWeaponData = null;
let beforeWeapon;
let beforeMain = new Array(3);
let beforeSub = new Array(9);

function updateDataDisplay()
{
    if(mainWeaponData == null || subWeaponData == null) return;

    var weapon = $('#weaponSelect').val();
    if(!(0 <= weapon && weapon <= 138) || weapon == null) return;

    var main = new Array(3);
    var sub = new Array(9);
    for(var i = 1; i <= 3; i++)
        main[i - 1] = $('select[name=mainGear' + i + ']').val();
    for(var i = 1; i <= 9; i++)
        sub[i - 1] = $('select[name=subGear' + i + ']').val();

    if(weapon == beforeWeapon && JSON.stringify(main) == beforeMain && JSON.stringify(sub) == beforeSub) return;
    beforeWeapon = weapon;
    beforeMain = JSON.stringify(main);
    beforeSub = JSON.stringify(sub);

    var mainWeapon = mainWeaponData[weapon];
    var subWeapon = subWeaponData[mainWeapon.SW];
    var gear = Splat2Data.calculateGearAmount(main, sub);
    
    $("#mainConsume").html(Splat2Data.getMainWeaponInkDetailString(mainWeapon, gear[1]));
    var subInkConsume = Splat2Data.calculateSubInkSaveUp(subWeapon.SIC, subWeapon.SISL, gear[2])
    $("#subConsume").text((subInkConsume*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/subInkConsume) + " 連投可能)");
    var inkRecovery = Splat2Data.calculateInkRecoveryUp(mainWeapon.ITC, gear[3]);
    $("#inkRecovery").html("インク潜伏中 : " + (inkRecovery[0]/60).toFixed(2) + " 秒 ( " + inkRecovery[0] + " F)<br>"
                        + "通常時 : " + (inkRecovery[1]/60).toFixed(2) + " 秒 ( " + inkRecovery[1] + " F)");
    $("#mainDamage").html(Splat2Data.getMainWeaponPowerUpDetailString(mainWeapon, gear[14]));
    $("#subDamage").html(Splat2Data.getSubWeaponPowerUpDetailString(subWeapon));
    var squidVelocity = Splat2Data.calculateSquidDashVelocity(mainWeapon.MC, gear[19]==10, gear[5]);
    $("#squidVelocity").html((squidVelocity * 60 / 50).toFixed(2) + " 本/秒 ( " + (squidVelocity / 50).toFixed(2) + " 本/F)<br>" +
                            "10本移動にかかる時間 : " + (500/squidVelocity/60).toFixed(2) + " 秒 ( " + (500/squidVelocity).toFixed() + " F)" + 
                            "<br><br>※1本 = 試し撃ち場の1ライン");
    var humanVelocity = Splat2Data.calculateHumanVelocity(mainWeapon.MC, gear[4]);
    $("#humanVelocity").html((humanVelocity * 60 / 50).toFixed(2) + " 本/秒 ( " + (humanVelocity / 50).toFixed(2) + " 本/F)<br>" +
                            "10本移動にかかる時間 : " + (500/humanVelocity/60).toFixed(2) + " 秒 ( " + (500/humanVelocity).toFixed() + " F)" + 
                            "<br><br>※1本 = 試し撃ち場の1ライン");
    var specialCost = Splat2Data.calculateSpecialIncreaseUp(mainWeapon.SC, gear[6]);
    $("#specialRequiredPoints").html(specialCost + " P" + "<br><br>※ルールごとのスペシャルゲージ自動増加はこれに影響しない");
    var specialDecreseRate = Splat2Data.calculateSpecialDecreaseDown(gear[22] == 10, gear[7]);
    $("#specialDecreaseRate").text(specialDecreseRate.toFixed(2) + " %");
    var revivalTime = Splat2Data.calculateRespawnTimeSave(gear[22] == 10, gear[9]);
    $("#revivalTime").text((revivalTime/60).toFixed(2) + " 秒 ( " + revivalTime + " F)");
    var superJumpTime = Splat2Data.calculateSuperJumpTimeSave(gear[10]);
    $("#superJumpTime").text((superJumpTime/60).toFixed(2) + " 秒 ( " + superJumpTime + " F)");
    var oppositeEffects = Splat2Data.calculateOppositeInkEffectReduction(gear[12]);
    $("#slipDamage").text((oppositeEffects[0]/10).toFixed(1) + " ダメージ/F");
    $("#slipInvalidTime").text((oppositeEffects[1]/60).toFixed(2) + " 秒 ( " + oppositeEffects[1] + " F)")

    return [mainWeapon.SW, mainWeapon.SpW];
}

$(document).ready(function()
{
    var req1 = new XMLHttpRequest();
    req1.onreadystatechange = function() 
    {
        if(req1.readyState == 4 && req1.status == 200)
            mainWeaponData = JSON.parse(req1.responseText);
    };
    req1.open("GET", "assets/data/MainWeaponData", false);
    req1.send(null);
    
    var req2 = new XMLHttpRequest();
    req2.onreadystatechange = function() 
    {
        if(req2.readyState == 4 && req2.status == 200)
            subWeaponData = JSON.parse(req2.responseText);
    };
    req2.open("GET", "assets/data/SubWeaponData", false);
    req2.send(null);
});

class Splat2Data
{
    static calculateGearAmount(main, sub)
    {
        var gearAmount = new Array(27).fill(0);
        for(var i = 0; i < 3; i++)
            gearAmount[main[i]] += 10;

        for(var i = 0; i < 9; i++)
            gearAmount[sub[i]] += 3;

        return gearAmount;
    }

    // 自身のGearManager(リリースしてない)のC#コードから移植
    static calculateMainInkSaveUp(mainInkConsume, inksaverType, gearAmount)
    {
        var constA = [0.4, 0.45, 0.5];
        var constB = [1, 1, Math.log(0.6) / Math.log(0.5)];
        return mainInkConsume * (1 - constA[inksaverType] * Math.pow(-0.00027 * Math.pow(gearAmount, 2) + 0.033 * gearAmount, constB[inksaverType]));
    }

    static calculateSubInkSaveUp(subInkConsume, inksaverType, gearAmount)
    {
        var constA = [0.2, 0.3, 0.35, 0.4];
        return subInkConsume * (1 - constA[inksaverType] * (-0.00027 * Math.pow(gearAmount, 2) + 0.033 * gearAmount));
    }

    static calculateInkRecoveryUp(inkTankCapacity, gearAmount)
    {
        return [Math.floor(inkTankCapacity * (180 - 63 * (-0.00027 * Math.pow(gearAmount, 2) + 0.033 * gearAmount))),
            Math.floor(inkTankCapacity * (600 - 380 * (-0.00027 * Math.pow(gearAmount, 2) + 0.033 * gearAmount)))];
    }

    static calculateMainWeaponDamage(baseDamage, damageMagnification, maxDamage, gearAmount)
    {
        var res = Math.floor((baseDamage * damageMagnification - baseDamage) * (-0.00027 * Math.pow(gearAmount, 2) + 0.033 * gearAmount) + baseDamage);
        return baseDamage < maxDamage && maxDamage < res ? maxDamage : res;
    }

    // 射撃中の速度を算出するならMoveSpeed参照
    static calculateHumanVelocity(weaponWeightType, gearAmount)
    {
        var constA = [0.56, 0.48, 0.4];
        var constB = [0.88, 0.96, 1.04];
        return constB[weaponWeightType] + constA[weaponWeightType] * (-0.00027 * Math.pow(gearAmount, 2) + 0.033 * gearAmount);
    }

    static calculateSquidDashVelocity(weaponWeightType, isNinja, gearAmount)
    {
        var constA = [1.728, 1.92, 2.016];
        var constB = [0.672, 0.48, 0.384];
        var gearEffect = constB[weaponWeightType] * (-0.00027 * Math.pow(gearAmount, 2) + 0.033 * gearAmount);
        return isNinja
            ? (constA[weaponWeightType] + gearEffect * 0.8) * 0.9
            : constA[weaponWeightType] + gearEffect;
    }

    static calculateSpecialIncreaseUp(specialCost, gearAmount)
    {
        var x = (0.99 * gearAmount - Math.pow(0.09 * gearAmount, 2)) / 100;
        return Math.round(specialCost / (1 + x)); // Roundでいいのかわからない　切り捨て？
    }

    // 相手が復ペナアップを付けている場合は考慮していない
    static calculateSpecialDecreaseDown(isPenaltyUp, gearAmount)
    {
        return 50 + (isPenaltyUp ? 22.5 : 0) - 50 * Math.pow(-0.00027 * Math.pow(gearAmount, 2) + 0.033 * gearAmount, Math.log(0.6) / Math.log(0.5));
    }

    static calculateRespawnTimeSave(isPenaltyUp, gearAmount)
    {
        var constA = isPenaltyUp ? 70 : 0;
        var constB = 1;
        var X = Math.floor(90 + constA - 60 * (-0.00027 * Math.pow(gearAmount * constB, 2) + 0.033 * (gearAmount * constB)));
        var Y = Math.floor(270 - 180 * (-0.00027 * Math.pow(gearAmount * constB, 2) + 0.033 * (gearAmount * constB)));
        return X + Y + 150;
    }

    // 人状態からのジャンプは無視
    static calculateSuperJumpTimeSave(gearAmount)
    {
        var X = 1;
        var Y = Math.floor(80 - 60 * Math.pow(0.033 * gearAmount - 0.00027 * Math.pow(gearAmount, 2), Math.log(0.75) / Math.log(0.5)));
        var Z = Math.floor(138 - 41.4 * Math.pow(0.033 * gearAmount - 0.00027 * Math.pow(gearAmount, 2), Math.log(19 / 138) / Math.log(0.5)));
        return X + Y + Z;
    }

    static calculateOppositeInkEffectReduction(gearAmount)
    {
        return [Math.floor(3 - 1.5 * (0.033 * gearAmount - 0.00027 * Math.pow(gearAmount, 2))), 
                Math.floor(39 * Math.pow(0.033 * gearAmount - 0.00027 * Math.pow(gearAmount, 2), Math.log(2 / 3) / Math.log(0.5)))];
    }
    
    static getMainWeaponInkDetailString(mainWeapon, gearAmount)
    {
        var mainInkConsume1 = this.calculateMainInkSaveUp(mainWeapon.MIC1, mainWeapon.ISL, gearAmount);
        var mainInkConsume2 = this.calculateMainInkSaveUp(mainWeapon.MIC2, mainWeapon.ISL, gearAmount);

        var res;
        // ifでやった方がよさそう
        switch (mainWeapon.WT)
        {
            case "Shooter":
                res = (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 発射撃可能)";
                break;
            case "Shooter2":
                res = "単発 : " +
                        (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 発射撃可能)";
                res += "<br>連射 : " +
                        (mainInkConsume2*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " 発射撃可能)";
                break;
            case "Blaster":
                res = (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 発射撃可能)";
                break;
            case "Blaster2":
                res = (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 発射撃可能)";
                break;
            case "Roller":
                res = "振り : " +
                        (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 回使用可能)";
                //res += "<br>轢き : " +
                //        (mainInkConsume2*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " F使用可能)";
                break;
            case "Roller2":
                res = "振り : " +
                        (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 回使用可能)";
                //res += "<br>轢き : " +
                //        (mainInkConsume2*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " F使用可能)";
                break;
            case "Brush":
                res = "振り : " +
                        (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 回使用可能)";
                //res += "<br>轢き : " +
                //        (mainInkConsume2*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " F使用可能)";
                break;
            case "Charger":
                res = "フルチャージ : " +
                        (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 発射撃可能)";
                res += "<br>ノンチャージ : " +
                        (mainInkConsume2*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " 発射撃可能)";
                break;
            case "Slosher":
                res = (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 発射撃可能)";
                break;
            case "Slosher2":
                res = (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 発射撃可能)";
                break;
            case "Slosher3":
                res = (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 発射撃可能)";
                break;
            case "Splatling":
                res = "フルチャージ : " + (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 回射撃可能)";
                break;
            case "Splatling2":
                res = "フルチャージ : " + (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 回射撃可能)";
                break;
            case "Splatling3":
                res = "フルチャージ : " + (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 回射撃可能)";
                break;
            case "Dualie":
                res = "射撃 : " + 
                        (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 発射撃可能)";
                res += "<br>スライド : " +
                        (mainInkConsume2*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " 回スライド可能)";
                break;
            case "Dualie2":
                res = "射撃 : " + 
                        (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 発射撃可能)";
                res += "<br>スライド : " +
                        (mainInkConsume2*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " 回スライド可能)";
                break;
            case "Umbrella":
                res = "射撃 : " +
                        (mainInkConsume1*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " 発射撃可能)";
                res += "<br>パージ : " +
                        (mainInkConsume2*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " 回パージ可能)";
                break;
        }
        
        return res;
    }

    static getMainWeaponPowerUpDetailString(mainWeapon, gearAmount)
    {
        var res;
        switch (mainWeapon.WT)
        {
            case "Shooter":
                res = (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Shooter2":
                res = "単発 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>連射 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Blaster":
                res = "直撃 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>爆風 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Blaster2":
                res = "直撃 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>近爆風 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>遠爆風 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD3, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Roller":
                res = "振りダメージ : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>轢きダメージ : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Roller2":
                res = "横振り : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>縦振り : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD3, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>轢きダメージ : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Brush":
                res = "振りダメージ : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>轢きダメージ : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Charger":
                res = "フルチャージ : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>ノンチャージ : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Slosher":
                res = "メインウェポンダメージ : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Slosher2":
                res = "直撃 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>掠り : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Slosher3":
                res = "直撃 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>爆風 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Splatling":
                res = (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Splatling2":
                res = "フルチャージ : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>半チャージ : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR2, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Splatling3":
                res = "長射程モード : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>短射程モード : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR2, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Dualie":
                res = (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Dualie2":
                res = "立ち射撃 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>スライド射撃 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
            case "Umbrella":
                res = "全弾 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD2, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                res += "<br>飛沫 : " +
                       (this.calculateMainWeaponDamage(mainWeapon.BD1, mainWeapon.MWDUR1, mainWeapon.MWDUM, gearAmount) / 10).toFixed(1) + " ダメージ";
                break;
        }
        
        return res;
    }

    static getSubWeaponPowerUpDetailString(subWeapon)
    {
        var res;
        if(0 <= subWeapon.SW && subWeapon.SW <= 5)
        {
            res = "近爆風 : " + (subWeapon.BD1/10).toFixed(1) + " ダメージ<br>";
            res += "遠爆風 : " + (subWeapon.BD2/10).toFixed(1) + " ダメージ";
            if(subWeapon.SW == 2)
                res += "<br>直撃 : " + ((subWeapon.BD1 + subWeapon.BD3)/10).toFixed(1) + " ダメージ";
            else if(subWeapon.SW == 3)
                res += "<br>接触 : " + (subWeapon.BD3/10).toFixed(1) + " ダメージ";
        }
        else if(subWeapon.SW == 6)
        {
            res = "飛沫 : " + (subWeapon.BD1/10).toFixed(1) + " ダメージ";
        }
        else if(subWeapon.SW == 7 || subWeapon.SW == 8 || subWeapon.SW == 10)
        {
            res = "ダメージ判定無し";
        }
        else if(subWeapon.SW == 9)
        {
            res = "接触 : " + (subWeapon.BD1/10).toFixed(1);
        }
        else if(subWeapon.SW == 11)
        {
            res = "近爆風(1爆発) : " + (subWeapon.BD1/10).toFixed(1) + " ダメージ<br>";
            res += "遠爆風(1爆発)" + (subWeapon.BD2/10).toFixed(1) + " ダメージ";
        }
        else if(subWeapon.SW == 12)
        {
            res = "直撃(探査済み状態) : " + (subWeapon.BD1/10).toFixed(1) + " ダメージ<br>";
            res += "散弾(1爆発) : " + (subWeapon.BD3/10).toFixed(1) + " ダメージ<br>";
            res += "散弾数 : " + (subWeapon.BD4/subWeapon.BD3).toFixed() + " 個<br>";
            res += "爆風(探査失敗状態) : " + (subWeapon.BD2/10).toFixed(1) + " ダメージ";
        }

        return res;
    }
}