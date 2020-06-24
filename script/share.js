// base64エンコードを行うため、twitterシェア対策で&を%26として出す必要がない
function shareUrl()
{
    var weapon = $('[name=weaponSelect]').val();
    var params = "weapon=" + weapon;
    var isMainGearDefined = true;
    for(var i = 1; i <= 3; i++)
    {
        var mainGear = $('[name=mainGear' + i + ']').val();
        params += "&main" + i + "=" + mainGear;
        if(mainGear == 0) isMainGearDefined = false;
    }

    if(weapon == "" || weapon == null || !isMainGearDefined)
    {
        window.open("http://twitter.com/share?url=https://boomxch.github.io/Splatoon2GearManager/&text=ギアを詳細データと共に確認できるよ！&hashtags=Splatoon2");
        return;
    }
    
    for(var i = 1; i <= 9; i++)
    {
        var subGear = $('[name=subGear' + i + ']').val();
        params += "&sub" + i + "=" + subGear;
    }

    params = btoa(params);
    window.open("http://twitter.com/share?url=https://boomxch.github.io/Splatoon2GearManager/?" + params + "&text=今のギアはこれ！&hashtags=Splatoon2GearManager,Splatoon2");
}