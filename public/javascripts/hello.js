// When the user scrolls the page, execute myFunction
function scrollTo(id) {

}

$(function () {
    function $$(tag) {
        return $(`<${tag}></{tag}>`);
    }

    $.get("/bibles", (data) => {
        const books = data.NRSV.books;
        $("nav").append(
            $$("ul").append(books.map((b, idx) => {
                const id = idx + 1;
                return $(`<li id="menu-${id}" data-verses="${b.chapters.length}"></li>`)
                    .append($(`<a href="#">${b.name}</a>`).click(() => {
                        $("html, body").animate({
                            scrollTop: $(`#book-${id}`).offset().top
                        }, 1000)
                    }));
            })));

        // <h3 class="chap-header"><a id="chap-@bookId-@chap">@chap</a></h3>
        $("section").append(books.map((book, bookId) => {
            const name = book.name;
            const chapters = book.chapters;
            return $$("div")
                .append($$("h2")
                    .append($(`<a id="book-${bookId + 1}">${name}</a></h2>`)))
                .append(...chapters.flatMap(chapter =>
                    [$(`<h3 id="chap-header-${bookId + 1}-${chapter.id}"></h3>`)
                        .addClass("chap-header")
                        .append($(`<a id="chap-${bookId}-${chapter.id}">${chapter.id}</a></h3>`)),
                        chapter.verses.map(verse =>
                            $(`<div class="verse-block"></div>`).append(
                                `<span class="verse-header">${verse.verse}&nbsp;</span>`,
                                `<span class="verse-sentence">${verse.text}</span>`))
                    ])
                );
        }));

        $(document).ready(() => {
            let sticky;
            let scrollHeight;
            let booksLink;

            function reIndexContentsOffsets() {
// Get the header
                booksLink = [...Array(66).keys()]
                    .map(i => document.getElementById(`book-${i + 1}`));

                scrollHeight = Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                );

// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
                sticky = [0].concat(booksLink.map(b => $(b).offset().top - 1).concat([scrollHeight]));
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
    })
});