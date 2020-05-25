$(function () {
    function createVerse(target, bookId, chapterId, verse) {
        return target.append($("<div class='verse-block'></div>").append(
            $("<span class='verse-header'></span>")
                .append(verse.verse))
            .append($("<span class='verse-sentence'></span>")
                .append(verse.text)
            ));
    }

    function loadChapterFunc(bid, cid) {
        return function () {
            const bookId = bid;
            const chapterId = cid;
            $.get(`/bibles?book=${bookId}&chap=${chapterId}`, function (c) {
                console.log(c);
                const verseLength = c.verses.length;
                const target = $("<div class='chapter-block'></div>")
                    .append($("<h3 class='chap-header'></h3>")
                        .append(c.id))
                const attachTo = $(`#${bookId}-${chapterId}`);
                for (let i = 0; i < verseLength; i++) {
                    createVerse(target, bookId, 1, c.verses[i]);
                }
                attachTo.find($("*")).remove();
                attachTo.append(target);
            });
        }
    }

    $.get("/books", function (data) {
        const books = data;
        $("nav").append(
            $("<ul></ul>").append(...books.map(book => {
                const id = book.id;
                const name = book.name;
                return $("<li></li>").append(
                    $(`<a href="#" data-id="${id}"></a>`).append(name).click(function () {
                        const id = book.id;
                        loadChapterFunc(id, 1)();
                        $("html, body").animate({
                            scrollTop: $(`#book-${id}`).offset().top
                        });
                    }));
            })));

        $.get("/load", function (data) {
            const renderInfo = data;
            const keys = [];
            for (let key in renderInfo) {
                keys.push(key);
            }

            keys.sort((x, y) => {
                const x1 = x.split("-").map(x$ => parseInt(x$));
                const y1 = y.split("-").map(y$ => parseInt(y$));

                if (x1[0] !== y1[0]) return x1[0] - y1[0];
                return x1[1] - y1[1];
            });

            $("div#contents").append(...keys.map(v => {
                const ret = $(`<div class="bible-block" id="${v}" style="height: ${data[v]};"></div>`);
                const vs = v.split("-");
                if (vs[1] === "0") {
                    const bookIdx = parseInt(vs[0]);
                    ret.append($(`<h2><a id="book-${bookIdx}">${books[bookIdx - 1].name}</a></h2>`));
                }
                return ret;
            }));

            loadChapterFunc(1, 1)();
        });
    });
});