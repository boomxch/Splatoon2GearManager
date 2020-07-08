function load()
{
    var base64 = location.search.substring(1);
    var params = atob(base64).split('&');
    params.forEach(element => 
    {
        var data = element.split('=');
        
        if(data[0] == "weapon")
            $('[name=weaponSelect]').val(data[1]).change();
        else if(data[0].substring(0,4) == "main")
            $('[name=mainGear' +data[0].substring(4) + ']').val(data[1]);
        else if(data[0].substring(0,3) == "sub")
            $('[name=subGear' +data[0].substring(3) + ']').val(data[1]);
    });

    var mainGearSize=100;
    var subGearSize=75;

    for(var i = 1; i <= 3; i++)
    {
        $('select[name=mainGear' + i + ']').ImageSelect(
        {
            width:mainGearSize,
            height:mainGearSize
        });

        $('select[name=mainGear' + i + 'C]').ImageSelect(
        {
            width:mainGearSize,
            height:mainGearSize
        });
    }

    for(var i = 1; i <= 9; i++)
    {
        $('select[name=subGear' + i + ']').ImageSelect(
        {
            width:subGearSize,
            height:subGearSize
        });

        $('select[name=subGear' + i + 'C]').ImageSelect(
        {
            width:subGearSize,
            height:subGearSize
        });
    }
}

function copyButtonClicked()
{
    for(var i = 1; i <= 3; i++)
        $('[name=mainGear' + i + 'C]').val($('[name=mainGear' + i + ']').val()).change();

    for(var i = 1; i <= 9; i++)
        $('[name=subGear' + i + 'C]').val($('[name=subGear' + i + ']').val()).change();
}

$(function()
{
    $('#weaponSelect').change(function()
    {
        var subSpecial = updateDataDisplay();
        $('#weaponImage').attr('src','assets/images/' + $('#weaponSelect').val() + '.png');
        $('#weaponImage').hide().fadeIn();
        $('#subWeaponImage').hide().fadeIn();
        $('#specialWeaponImage').hide().fadeIn();

        if(subSpecial == null) return;
        $('#subWeaponImage').attr('src','assets/images/s' + subSpecial[0] + '.png');
        $('#specialWeaponImage').attr('src','assets/images/sp' + subSpecial[1] + '.png');
    });

    for(var i = 1; i <= 3; i++)
    {
        $('select[name=mainGear' + i + ']').change(function()
        {
            updateDataDisplay();
            $(this).ImageSelect("update",{src:$("option:selected", this).text()});
        });

        $('select[name=mainGear' + i + 'C]').change(function()
        {
            updateDataDisplay();
            $(this).ImageSelect("update",{src:$("option:selected", this).text()});
        });
    }

    for(var i = 1; i <= 9; i++)
    {
        $('select[name=subGear' + i + ']').change(function()
        {
            updateDataDisplay();
            $(this).ImageSelect("update",{src:$("option:selected", this).text()});
        });

        $('select[name=subGear' + i + 'C]').change(function()
        {
            updateDataDisplay();
            $(this).ImageSelect("update",{src:$("option:selected", this).text()});
        });
    }

    $('#compareLabel').change(function()
    {
        updateDataDisplay();
    });
});

window.onload = load;