var siteId;
var gridData;
var wnd
var monTotalHrs = 0;
var tueTotalHrs = 0;
var wedTotalHrs = 0;
var thuTotalHrs = 0;
var friTotalHrs = 0;
var satTotalHrs = 0;
var sunTotalHrs = 0;

var svgns = "http://www.w3.org/2000/svg";
var xlinkns = "http://www.w3.org/1999/xlink";

var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
];

var weekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

var hourNames = ["07.00 AM", "08.00 AM", "09.00 AM", "10.00 AM", "11.00 AM", "12.00 PM", "01.00 PM",
           "02.00 PM", "03.00 PM", "04.00 PM", "05.00 PM", "06.00 PM", "07.00 PM", "08.00 PM"
];

var hourId = ["7AM", "8AM", "9AM", "10AM", "11AM", "12PM",
          "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM"
];

$(function () {

    $("#sites").kendoDropDownList({
        filter: "contains",
        dataSource: {
            transport: {
                read: {
                    url: "/Home/ReadSite",
                    dataType: "json"
                }
            }
        },
        dataTextField: "Name",
        dataValueField: "Id",
        autoBind: false,
        change: onSelect,
        //optionLabel: "-Select Site-",
        index: -1
    }).data("kendoDropDownList");



    function onSelect() {
        siteId = this.value();

        gridData = new kendo.data.DataSource({
            transport: {
                read: function (options) {

                    $.ajax({
                        url: "/Home/GetStaff",
                        data: { getSiteId: siteId },
                        dataType: "json",
                        success: function (response) {
                            var result = response;
                            result.forEach(function (value) {
                                value.Mon = $("th:eq(0)").text().replace(/\s+/g, '');
                                value.Tue = $("th:eq(1)").text().replace(/\s+/g, '');
                                value.Wed = $("th:eq(2)").text().replace(/\s+/g, '');
                                value.Thu = $("th:eq(3)").text().replace(/\s+/g, '');
                                value.Fri = $("th:eq(4)").text().replace(/\s+/g, '');
                                value.Sat = $("th:eq(5)").text().replace(/\s+/g, '');
                                value.Sun = $("th:eq(6)").text().replace(/\s+/g, '');
                            });
                            options.success(result)
                        }
                    })
                }
            },
        });

        var startDate = $('th:eq(0)').data("date");
        var readStartDate = (startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate());
        var endDate = $('th:eq(6)').data("date");
        endDate.setDate(endDate.getDate() + 1);
        var readEndDate = (endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + (endDate.getDate()));

        initializeTotals();
        var newgrid = $("#scheduler").data("kendoGrid");
        newgrid.setDataSource(gridData);
        LoadTasks(readStartDate, readEndDate);

        $("#reference").data("kendoDropDownList").dataSource.read();
        filter = filterId = filterSource = ""
        var combobox = $("#comboFilter").data("kendoComboBox")
        combobox.text("")
        //combobox.trigger("change")

        $("#saveButton").css("display", "none");
    }

    $("#startTime").kendoTimePicker();
    $("#finishTime").kendoTimePicker();


    $("#scheduler").kendoGrid({
        //height: 500,
        rowTemplate: kendo.template($("#template").html()),
        columns: [
            { field: "Mon", width: "115px", fixed: true, footerTemplate: "Hrs: <span id='monTotalHrs'>#=monTotalHrs#</span>" },
            { field: "Tue", width: "115px", fixed: true, footerTemplate: "Hrs: <span id='tueTotalHrs'>#=tueTotalHrs#</span>" },
            { field: "Wed", width: "115px", fixed: true, footerTemplate: "Hrs: <span id='wedTotalHrs'>#=wedTotalHrs#</span>" },
            { field: "Thu", width: "115px", fixed: true, footerTemplate: "Hrs: <span id='thuTotalHrs'>#=thuTotalHrs#</span>" },
            { field: "Fri", width: "115px", fixed: true, footerTemplate: "Hrs: <span id='friTotalHrs'>#=friTotalHrs#</span>" },
            { field: "Sat", width: "115px", fixed: true, footerTemplate: "Hrs: <span id='satTotalHrs'>#=satTotalHrs#</span>" },
            { field: "Sun", width: "115px", fixed: true, footerTemplate: "Hrs: <span id='sunTotalHrs'>#=sunTotalHrs#</span>" },
        ],
        editable: false,
        scrollable: false,
        //resizeable: false,
        noRecords: {
            template: "Please select a site."
        },

    });

    wnd = $("#window2")
            .kendoWindow({
                title: "Staff Roster: ",
                modal: true,
                visible: false,
                resizable: true,
                width: "99%",
                position: {
                    top: 100, left: 5
                }
            }).data("kendoWindow");

})


