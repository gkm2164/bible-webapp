$(function () {
    const loaded = {};

    function createVerse(target, bookId, chapterId, verse) {
        return target.append($("<div class='verse-block'></div>").append(
            $("<span class='verse-header'></span>")
                .append(verse.verse))
            .append($("<span class='verse-sentence'></span>")
                .append(verse.text)
            ));
    }

    function findNearestHead(on, value) {
        function loop(left, right) {
            const mid = Math.floor((left + right) / 2);

            if (mid === left) return left;

            if (value > on[mid]) return loop(mid, right);
            else return loop(left, mid);
        }

        return loop(0, on.length);
    }


    function loadChapterFunc(bid, cid) {
        return function () {
            const bookId = bid;
            const chapterId = cid;
            $.get(`/bibles?book=${bookId}&chap=${chapterId}`, function (c) {
                loaded[`${bid}-${cid}`] = true;

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
            const keys = Object.keys(renderInfo);

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

            const locs = keys.map(x => {
                console.log(x);
                return $("#" + x).offset().top;
            });

            const loaded = {};

            window.onscroll = function () {
                const start = window.pageYOffset;
                const end = start + window.innerHeight;

                const from = findNearestHead(locs,
                    start);
                const to = findNearestHead(locs,
                    end);

                console.log("from: " + from, "to: " + to);
                for (let i = from; i <= to; i++) {
                    console.log("key: ", keys[i]);
                    if (keys[i].endsWith("-0")) {
                        continue;
                    } else if (loaded.hasOwnProperty(keys[i])) {
                        continue;
                    }

                    const key = keys[i].split("-");
                    const bookId = parseInt(key[0]);
                    const chapId = parseInt(key[1]);
                    loadChapterFunc(bookId, chapId)();
                }
            }
        });
    });
});