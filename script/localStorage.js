function saveClicked()
{
    var weaponVal = $('[name=weaponSelect]').val();
    if(weaponVal === null)
    {
        alert("ブキを選んでください");
        return;
    }

    var name = window.prompt("ギアセット名を入力してください", "");

    if(name == "" || name == null)
        return;

    var index;
    for(var i = 0;; i++)
    {
        var gearSet = localStorage.getItem("Gear" + i);
        if(gearSet !== null) continue;

        index = i;
        break;
    }

    var mainGears = new Array(3);
    var subGears = new Array(9);

    for(var i = 1; i <= 3; i++)
        mainGears[i - 1] = $('[name=mainGear' + i + ']').val();

    for(var i = 1; i <= 9; i++)
        subGears[i - 1] = $('[name=subGear' + i + ']').val();

    var json = 
    {
        name : name,
        weapon : weaponVal,
        main : mainGears,
        sub : subGears
    };
    localStorage.setItem("Gear" + index, JSON.stringify(json));
}

var lastIndex = 0;
function loadClicked()
{
    $("#modalCheck").prop("checked", !$("#modalCheck").prop("checked")).change();

    for(var i = lastIndex;; i++)
    {
        var gearSet = localStorage.getItem("Gear" + i);
        if(gearSet === null) return;

        var json = JSON.parse(gearSet);

        $(".partition").last().css("visibility","");
        $(".partition").last().after(
            '<div id="gearset' + i + '">' +
            '<div class="gearsetName">' + json.name + '</div>' +
            '<div class="gearset">' +
            '<img class="gearsetWeapon" src="assets/images/' + json.weapon + '.png">' +
            '<div class="gearsetMainGearCol">' +
            '<img class="gearsetMainGear" src="assets/images/g' + json.main[0] + '.png">' +
            '<img class="gearsetMainGear" src="assets/images/g' + json.main[1] + '.png">' +
            '<img class="gearsetMainGear" src="assets/images/g' + json.main[2] + '.png">' +
            '</div>' +
            '<div class="gearsetSubGearCol">' +
            '<img class="gearsetSubGear" src="assets/images/g' + json.sub[0] + '.png">' +
            '<img class="gearsetSubGear" src="assets/images/g' + json.sub[3] + '.png">' +
            '<img class="gearsetSubGear" src="assets/images/g' + json.sub[6] + '.png">' +
            '</div>' +
            '<div class="gearsetSubGearCol">' +
            '<img class="gearsetSubGear" src="assets/images/g' + json.sub[1] + '.png">' +
            '<img class="gearsetSubGear" src="assets/images/g' + json.sub[4] + '.png">' +
            '<img class="gearsetSubGear" src="assets/images/g' + json.sub[7] + '.png">' +
            '</div>' +
            '<div class="gearsetSubGearCol">' +
            '<img class="gearsetSubGear" src="assets/images/g' + json.sub[2] + '.png">' +
            '<img class="gearsetSubGear" src="assets/images/g' + json.sub[5] + '.png">' +
            '<img class="gearsetSubGear" src="assets/images/g' + json.sub[8] + '.png">' +
            '</div>' +
            '<div class="gearsetButton">' +
            '<button class="gearsetLoad" onClick="loadData($(this).parent().parent().parent().attr(\'id\').substring(7));">Load</button>' +
            '<button class="gearsetDelete" onClick="deleteData($(this).parent().parent().parent().attr(\'id\').substring(7));">Delete</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<hr class="partition" style="visibility:hidden;">');
        lastIndex++;
    }
}

$(function()
{
    $("#modalCheck").change(function()
    {
        $("body").css("overflow", $("#modalCheck").prop("checked") ? "hidden" : "visible");
    });
});

function loadData(index)
{
    console.log(index);
    var json = JSON.parse(localStorage.getItem("Gear" + index));
    $('[name=weaponSelect]').val(json.weapon).change();

    for(var i = 1; i <= 3; i++)
        $('[name=mainGear' + i + ']').val(json.main[i - 1]).change();

    for(var i = 1; i <= 9; i++)
        $('[name=subGear' + i + ']').val(json.sub[i - 1]).change();

    $("#modalCheck").prop("checked", false).change();
}

function deleteData(index)
{
    index = parseInt(index);
    $(".partition").eq(index).remove();
    $("#gearset" + index).remove();

    localStorage.removeItem("Gear" + index);
    lastIndex--;
    for(var i = index + 1;; i++)
    {
        var tmp = localStorage.getItem("Gear" + i);
        if(tmp === null) break;
        
        // htmlの順番を繰り下げ
        $("#gearset" + i).attr('id', 'gearset' + (i - 1));

        // データの順番を繰り下げ
        localStorage.setItem("Gear" + (i - 1), tmp);
        localStorage.removeItem("Gear" + i);
    }
}