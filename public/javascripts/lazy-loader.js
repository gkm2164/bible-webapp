let bibleStats = {"0": 0};

$.get("/bibles?count", function (data) {
  bibleStats = data;
});

$(function () {
  const loaded = {};
  const StorageKey = "VERSE";

  try {
    if (!localStorage.getItem(StorageKey)) {
      localStorage.setItem(StorageKey, "{}");
    }
  } catch (e) {
    localStorage.setItem(StorageKey, "{}");
  }

  function isVerseClicked(verseId) {
    const set = localStorage.getItem(StorageKey);
    let obj = set === "" ? {} : JSON.parse(set);
    return obj.hasOwnProperty(verseId);
  }

  function addVerseClicked(verseId) {
    const set = localStorage.getItem(StorageKey);
    let obj = set === "" ? {} : JSON.parse(set);
    obj[verseId] = true;
    localStorage.setItem(StorageKey, JSON.stringify(obj));
  }

  function removeVerseClicked(verseId) {
    const set = localStorage.getItem(StorageKey);
    let obj = set === "" ? {} : JSON.parse(set);
    delete obj[verseId];
    localStorage.setItem(StorageKey, JSON.stringify(obj));
  }

  function toggleBlock(bookId, chapterId, verseId) {
    function makeKey(bookId, chapterId, verseId) {
      return `${bookId}-${chapterId}-${verseId}`;
    }

    function toggle(bookId, chapterId, verseId) {
      const key = makeKey(bookId, chapterId, verseId);
      if (isVerseClicked(key)) {
        removeVerseClicked(key);
        $(`#verse-${key}`).removeClass("block-clicked");
      } else {
        addVerseClicked(key);
        $(`#verse-${key}`).addClass("block-clicked");
      }
    }

    if (verseId) {
      return () => toggle(bookId, chapterId, verseId);
    } else if (chapterId) {
      return () => bibleStats[bookId][chapterId].forEach(verseId => toggle(bookId, chapterId, verseId));
    } else {
      return () => {
        const chaps = bibleStats[bookId];
        for (let chapId in chaps) {
          chaps[chapId].forEach(verseId => toggle(bookId, chapId, verseId));
        }
      }
    }
  }

  function createVerse(target, bookId, chapterId, verse) {
    const key = bookId + "-" + chapterId + "-" + verse.verse;
    const ret = $(`<div class="verse-block" id="verse-${bookId}-${chapterId}-${verse.verse}" data-parent="verse-${bookId}-${chapterId}"></div>`)
        .click(toggleBlock(bookId, chapterId, verse.verse))
        .append($("<span class='verse-header'></span>")
            .append(verse.verse)
            .append("&nbsp;"))
        .append($("<span class='verse-sentence'></span>")
            .append(verse.text));
    if (isVerseClicked(key)) {
      ret.addClass("block-clicked");
    } else {
      ret.removeClass("block-clicked");
    }
    return target.append(ret);
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
      const key = `${bid}-${cid}`;

      loaded[key] = true;
      $.get(`/bibles?book=${bookId}&chap=${chapterId}`, function (c) {
        const verseLength = c.verses.length;
        const target = $("<div class='chapter-block'></div>")
            .append($("<h3 class='chap-header'></h3>")
                .click(toggleBlock(bookId, chapterId))
                .append(c.id))
        const attachTo = $(`#${bookId}-${chapterId}`);
        for (let i = 0; i < verseLength; i++) {
          createVerse(target, bookId, cid, c.verses[i]);
        }
        attachTo.find($("*")).remove();
        attachTo.append(target);
      }).fail(() => delete loaded[key]);
    }
  }

  $.get("/books", function (data) {
    const books = data;
    console.log(books);
    $("nav").append(
        $("<ul></ul>").append(...books.map(book => {
          const id = book.id;
          const name = book.name;
          return $(`<li id='menu-${id}'></li>`).append($(`<a href="#" data-id="${id}"></a>`).append(name).click(function () {
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
        const vs = v.split("-");
        const ret = $(`<div class="bible-block" id="${v}" style="height: ${data[v]};"></div>`);
        if (vs[1] === "0") {
          const bookIdx = parseInt(vs[0]);
          ret.append($(`<h2><a id="book-${bookIdx}">${books[bookIdx - 1].name}</a></h2>`)
              .click(toggleBlock(vs[0])));
        }
        return ret;
      }));

      loadChapterFunc(1, 1)();

      const locs = keys.map(x => $("#" + x).offset().top);

      $(window).scroll(function () {
        const start = window.pageYOffset;
        const end = start + window.innerHeight;

        const from = findNearestHead(locs, start);
        const to = findNearestHead(locs, end);

        function cleanChapterBlock(idx) {
          const key = keys[idx];
          if (!key.endsWith(("-0"))) {
            $("#" + key).find($("*")).remove();
            delete loaded[key];
          }
        }

        if (from - 1 >= 0) {
          cleanChapterBlock(from - 1);
        }

        if (to + 1 < keys.length) {
          cleanChapterBlock(to + 1);
        }

        let boldingBooks = {};

        for (let i = from; i <= to; i++) {
          const key = keys[i];
          const splitKey = key.split("-");
          const bookId = parseInt(splitKey[0]);
          const chapId = parseInt(splitKey[1]);

          boldingBooks[bookId] = true;
          console.log(loaded);

          if (chapId === 0) {
            continue;
          }

          if (loaded[key]) {
            console.log("already loaded");
            continue;
          }

          loadChapterFunc(bookId, chapId)();
        }

        Object.keys(boldingBooks).forEach(x => $(`#menu-${x}`));
      });
    });
  });
});