document.onkeydown = function (evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape) {
        $(".verse-block").removeClass("block-clicked").trigger("classChange");
    }
};

$(document).bind("copy", () => {
    const data = [];
    $(".block-clicked").map((_, elem) => {
        const $elem = $(elem);
        const bookName = $elem.attr("data-book");
        const chapter = $elem.attr("data-chapter");

        data.push(`${bookName} ${chapter}:${$elem.text()}`);
    });
    console.log(data.join("\n"));
    navigator.clipboard.writeText(data.join("\n")).then(() => console.log("copied"));
})