
$(document).ready(function () {
    
    $("#window2").on("mouseenter", ".changeCell", function () {
        $(this).find("span").css("visibility", "visible");
    });

    $("#window2").on("mouseleave", ".changeCell", function () {
        $(this).find("span").css("visibility", "hidden");
    });
});