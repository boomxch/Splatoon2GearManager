let mainWeaponData = null;
let subWeaponData = null;

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

    var isCompare = $('#compareLabel').prop('checked');
    var compareGear;
    if(isCompare)
    {
        var compareMain = new Array(3);
        var compareSub = new Array(9);
        for(var i = 1; i <= 3; i++)
            compareMain[i - 1] = $('select[name=mainGear' + i + 'C]').val();
        for(var i = 1; i <= 9; i++)
            compareSub[i - 1] = $('select[name=subGear' + i + 'C]').val();

        compareGear = Splat2Data.calculateGearAmount(compareMain, compareSub);
    }

    var mainWeapon = mainWeaponData[weapon];
    var subWeapon = subWeaponData[mainWeapon.SW];
    var gear = Splat2Data.calculateGearAmount(main, sub);
    
    if(!isCompare)
    {
        $("#mainConsume").html(Splat2Data.getMainWeaponInkDetailString(mainWeapon, gear[1]));
        var subInkConsume = Splat2Data.calculateSubInkSaveUp(subWeapon.SIC, subWeapon.SISL, gear[2]);
        $("#subConsume").text((subInkConsume*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/subInkConsume) + " 連投可能　連投後メイン " + 
                                Math.floor((mainWeapon.ITC%subInkConsume)/Splat2Data.calculateMainInkSaveUp(mainWeapon.MIC[0], mainWeapon.ISL, gear[1])) + "" + Splat2Data.getMainWeaponSuffixString(mainWeapon.WT)+ ")");
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
        $("#runningHumanVelocity").html(Splat2Data.getRunningHumanVelocityDetailString(mainWeapon, gear[4]));
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
        $("#slipInvalidTime").text((oppositeEffects[1]/60).toFixed(2) + " 秒 ( " + oppositeEffects[1] + " F)");
    }
    else
    {
        $("#mainConsume").html(Splat2Data.getMainWeaponInkDetailString(mainWeapon, gear[1], compareGear[1]));
        
        var subInkConsume = Splat2Data.calculateSubInkSaveUp(subWeapon.SIC, subWeapon.SISL, gear[2]);
        var compSIC = Splat2Data.calculateSubInkSaveUp(subWeapon.SIC, subWeapon.SISL, compareGear[2]);
        var compPercentage = generateCompareText(((subInkConsume*100).toFixed(2) - (compSIC*100).toFixed(2)).toFixed(2), gear[2] >= compareGear[2], "%");
        var compCount = generateCompareText(Math.floor(mainWeapon.ITC/subInkConsume) - Math.floor(mainWeapon.ITC/compSIC), gear[2] >= compareGear[2], "");
        var mainCount = Math.floor((mainWeapon.ITC%subInkConsume)/Splat2Data.calculateMainInkSaveUp(mainWeapon.MIC[0], mainWeapon.ISL, gear[1]));
        var compMainCount = Math.floor((mainWeapon.ITC%compSIC)/Splat2Data.calculateMainInkSaveUp(mainWeapon.MIC[0], mainWeapon.ISL, compareGear[1]));
        var compMain = generateCompareText(mainCount - compMainCount, mainCount >= compMainCount, "");
        $("#subConsume").html((subInkConsume*100).toFixed(2) + "% "+compPercentage+" (合計 " + Math.floor(mainWeapon.ITC/subInkConsume) + compCount + " 連投可能　連投後メイン " + 
                                mainCount + compMain + Splat2Data.getMainWeaponSuffixString(mainWeapon.WT)+ ")");
        
        var inkRecovery = Splat2Data.calculateInkRecoveryUp(mainWeapon.ITC, gear[3]);
        var compIR = Splat2Data.calculateInkRecoveryUp(mainWeapon.ITC, compareGear[3]);
        var compSquid1 = generateCompareText(((inkRecovery[0]/60).toFixed(2) - (compIR[0]/60).toFixed(2)).toFixed(2), gear[3] >= compareGear[3], "秒");
        var compSquid2 = generateCompareText(inkRecovery[0] - compIR[0], gear[3] >= compareGear[3], "F");
        var compHuman1 = generateCompareText(((inkRecovery[1]/60).toFixed(2) - (compIR[1]/60).toFixed(2)).toFixed(2), gear[3] >= compareGear[3], "秒");
        var compHuman2 = generateCompareText(inkRecovery[1] - compIR[1], gear[3] >= compareGear[3], "F");
        $("#inkRecovery").html("インク潜伏中 : " + (inkRecovery[0]/60).toFixed(2) + " 秒"+compSquid1+" ( " + inkRecovery[0] + " F"+compSquid2+")<br>"
                            + "通常時 : " + (inkRecovery[1]/60).toFixed(2) + " 秒"+compHuman1+" ( " + inkRecovery[1] + " F"+compHuman2+")");
        
        $("#mainDamage").html(Splat2Data.getMainWeaponPowerUpDetailString(mainWeapon, gear[14], compareGear[14]));

        $("#subDamage").html(Splat2Data.getSubWeaponPowerUpDetailString(subWeapon));

        var squidVelocity = Splat2Data.calculateSquidDashVelocity(mainWeapon.MC, gear[19]==10, gear[5]);
        var compSV = Splat2Data.calculateSquidDashVelocity(mainWeapon.MC, compareGear[19]==10, compareGear[5]);
        var compSV1 = generateCompareText(((squidVelocity * 60 / 50).toFixed(2) - (compSV * 60 / 50).toFixed(2)).toFixed(2), squidVelocity >= compSV, "");
        var compSV2 = generateCompareText(((squidVelocity / 50).toFixed(2) - (compSV / 50).toFixed(2)).toFixed(2), squidVelocity >= compSV, "");
        var compSV3 = generateCompareText(((500 / squidVelocity / 60).toFixed(2) - (500 / compSV / 60).toFixed(2)).toFixed(2), squidVelocity >= compSV, "秒");
        var compSV4 = generateCompareText(((500 / squidVelocity).toFixed() - (500 / compSV).toFixed()).toFixed(), squidVelocity >= compSV, "F");
        $("#squidVelocity").html((squidVelocity * 60 / 50).toFixed(2) + compSV1 + " 本/秒 ( " + (squidVelocity / 50).toFixed(2) + compSV2 + " 本/F)<br>" +
                                "10本移動にかかる時間 : " + (500 / squidVelocity / 60).toFixed(2) + " 秒" + compSV3 + " ( " + (500 / squidVelocity).toFixed() + " F" + compSV4 + ")" + 
                                "<br><br>※1本 = 試し撃ち場の1ライン");

        var humanVelocity = Splat2Data.calculateHumanVelocity(mainWeapon.MC, gear[4]);
        var compHV = Splat2Data.calculateHumanVelocity(mainWeapon.MC, compareGear[4]);
        var compHV1 = generateCompareText(((humanVelocity * 60 / 50).toFixed(2) - (compHV * 60 / 50).toFixed(2)).toFixed(2), gear[4] >= compareGear[4], "");
        var compHV2 = generateCompareText(((humanVelocity / 50).toFixed(2) - (compHV / 50).toFixed(2)).toFixed(2), gear[4] >= compareGear[4], "");
        var compHV3 = generateCompareText(((500 / humanVelocity / 60).toFixed(2) - (500 / compHV / 60).toFixed(2)).toFixed(2), gear[4] >= compareGear[4], "秒");
        var compHV4 = generateCompareText(((500 / humanVelocity).toFixed() - (500 / compHV).toFixed()).toFixed(), gear[4] >= compareGear[4], "F");
        $("#humanVelocity").html((humanVelocity * 60 / 50).toFixed(2) + compHV1 + " 本/秒 ( " + (humanVelocity / 50).toFixed(2) + compHV2 + " 本/F)<br>" +
                                "10本移動にかかる時間 : " + (500 / humanVelocity / 60).toFixed(2) + " 秒" + compHV3 + " ( " + (500 / humanVelocity).toFixed() + " F" + compHV4 + ")" + 
                                "<br><br>※1本 = 試し撃ち場の1ライン");

        $("#runningHumanVelocity").html(Splat2Data.getRunningHumanVelocityDetailString(mainWeapon, gear[4], compareGear[4]));

        var specialCost = Splat2Data.calculateSpecialIncreaseUp(mainWeapon.SC, gear[6]);
        var compSC = Splat2Data.calculateSpecialIncreaseUp(mainWeapon.SC, compareGear[6]);
        $("#specialRequiredPoints").html(specialCost + " P" +generateCompareText(specialCost - compSC, gear[6] >= compareGear[6], "P")+ "<br><br>※ルールごとのスペシャルゲージ自動増加はこれに影響しない");

        var specialDecreseRate = Splat2Data.calculateSpecialDecreaseDown(gear[22] == 10, gear[7]);
        var compSDR = Splat2Data.calculateSpecialDecreaseDown(compareGear[22] == 10, compareGear[7]);
        $("#specialDecreaseRate").html(specialDecreseRate.toFixed(2) + " %" + generateCompareText((specialDecreseRate - compSDR).toFixed(2), specialDecreseRate - compSDR <= 0, "%"));

        var revivalTime = Splat2Data.calculateRespawnTimeSave(gear[22] == 10, gear[9]);
        var compRT = Splat2Data.calculateRespawnTimeSave(compareGear[22] == 10, compareGear[9]);
        var compRT1 = generateCompareText(((revivalTime / 60).toFixed(2) - (compRT / 60).toFixed(2)).toFixed(2), revivalTime - compRT <= 0, "秒");
        var compRT2 = generateCompareText(revivalTime - compRT, revivalTime - compRT <= 0, "F");
        $("#revivalTime").html((revivalTime/60).toFixed(2) + " 秒" + compRT1 + " ( " + revivalTime + " F" + compRT2 + ")");

        var superJumpTime = Splat2Data.calculateSuperJumpTimeSave(gear[10]);
        var compSJT = Splat2Data.calculateSuperJumpTimeSave(compareGear[10]);
        var compSJT1 = generateCompareText(((superJumpTime / 60).toFixed(2) - (compSJT / 60).toFixed(2)).toFixed(2), gear[10] >= compareGear[10], "秒");
        var compSJT2 = generateCompareText(superJumpTime - compSJT, gear[10] >= compareGear[10], "F");
        $("#superJumpTime").html((superJumpTime / 60).toFixed(2) + " 秒" + compSJT1 + " ( " + superJumpTime + " F" + compSJT2 + ")");

        var oppositeEffects = Splat2Data.calculateOppositeInkEffectReduction(gear[12]);
        var compOE = Splat2Data.calculateOppositeInkEffectReduction(compareGear[12]);
        var compOE1 = generateCompareText(((oppositeEffects[0] / 10).toFixed(1) - (compOE[0] / 10).toFixed(1)).toFixed(1), gear[12] >= compareGear[12], "");
        var compOE2 = generateCompareText(((oppositeEffects[1] / 60).toFixed(2) - (compOE[1] / 60).toFixed(2)).toFixed(2), gear[12] >= compareGear[12], "秒");
        var compOE3 = generateCompareText(oppositeEffects[1] - compOE[1], gear[12] >= compareGear[12], "F");
        $("#slipDamage").html((oppositeEffects[0] / 10).toFixed(1) + compOE1 + " ダメージ/F");
        $("#slipInvalidTime").html((oppositeEffects[1] / 60).toFixed(2) + " 秒" + compOE2 + " ( " + oppositeEffects[1] + " F" + compOE3 + ")");
    }

    return [mainWeapon.SW, mainWeapon.SpW];
}