function LoadTasks(readStartDate, readEndDate) {

    if (unsavedTasks.length > 0 || deleteTasks.length > 0) {
        saveChanges();
    }

    $.ajax({
        url: "/Home/ReadTask",
        data: { weekStart: readStartDate, weekEnd: readEndDate },
        datatype: "json",
        type: "GET",
        success: function (response) {
            $.each(response, function (key, value) {

                var targetStartDate = new Date(value.StartDate.slice(0, -2));
                var targetcellStartDate = weekNames[targetStartDate.getDay()] + targetStartDate.getDate() + monthNames[targetStartDate.getMonth()];

                var readStartTime = (value.StartDate).substr((value.StartDate).length - 7);
                var targetStartTime = [readStartTime.slice(0, 5), " ", readStartTime.slice(5)].join('').trim();

                var readEndTime = (value.EndDate).substr((value.EndDate).length - 7);
                var targetEndTime = [readEndTime.slice(0, 5), " ", readEndTime.slice(5)].join('').trim();

                if (value.RefName == null) {
                    var refDBString = ""
                }
                else {
                    var refDBString = value.RefName
                }

                var targetcell = "" + value.SiteId + value.StaffId + targetcellStartDate;

                var targetDiv = $('#cell_' + targetcell);
                var columnNum = targetDiv.index();

                var div =
                  $("<div class='innerdiv' data-id='" + value.Id + "' col='" + columnNum + "'><span class='planStart'>"
                    + targetStartTime.replace(/^(?:00:)?0?/, '') + "</span> - <span class='planEnd'>"
                    + targetEndTime.replace(/^(?:00:)?0?/, '') + "</span>"
                    + "<br>" + "<span class='ref'>" + refDBString + "</span>"
                    + " <div class='glyphicon glyphicon-pencil remove-staff edit-Record'></div>"
                    + "<div class='glyphicon glyphicon-remove'></div>" + "</div>");
                if (targetDiv !== undefined) {
                    targetDiv.append(div);
                }

                //calculate the widget time and add it to the week time
                var dataStaffId = "[data-staffid=" + value.StaffId + "]";
                var existingHours = parseFloat($('div' + dataStaffId).text());

                var hourDiff = timeDiffcalculate(targetStartTime, targetEndTime);

                var taskDay = weekNames[targetStartDate.getDay()]
                if ((columnNum > -1) && (value.SiteId == siteId)) {
                    var newHours = parseFloat(existingHours + hourDiff).toFixed(2);
                    $("#scheduler tbody").find(dataStaffId).html(newHours);
                    addDailyTotals(taskDay, hourDiff)
                    refreshTotals();
                }
            });
        }
    })
};

function addDailyTotals(taskDay, hourDiff) {
    switch (taskDay) {
        case "Mon":
            monTotalHrs = monTotalHrs + hourDiff;
            return;
        case "Tue":
            tueTotalHrs = tueTotalHrs + hourDiff;
            return;
        case "Wed":
            wedTotalHrs = wedTotalHrs + hourDiff;
            return;
        case "Thu":
            thuTotalHrs = thuTotalHrs + hourDiff;
            return;
        case "Fri":
            friTotalHrs = friTotalHrs + hourDiff;
            return;
        case "Sat":
            satTotalHrs = satTotalHrs + hourDiff;
            return;
        case "Sun":
            sunTotalHrs = sunTotalHrs + hourDiff;
            return;
    };
};

function refreshTotals() {
    $("#monTotalHrs").text(monTotalHrs.toFixed(2));
    $("#tueTotalHrs").text(tueTotalHrs.toFixed(2));
    $("#wedTotalHrs").text(wedTotalHrs.toFixed(2));
    $("#thuTotalHrs").text(thuTotalHrs.toFixed(2));
    $("#friTotalHrs").text(friTotalHrs.toFixed(2));
    $("#satTotalHrs").text(satTotalHrs.toFixed(2));
    $("#sunTotalHrs").text(sunTotalHrs.toFixed(2));
};

function initializeTotals() {
    monTotalHrs = 0
    tueTotalHrs = 0
    wedTotalHrs = 0
    thuTotalHrs = 0
    friTotalHrs = 0
    satTotalHrs = 0
    sunTotalHrs = 0
};

