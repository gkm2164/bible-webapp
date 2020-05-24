// When the user scrolls the page, execute myFunction
$(function () {

// Get the header
    let sticky;
    let scrollHeight;
    let books;

    function reIndexContentsOffsets() {
// Get the header
        books = [...Array(66).keys()]
            .map(i => document.getElementById(`book-block-${i + 1}`));

        scrollHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );

// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
        sticky = [0].concat(books.map(b => $(b).offset().top - 1).concat([scrollHeight]));
    }

    [...Array(66).keys()]
        .map(x => x + 1)
        .forEach(idx => $(`li#menu-${idx} ul`).css("display", "none"));

    reIndexContentsOffsets();

    function findNearestHead(left, right) {
        const offset = window.pageYOffset;
        const mid = Math.floor((left + right) / 2);

        if (mid === left) return left;

        if (offset > sticky[mid]) return findNearestHead(mid, right);
        else return findNearestHead(left, mid);
    }

    function scrollBibleBook() {
        const elementIdx = findNearestHead(0, sticky.length, sticky) - 1;
        for (let i = 0; i < books.length; i++) {
            if (i === elementIdx) {
                attachVerses(i + 1);
            } else {
                detachVerses(i + 1);
            }
        }
    }

    function attachVerses(idx) {
        $(`li#menu-${idx} ul`).css("display", "block");
        $(`li#menu-${idx} > a`).addClass("link-bold");
    }

    function detachVerses(idx) {
        $(`li#menu-${idx} ul`).css("display", "none");
        $(`li#menu-${idx} > a`).removeClass("link-bold");
    }

    window.onscroll = function () {
        scrollBibleBook();
    };

    window.onresize = reIndexContentsOffsets;
});