function generateCompareText(number, isBetter, suffix)
{
    if(number == 0)
        return "(<span class='better'>±" + number + suffix + "</span>)";

    var cl = isBetter ? "better" : "worse";
    var plusSign = number > 0 ? "+" : "";
    
    return "(<span class='"+ cl + "'>" + plusSign + number + suffix + "</span>)";
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

    static calculateHumanVelocity(weaponWeightType, gearAmount)
    {
        var constA = [0.56, 0.48, 0.4];
        var constB = [0.88, 0.96, 1.04];
        return constB[weaponWeightType] + constA[weaponWeightType] * (-0.00027 * Math.pow(gearAmount, 2) + 0.033 * gearAmount);
    }

    static calculateRunningHumanVelocity(moveSpeed, moveSpeedRate, gearAmount)
    {
        return moveSpeed + moveSpeed * (moveSpeedRate - 1) * (-0.00027 * Math.pow(gearAmount, 2) + 0.033 * gearAmount);
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
    
    static getMainWeaponInkDetailString(mainWeapon, gearAmount, compGearAmount = -1)
    {
        var mainInkConsume1 = this.calculateMainInkSaveUp(mainWeapon.MIC[0], mainWeapon.ISL, gearAmount);
        var mainInkConsume2 = this.calculateMainInkSaveUp(mainWeapon.MIC[1], mainWeapon.ISL, gearAmount);
        
        var compPercentage1 = "";
        var compShootNum1 = "";
        var compPercentage2 = "";
        var compShootNum2 = "";

        if(compGearAmount != -1)
        {
            var compMIC1 = this.calculateMainInkSaveUp(mainWeapon.MIC[0], mainWeapon.ISL, compGearAmount);
            var compMIC2 = this.calculateMainInkSaveUp(mainWeapon.MIC[1], mainWeapon.ISL, compGearAmount);
            compPercentage1 = generateCompareText(((mainInkConsume1*100).toFixed(2) - (compMIC1*100).toFixed(2)).toFixed(2), gearAmount >= compGearAmount, "%");
            compShootNum1 = generateCompareText((Math.floor(mainWeapon.ITC/mainInkConsume1) - Math.floor(mainWeapon.ITC/compMIC1)), gearAmount >= compGearAmount, "");
            compPercentage2 = generateCompareText(((mainInkConsume2*100).toFixed(2) - (compMIC2*100).toFixed(2)).toFixed(2), gearAmount >= compGearAmount, "%");
            compShootNum2 = generateCompareText((Math.floor(mainWeapon.ITC/mainInkConsume2) - Math.floor(mainWeapon.ITC/compMIC2)), gearAmount >= compGearAmount, "");
        }
    
        var res;
        var suffix = this.getMainWeaponSuffixString(mainWeapon.WT);
        if(mainWeapon.WT == "Shooter" || mainWeapon.WT == "Blaster" || mainWeapon.WT == "Blaster2" || mainWeapon.WT == "Slosher" ||
            mainWeapon.WT == "Slosher2" || mainWeapon.WT == "Slosher3")
        {
            res = (mainInkConsume1*100).toFixed(2) + "% " + compPercentage1 + "(合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " " + compShootNum1 + suffix + ")";
        }
        else if(mainWeapon.WT == "Shooter2")
        {
            res = "単発 : " +
                    (mainInkConsume1*100).toFixed(2) + "% " + compPercentage1 + "(合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " " + compShootNum1 + "発射撃可能)";
            res += "<br>連射 : " +
                    (mainInkConsume2*100).toFixed(2) + "% " + compPercentage2 + "(合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " " + compShootNum2 + "発射撃可能)";
        }
        else if(mainWeapon.WT == "Roller" || mainWeapon.WT == "Roller2" || mainWeapon.WT == "Brush")
        {
            res = "振り : " +
                    (mainInkConsume1*100).toFixed(2) + "% " + compPercentage1 + "(合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " " + compShootNum1 + "回使用可能)";
            //res += "<br>轢き : " +
            //        (mainInkConsume2*100).toFixed(2) + "% (合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " F使用可能)";
        }
        else if(mainWeapon.WT == "Charger")
        {
            res = "フルチャージ : " +
                    (mainInkConsume1*100).toFixed(2) + "% " + compPercentage1 + "(合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " " + compShootNum1 + "発射撃可能)";
            res += "<br>ノンチャージ : " +
                    (mainInkConsume2*100).toFixed(2) + "% " + compPercentage2 + "(合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " " + compShootNum2 + "発射撃可能)";
        }
        else if(mainWeapon.WT == "Splatling" || mainWeapon.WT == "Splatling2" || mainWeapon.WT == "Splatling3")
        {
            res = "フルチャージ : " + (mainInkConsume1*100).toFixed(2) + "% " + compPercentage1 + "(合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " " + compShootNum1 + "回射撃可能)";
        }
        else if(mainWeapon.WT == "Dualie" || mainWeapon.WT == "Dualie2")
        {
            res = "射撃 : " + 
                    (mainInkConsume1*100).toFixed(2) + "% " + compPercentage1 + "(合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " " + compShootNum1 + "発射撃可能)";
            res += "<br>スライド : " +
                    (mainInkConsume2*100).toFixed(2) + "% " + compPercentage2 + "(合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " " + compShootNum2 + "回スライド可能)";
        }
        else if(mainWeapon.WT == "Umbrella")
        {
            res = "射撃 : " +
                    (mainInkConsume1*100).toFixed(2) + "% " + compPercentage1 + "(合計 " + Math.floor(mainWeapon.ITC/mainInkConsume1) + " " + compShootNum1 + "発射撃可能)";
            res += "<br>パージ : " +
                    (mainInkConsume2*100).toFixed(2) + "% " + compPercentage2 + "(合計 " + Math.floor(mainWeapon.ITC/mainInkConsume2) + " " + compShootNum2 + "回パージ可能)";
        }
        
        return res;
    }

    static getRunningHumanVelocityDetailString(mainWeapon, gearAmount, compGearAmount = -1)
    {
        var runningHumanVelocity1 = this.calculateRunningHumanVelocity(mainWeapon.MS[0], mainWeapon.MSR, gearAmount);
        var runningHumanVelocity2 = this.calculateRunningHumanVelocity(mainWeapon.MS[1], mainWeapon.MSR, gearAmount);
        
        var compRHVT1 = "";
        var compRHVT2 = "";
        var compRHVT3 = "";
        var compRHVT4 = "";
        var compRHVT5 = "";
        var compRHVT6 = "";
        var compRHVT7 = "";
        var compRHVT8 = "";

        if(compGearAmount != -1)
        {
            var compRHV1 = this.calculateRunningHumanVelocity(mainWeapon.MS[0], mainWeapon.MSR, compGearAmount);
            var compRHV2 = this.calculateRunningHumanVelocity(mainWeapon.MS[1], mainWeapon.MSR, compGearAmount);
            compRHVT1 = generateCompareText(((runningHumanVelocity1 * 60 / 50).toFixed(2) - (compRHV1 * 60 / 50).toFixed(2)).toFixed(2), gearAmount >= compGearAmount, "");
            compRHVT2 = generateCompareText(((runningHumanVelocity1 / 50).toFixed(2) - (compRHV1 / 50).toFixed(2)).toFixed(2), gearAmount >= compGearAmount, "");
            compRHVT3 = generateCompareText(((500 / runningHumanVelocity1 / 60).toFixed(2) - (500 / compRHV1 / 60).toFixed(2)).toFixed(2), gearAmount >= compGearAmount, "秒");
            compRHVT4 = generateCompareText(((500 / runningHumanVelocity1).toFixed() - (500 / compRHV1).toFixed()).toFixed(), gearAmount >= compGearAmount, "F");
            compRHVT5 = generateCompareText(((runningHumanVelocity2 * 60 / 50).toFixed(2) - (compRHV2 * 60 / 50).toFixed(2)).toFixed(2), gearAmount >= compGearAmount, "");
            compRHVT6 = generateCompareText(((runningHumanVelocity2 / 50).toFixed(2) - (compRHV2 / 50).toFixed(2)).toFixed(2), gearAmount >= compGearAmount, "");
            compRHVT7 = generateCompareText(((500 / runningHumanVelocity2 / 60).toFixed(2) - (500 / compRHV2 / 60).toFixed(2)).toFixed(2), gearAmount >= compGearAmount, "秒");
            compRHVT8 = generateCompareText(((500 / runningHumanVelocity2).toFixed() - (500 / compRHV2).toFixed()).toFixed(), gearAmount >= compGearAmount, "F");
        }
    
        var res;
        if(mainWeapon.WT == "Splatling" || mainWeapon.WT == "Splatling2")
        {
            res = "射撃中 : " + 
                    (runningHumanVelocity1 * 60 / 50).toFixed(2) + compRHVT1 + " 本/秒 ( " + (runningHumanVelocity1 / 50).toFixed(2) + compRHVT2 + " 本/F)<br>" +
                    "10本移動にかかる時間 : " + (500 / runningHumanVelocity1 / 60).toFixed(2) + " 秒" + compRHVT3 + " ( " + (500 / runningHumanVelocity1).toFixed() + " F" + compRHVT4 + ")<br><br>";
            res += "チャージ中 : " +
                    (runningHumanVelocity2 * 60 / 50).toFixed(2) + compRHVT5 + " 本/秒 ( " + (runningHumanVelocity2 / 50).toFixed(2) + compRHVT6 + " 本/F)<br>" +
                    "10本移動にかかる時間 : " + (500 / runningHumanVelocity2 / 60).toFixed(2) + " 秒" + compRHVT7 + " ( " + (500 / runningHumanVelocity2).toFixed() + " F" + compRHVT8 + ")" + 
                    "<br><br>※1本 = 試し撃ち場の1ライン";
        }
        else if(mainWeapon.WT == "Splatling3")
        {
            res = "短射程モード : " + 
                    (runningHumanVelocity1 * 60 / 50).toFixed(2) + compRHVT1 + " 本/秒 ( " + (runningHumanVelocity1 / 50).toFixed(2) + compRHVT2 + " 本/F)<br>" +
                    "10本移動にかかる時間 : " + (500 / runningHumanVelocity1 / 60).toFixed(2) + " 秒" + compRHVT3 + " ( " + (500 / runningHumanVelocity1).toFixed() + " F" + compRHVT4 + ")<br><br>";
            res += "長射程モード : " +
                    (runningHumanVelocity2 * 60 / 50).toFixed(2) + compRHVT5 + " 本/秒 ( " + (runningHumanVelocity2 / 50).toFixed(2) + compRHVT6 + " 本/F)<br>" +
                    "10本移動にかかる時間 : " + (500 / runningHumanVelocity2 / 60).toFixed(2) + " 秒" + compRHVT7 + " ( " + (500 / runningHumanVelocity2).toFixed() + " F" + compRHVT8 + ")<br><br>";
            res += "チャージ中 : " + 
                    (runningHumanVelocity1 * 60 / 50).toFixed(2) + compRHVT1 + " 本/秒 ( " + (runningHumanVelocity1 / 50).toFixed(2) + compRHVT2 + " 本/F)<br>" +
                    "10本移動にかかる時間 : " + (500 / runningHumanVelocity1 / 60).toFixed(2) + " 秒" + compRHVT3 + " ( " + (500 / runningHumanVelocity1).toFixed() + " F" + compRHVT4 + ")" + 
                    "<br><br>※1本 = 試し撃ち場の1ライン";
        }
        else if(mainWeapon.WT == "Umbrella")
        {
            res = "射撃中 : " + 
                    (runningHumanVelocity1 * 60 / 50).toFixed(2) + compRHVT1 + " 本/秒 ( " + (runningHumanVelocity1 / 50).toFixed(2) + compRHVT2 + " 本/F)<br>" +
                    "10本移動にかかる時間 : " + (500 / runningHumanVelocity1 / 60).toFixed(2) + " 秒" + compRHVT3 + " ( " + (500 / runningHumanVelocity1).toFixed() + " F" + compRHVT4 + ")<br><br>";
            res += "展開中 : " +
                    (runningHumanVelocity2 * 60 / 50).toFixed(2) + compRHVT5 + " 本/秒 ( " + (runningHumanVelocity2 / 50).toFixed(2) + compRHVT6 + " 本/F)<br>" +
                    "10本移動にかかる時間 : " + (500 / runningHumanVelocity2 / 60).toFixed(2) + " 秒" + compRHVT7 + " ( " + (500 / runningHumanVelocity2).toFixed() + " F" + compRHVT8 + ")" + 
                    "<br><br>※1本 = 試し撃ち場の1ライン";
        }
        else
        {
            res = (runningHumanVelocity1 * 60 / 50).toFixed(2) + compRHVT1 + " 本/秒 ( " + (runningHumanVelocity1 / 50).toFixed(2) + compRHVT2 + " 本/F)<br>" +
                    "10本移動にかかる時間 : " + (500 / runningHumanVelocity1 / 60).toFixed(2) + " 秒" + compRHVT3 + " ( " + (500 / runningHumanVelocity1).toFixed() + " F" + compRHVT4 + ")" + 
                    "<br><br>※1本 = 試し撃ち場の1ライン";
        }
        
        return res;
    }

    static getMainWeaponSuffixString(weaponType)
    {
        var res;

        if(weaponType == "Shooter" || weaponType == "Shooter2" || weaponType == "Blaster" || weaponType == "Blaster2" ||
            weaponType == "Charger" || weaponType == "Slosher" || weaponType == "Slosher2" || weaponType == "Slosher3" ||
            weaponType == "Dualie" || weaponType == "Dualie2" || weaponType == "Umbrella")
            res = "発射撃可能";
        else if(weaponType == "Roller" || weaponType == "Roller2" || weaponType == "Brush" || weaponType == "Charger" ||
                weaponType == "Splatling" || weaponType == "Splatling2" || weaponType == "Splatling3")
            res = "回使用可能";
        
        return res;
    }

    static getMainWeaponPowerUpDetailString(mainWeapon, gearAmount, compGearAmount = -1)
    {
        var res;
        var damage1 = (this.calculateMainWeaponDamage(mainWeapon.BD[0], mainWeapon.MWDUR[0], mainWeapon.MWDUM, gearAmount) / 10).toFixed(1);
        var damage2 = (this.calculateMainWeaponDamage(mainWeapon.BD[1], mainWeapon.MWDUR[0], mainWeapon.MWDUM, gearAmount) / 10).toFixed(1);
        var damage3 = (this.calculateMainWeaponDamage(mainWeapon.BD[2], mainWeapon.MWDUR[0], mainWeapon.MWDUM, gearAmount) / 10).toFixed(1);
        var splatlingDamage2 = (this.calculateMainWeaponDamage(mainWeapon.BD[1], mainWeapon.MWDUR[1], mainWeapon.MWDUM, gearAmount) / 10).toFixed(1);
        var compDamage1 = "";
        var compDamage2 = "";
        var compDamage3 = "";
        var compSplatlingDamage2 = "";
        
        if(compGearAmount != -1 && mainWeapon.MWDUR[0] != 1)
        {
            compDamage1 = generateCompareText((damage1 - (this.calculateMainWeaponDamage(mainWeapon.BD[0], mainWeapon.MWDUR[0], mainWeapon.MWDUM, compGearAmount) / 10).toFixed(1)).toFixed(1), gearAmount >= compGearAmount, "");
            compDamage2 = generateCompareText((damage2 - (this.calculateMainWeaponDamage(mainWeapon.BD[1], mainWeapon.MWDUR[0], mainWeapon.MWDUM, compGearAmount) / 10).toFixed(1)).toFixed(1), gearAmount >= compGearAmount, "");
            compDamage3 = generateCompareText((damage3 - (this.calculateMainWeaponDamage(mainWeapon.BD[2], mainWeapon.MWDUR[0], mainWeapon.MWDUM, compGearAmount) / 10).toFixed(1)).toFixed(1), gearAmount >= compGearAmount, "");
            compSplatlingDamage2 = generateCompareText((splatlingDamage2 - (this.calculateMainWeaponDamage(mainWeapon.BD[1], mainWeapon.MWDUR[1], mainWeapon.MWDUM, compGearAmount) / 10).toFixed(1)).toFixed(1), gearAmount >= compGearAmount, "");
        }

        switch (mainWeapon.WT)
        {
            case "Shooter":
                res = damage1 + compDamage1 + " ダメージ";
                break;
            case "Shooter2":
                res = "単発 : " +
                       damage1 + compDamage1 + " ダメージ";
                res += "<br>連射 : " +
                       damage2 + compDamage2 + " ダメージ";
                break;
            case "Blaster":
                res = "直撃 : " +
                       damage1 + compDamage1 + " ダメージ";
                res += "<br>爆風 : " +
                       damage2 + compDamage2 + " ダメージ";
                break;
            case "Blaster2":
                res = "直撃 : " +
                       damage1 + compDamage1 + " ダメージ";
                res += "<br>近爆風 : " +
                       damage2 + compDamage2 + " ダメージ";
                res += "<br>遠爆風 : " +
                       damage3 + compDamage3 + " ダメージ";
                break;
            case "Roller":
                res = "振りダメージ : " +
                       damage2 + compDamage2 + " ダメージ";
                res += "<br>轢きダメージ : " +
                       damage1 + compDamage1 + " ダメージ";
                break;
            case "Roller2":
                res = "横振り : " +
                       damage2 + compDamage2 + " ダメージ";
                res += "<br>縦振り : " +
                       damage3 + compDamage3 + " ダメージ";
                res += "<br>轢きダメージ : " +
                       damage1 + compDamage1 + " ダメージ";
                break;
            case "Brush":
                res = "振りダメージ : " +
                       damage2 + compDamage2 + " ダメージ";
                res += "<br>轢きダメージ : " +
                       damage1 + compDamage1 + " ダメージ";
                break;
            case "Charger":
                res = "フルチャージ : " +
                       damage1 + compDamage1 + " ダメージ";
                res += "<br>ノンチャージ : " +
                       damage2 + compDamage2 + " ダメージ";
                break;
            case "Slosher":
                res = "メインウェポンダメージ : " +
                       damage1 + compDamage1 + " ダメージ";
                break;
            case "Slosher2":
                res = "直撃 : " +
                       damage1 + compDamage1 + " ダメージ";
                res += "<br>掠り : " +
                       damage2 + compDamage2 + " ダメージ";
                break;
            case "Slosher3":
                res = "直撃 : " +
                       damage1 + compDamage1 + " ダメージ";
                res += "<br>爆風 : " +
                       damage2 + compDamage2 + " ダメージ";
                break;
            case "Splatling":
                res = damage1 + compDamage1 + " ダメージ";
                break;
            case "Splatling2":
                res = "フルチャージ : " +
                       damage1 + compDamage1 + " ダメージ";
                res += "<br>半チャージ : " +
                       splatlingDamage2 + compSplatlingDamage2 + " ダメージ";
                break;
            case "Splatling3":
                res = "長射程モード : " +
                       damage1 + compDamage1 + " ダメージ";
                res += "<br>短射程モード : " +
                        damage2 + compDamage2 + " ダメージ";
                break;
            case "Dualie":
                res = damage1 + compDamage1 + " ダメージ";
                break;
            case "Dualie2":
                res = "立ち射撃 : " +
                       damage1 + compDamage1 + " ダメージ";
                res += "<br>スライド射撃 : " +
                       damage2 + compDamage2 + " ダメージ";
                break;
            case "Umbrella":
                res = "全弾 : " +
                       damage2 + compDamage2 + " ダメージ";
                res += "<br>飛沫 : " +
                       damage1 + compDamage1 + " ダメージ";
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