function minusDailyTotals(taskDay, hourDiff) {
    switch (taskDay) {
        case "Mon":
            monTotalHrs = monTotalHrs - hourDiff;
            return;
        case "Tue":
            tueTotalHrs = tueTotalHrs - hourDiff;
            return;
        case "Wed":
            wedTotalHrs = wedTotalHrs - hourDiff;
            return;
        case "Thu":
            thuTotalHrs = thuTotalHrs - hourDiff;
            return;
        case "Fri":
            friTotalHrs = friTotalHrs - hourDiff;
            return;
        case "Sat":
            satTotalHrs = satTotalHrs - hourDiff;
            return;
        case "Sun":
            sunTotalHrs = sunTotalHrs - hourDiff;
            return;
    };
};

function showDaily(dailyViewSiteId, dailyViewDate) {

    siteId = dailyViewSiteId;
    var dateString = dailyViewDate.toString();
    var titleDate = dateString.split(' ')[1] + " " + dateString.split(' ')[2] + ", " + dateString.split(' ')[3]
    var fetchDate = (dailyViewDate.getFullYear() + "-" + (dailyViewDate.getMonth() + 1) + "-" + dailyViewDate.getDate());

    detailsTemplate = kendo.template($("#details").html());
    wnd.content(detailsTemplate);
    wnd.title("Staff Roster for " + titleDate)
    wnd.open('left=20px,top=20px');

    $("#grid2").kendoGrid({
        editable: true,
        resizable: true,
        rowTemplate: kendo.template($("#template2").html()),
        columns: [
            { field: "Category", hidden: true, editable: false },
            { field: "Name", title: "Name/Total", width: "120px", fixed: true, editable: false },
            { width: "80px", fixed: true, editable: false },
            { title: "7:00 AM", width: "60px", fixed: true },
            { title: "8:00 AM", width: "60px", fixed: true },
            { title: "9:00 AM", width: "60px", fixed: true },
            { title: "10:00 AM", width: "60px", fixed: true },
            { title: "11:00 AM", width: "60px", fixed: true },
            { title: "12:00 PM", width: "60px", fixed: true },
            { title: "1:00 PM", width: "60px", fixed: true },
            { title: "2:00 PM", width: "60px", fixed: true },
            { title: "3:00 PM", width: "60px", fixed: true },
            { title: "4:00 PM", width: "60px", fixed: true },
            { title: "5:00 PM", width: "60px", fixed: true },
            { title: "6:00 PM", width: "60px", fixed: true },
            { title: "7:00 PM", width: "60px", fixed: true },
            { field: "Total", title: "Total Hrs", width: "60px", fixed: true, editable: false },
        ],
        noRecords: {
            template: "No scheduled activities."
        },
    });

    gridData2 = new kendo.data.DataSource({
        transport: {
            read: function (options) {

                $.ajax({
                    url: "/Home/ReadScheduledUsers",
                    data: { TaskSite: dailyViewSiteId, TaskDay: fetchDate },
                    dataType: "json",
                    success: function (gridrow) {
                        options.success(gridrow)

                        for (h = 0; h < gridrow.length; h++) {
                            var dailyViewStaffId = gridrow[h].StaffId

                            if (gridrow[h].Category == "Staff") {
                                $.ajax({
                                    url: "/Home/ReadDailyTask",
                                    data: { TaskSite: dailyViewSiteId, TaskStaffId: dailyViewStaffId, TaskDay: fetchDate },
                                    dataType: "json",
                                    success: function (result) {


                                        $.each(result, function (key, value) {
                                            if (value.Category == "Staff") {
                                                var taskStart = new Date(Date.parse(value.TaskStart));
                                                var taskEnd = new Date(Date.parse(value.TaskEnd));

                                                var targetPlanned = "planned_Staff" + value.StaffId
                                                var taskColor = "magenta"
                                                displayTaskHours(targetPlanned, taskColor, taskStart, taskEnd)
                                                //var targetChanged = "change_Staff" + value.StaffId
                                                //displayTaskHours(targetChanged, taskStart, taskEnd)
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    }
                })
            }
        },
        group: {
            field: "Category",
            groupHeaderTemplate: "#  Category #"
        }
    });


    var newgrid = $("#grid2").data("kendoGrid");
    newgrid.setDataSource(gridData2);

};

function setDateTime(date, time) {
    var index = time.indexOf(".");
    var index2 = time.indexOf(" ");

    var hours = time.substring(0, index);

    var mer = time.substring(index2 + 1, time.length);
    if ((mer == "PM") && (hours != "12")) {
        hours = parseInt(hours) + 12;
    }

    date.setHours(hours);
    date.setMinutes("00");
    date.setSeconds("00");

    return date;
};

function displayTaskHours(targetElement, taskColor, startTime, endTime) {

    var taskStartTime = new Date(startTime)
    var taskEndTime = new Date(endTime)

    var startHrs = startTime.getHours()
    var startMin = startTime.getMinutes()
    var endHrs = endTime.getHours()
    var endMin = endTime.getMinutes()

    for (j = 0; j < (hourNames.length - 1) ; j++) {

        var targetDiv = targetElement + hourId[j]
        var svgDiv = document.getElementById(targetDiv);

        var columnStartTime = setDateTime(taskStartTime, hourNames[j])
        var columnEndTime = setDateTime(taskEndTime, hourNames[j + 1])
        var columnStartHrs = columnStartTime.getHours()
        var columnEndHrs = columnEndTime.getHours()

        if (!((endTime <= columnStartTime) || (columnEndTime <= startTime))) {

            var svgElement = document.createElementNS(svgns, "svg")
            svgElement.setAttributeNS(null, "width", "65.6");
            svgElement.setAttributeNS(null, "height", "28.6");
            svgElement.setAttributeNS(null, "viewBox", "0 0 65.6 28.6");
            svgElement.setAttributeNS(null, "preserveAspectRatio", "xMidYMid slice");
            svgElement.setAttributeNS(null, "style", "opacity:0.8; ")
            svgDiv.appendChild(svgElement)

            if ((startHrs == columnStartHrs) && (endHrs == columnStartHrs)) {

                if (endMin == 0) {
                    evalStartMinutes(svgElement, startMin, taskColor)
                } else if (startMin == 0) {
                    evalEndMinutes(svgElement, endMin, taskColor)
                } else {
                    evalLessThanHour(svgElement, startMin, endMin, taskColor)
                }

            } else if (startHrs == columnStartHrs) {

                evalStartMinutes(svgElement, startMin, taskColor)

            } else if (endHrs == columnStartHrs) {

                evalEndMinutes(svgElement, endMin, taskColor)

            } else {

                assignColor(svgElement, "#rectangles", taskColor);
            }

        }
    }
};

function evalStartMinutes(svgElement, Minutes, taskColor) {
    switch (Minutes) {
        case 15:
            assignColor(svgElement, "#2ndfifteen", taskColor);
            assignColor(svgElement, "#3rdfifteen", taskColor);
            assignColor(svgElement, "#4thfifteen", taskColor);
            break;
        case 30:
            assignColor(svgElement, "#3rdfifteen", taskColor);
            assignColor(svgElement, "#4thfifteen", taskColor);
            break;
        case 45:
            assignColor(svgElement, "#4thfifteen", taskColor);
            break;
        default:
            assignColor(svgElement, "#rectangles", taskColor);
    }
};

function evalEndMinutes(svgElement, Minutes, taskColor) {
    switch (Minutes) {
        case 15:
            assignColor(svgElement, "#1stfifteen", taskColor);
            break;
        case 30:
            assignColor(svgElement, "#1stfifteen", taskColor);
            assignColor(svgElement, "#2ndfifteen", taskColor);
            break;
        case 45:
            assignColor(svgElement, "#1stfifteen", taskColor);
            assignColor(svgElement, "#2ndfifteen", taskColor);
            assignColor(svgElement, "#3rdfifteen", taskColor);
            break;
        default:
            assignColor(svgElement, "#rectangles", taskColor);
    }
}

function evalLessThanHour(svgElement, startMin, endMin, taskColor) {
    if (startMin == 30) {
        assignColor(svgElement, "#3rdfifteen", taskColor);
    } else if (endMin == 30) {
        assignColor(svgElement, "#2ndfifteen", taskColor);
    } else {
        assignColor(svgElement, "#2ndfifteen", taskColor);
        assignColor(svgElement, "#3rdfifteen", taskColor);
    }
}

function assignColor(svgElement, svgUse, fillColor) {

    var use = document.createElementNS(svgns, "use");
    use.setAttributeNS(xlinkns, "xlink:href", svgUse);
    use.setAttributeNS(null, "x", 0);
    use.setAttributeNS(null, "y", 0);
    use.setAttributeNS(null, "width", "100%");
    use.setAttributeNS(null, "height", "100%");
    use.setAttributeNS(null, "fill", fillColor);
    svgElement.appendChild(use);
};
