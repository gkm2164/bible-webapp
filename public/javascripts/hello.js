window.finishLoading = "false";

function initializer() {
    const StorageKey = "VERSE";

    try {
        if (!localStorage.getItem(StorageKey)) {
            localStorage.setItem(StorageKey, "{}");
        }
    } catch(e) {
        localStorage.setItem(StorageKey, "{}");
    }

    $.get("/bibles?book=1", (data) => {
        const books = data.NRSV.books;
        /* Navigation bar initialization */
        $("nav").append(
            $("<ul>").append(books.map((b, idx) => {
                const id = idx + 1;
                return $(`<li id="menu-${id}" data-verses="${b.chapters.length}"></li>`)
                    .append($(`<a href="#">${b.name}</a>`).click(() => {
                        $("html, body").animate({
                            scrollTop: $(`#book-${id}`).offset().top
                        }, 1000);
                    }));
            })));

        const doubleDash = /--/g

        /* Contents initialization */
        $("div#contents").append(books.map((book, bookId) => {
            const name = book.name;
            const chapters = book.chapters;
            return $(`<div class="book-block-${bookId}"></div>`)
                .append($("<h2></h2>")
                    .append($(`<a id="book-${bookId + 1}">${name}</a>`).click(function () {
                        $(`.book-block-${bookId}`).find($(".verse-block")).toggleClass("block-clicked");
                    })))
                .append(...chapters.map(chapter =>
                    $(`<div class="chapter-block" id="chapter-block-${bookId}-${chapter.id}"></div>`).append(
                        $(`<h3 id="chap-header-${bookId + 1}-${chapter.id}"></h3>`)
                            .addClass("chap-header")
                            .append($(`<a id="chap-${bookId}-${chapter.id}">${chapter.id}</a>`).click(function () {
                                $(`.chapter-block-${bookId}-${chapter.id}`).find($(".verse-block")).toggleClass("block-clicked");
                            })),
                        ...chapter.verses.map(verse => {
                            const ret = $(`<div class="verse-block" data-verse-id="${verse.id}" data-book="${name}" data-chapter="${chapter.id}"></div>`)
                                .append(`<span class="verse-header">${verse.verse}&nbsp;</span>`,
                                `<span class="verse-sentence">${verse.text.replace(doubleDash, "—")}</span>`);

                            if (hasClicked(verse.id)) {
                                ret.addClass("block-clicked");
                            }
                            return ret;
                        })
                    )));
        }));

        $(".verse-block").click(function () {
            $(this).toggleClass("block-clicked");
            const id = $(this).attr("data-verse-id")
            if ($(this).hasClass("block-clicked")) {
                addVerseToLocalStorage(id);
            } else {
                removeVerseFromLocalStorage(id);
            }
        });

        function hasClicked(verseId) {
            const set = localStorage.getItem(StorageKey);
            let obj = set === "" ? {} : JSON.parse(set);
            return obj.hasOwnProperty(verseId)
        }

        function addVerseToLocalStorage(verseId) {
            const set = localStorage.getItem(StorageKey);
            let obj = set === "" ? {} : JSON.parse(set);
            obj[verseId] = true;
            localStorage.setItem(StorageKey, JSON.stringify(obj));
        }

        function removeVerseFromLocalStorage(verseId) {
            const set = localStorage.getItem(StorageKey);
            let obj = set === "" ? {} : JSON.parse(set);
            delete obj[verseId];
            localStorage.setItem(StorageKey, JSON.stringify(obj));
        }

        $("input#bible-search").change($.debounce(250, function () {
            const query = $(this).val();
            const searchResult = $("section.search-result");
            const contents = $("section.contents");

            searchResult.children().remove();
            if (query === "") {
                contents.removeClass("section-hidden");
                searchResult.addClass("section-hidden");
                return;
            }

            for (let bookIdx in books) {
                let bookPrintedOnce = false;
                const book = books[bookIdx];
                const chapters = book.chapters;
                let bookSearchHeader;

                if (book.name.includes(query)) {
                    bookPrintedOnce = true;
                    searchResult.append($("<h2></h2>")
                        .append(book.name.split("query")
                            .join(`<span class="search-emphasize">${query}</span>`)));
                } else {
                    bookSearchHeader = $("<h2></h2>").append(book.name);
                }

                for (let chapIdx in chapters) {
                    let chapPrintedOnce = false;
                    const chapter = chapters[chapIdx];
                    const chapterSearchHeader = $("<h3></h3>").addClass("chap-header").append(chapter.id);
                    for (let verseIdx in chapter.verses) {
                        const verse = chapter.verses[verseIdx];
                        if (verse.text.includes(query)) {
                            let verseText = verse.text.replace(doubleDash, "—")
                                .split(query)
                                .join(`<span class="search-emphasize">${query}</span>`);
                            if (!bookPrintedOnce) {
                                searchResult.append(bookSearchHeader);
                                bookPrintedOnce = true;
                            }

                            if (!chapPrintedOnce) {
                                searchResult.append(chapterSearchHeader);
                                chapPrintedOnce = true;
                            }

                            const verseToBeAdd = $(`<div class="verse-block" data-verse-id="${verse.id}" data-book="${name}" data-chapter="${chapter.id}"></div>`).append(
                                `<span class="verse-header">${verse.verse}&nbsp;</span>`,
                                `<span class="verse-sentence">${verseText}</span>`);
                            if (hasClicked(verse.id)) {
                                verseToBeAdd.addClass("block-clicked");
                            }
                            searchResult.append(verseToBeAdd);
                        }
                    }
                }

                searchResult.removeClass("section-hidden");
                contents.addClass("section-hidden");
            }
        }));

        $(document).ready(() => {
            let sticky;
            let scrollHeight;
            let booksLink;

            function reIndexContentsOffsets() {
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

            window.onscroll = scrollBibleBook;
            window.onresize = reIndexContentsOffsets;
        });

        window.finishLoading = "true";
    });
}

$(initializer);

document.onkeydown = function (evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape) {
        $(".verse-block").removeClass("block-clicked");
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