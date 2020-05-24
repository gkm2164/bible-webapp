package controllers

import javax.inject._
import models.{Book, Verse}
import play.api.mvc._

import scala.collection.immutable.TreeMap
import scala.io.Source

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  private val nrsvBibleDataFile = "Bible_English_NRSV.spb"
  private val nivBibleDataFile = "Bible_English_TNIV.spb"

  def readFromDisk(fileName: String): (List[Book], List[Verse]) = {
    val bibleSource = Source.fromFile(fileName)
    val bibleStrings = bibleSource.mkString("")
    val bibleEntry = bibleStrings.split("\n").filterNot(_.startsWith("#"))
    val (booksRaw, contentsRaw_) = bibleEntry.span(x => !x.startsWith("-"))
    val contentsRaw = contentsRaw_.drop(1)

    (booksRaw.map(_.split("\t")).map {
      case Array(idStr, name, versesStr) =>
        Book(idStr.toInt, name, versesStr.toInt)
    }.toList, contentsRaw.map(_.split("\t")).map {
      case Array(id, bookIdStr, chapStr, verseStr, sentence) =>
        Verse(id, bookIdStr.toInt, chapStr.toInt, verseStr.toInt, sentence)
    }.toList)
  }

  val (books, contents) = readFromDisk(nrsvBibleDataFile)
  val (nivBooks, nivContents) = readFromDisk(nivBibleDataFile)

  val bookMap: TreeMap[Int, Book] = TreeMap(books.map(x => x.id -> x): _*)
  val nivBookMap: TreeMap[Int, Book] = TreeMap(nivBooks.map(x => x.id -> x): _*)

  val bibleMap: Map[Int, Map[Int, Map[Int, Verse]]] =
    TreeMap(contents.groupBy(_.bookId)
      .mapValues(x => TreeMap(x.groupBy(_.chap)
        .mapValues(y => TreeMap(y.map(k => k.verse -> k): _*))
        .toArray: _*))
      .toArray: _*)

  val nivBibleMap: Map[Int, Map[Int, Map[Int, Verse]]] =
    TreeMap(nivContents.groupBy(_.bookId)
      .mapValues(x => TreeMap(x.groupBy(_.chap)
        .mapValues(y => TreeMap(y.map(k => k.verse -> k): _*))
        .toArray: _*))
      .toArray: _*)

  type BookToVerseMap = Map[Int, Map[Int, Map[Int, Verse]]]
  type CombinedBookToVerseMap = Map[Int, Map[Int, Map[Int, (Verse, Verse)]]]

  def zipLastMapValues(a: BookToVerseMap,
                       b: BookToVerseMap): CombinedBookToVerseMap = {
    def zipLastMapValues2(intToIntToVerse: Map[Int, Map[Int, Verse]],
                          intToIntToVerse1: Map[Int, Map[Int, Verse]]): Map[Int, Map[Int, (Verse, Verse)]] = {
      def zipLastMapValues3(intToVerse: Map[Int, Verse], intToVerse2: Map[Int, Verse]): Map[Int, (Verse, Verse)] = {
        val nrsvVerse = intToVerse.keySet
        val nivVerse = intToVerse2.keySet
        val x: Seq[(Int, (Verse, Verse))] = (for {
          k <- nrsvVerse.union(nivVerse)
          v1 <- intToVerse.get(k)
          v2 <- intToVerse2.get(k)
        } yield k -> (v1, v2)).toSeq

        TreeMap(x: _*)
      }

      val nrsvChap = intToIntToVerse.keySet
      val nivChap = intToIntToVerse1.keySet

      val x = (for {
        k <- nrsvChap.union(nivChap)
        v1 <- intToIntToVerse.get(k)
        v2 <- intToIntToVerse1.get(k)
      } yield k -> zipLastMapValues3(v1, v2)).toSeq

      TreeMap(x: _*)
    }

    val nrsvBook = a.keySet
    val nivBook = b.keySet

    val x = (for {
      k <- nrsvBook.union(nivBook)
      v1 <- a.get(k)
      v2 <- b.get(k)
    } yield k -> zipLastMapValues2(v1, v2)).toSeq

    TreeMap(x: _*)
  }

  /**
   * Create an Action to render an HTML page with a welcome message.
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index: Action[AnyContent] = Action {
    val map: CombinedBookToVerseMap = zipLastMapValues(bibleMap, nivBibleMap)

    Ok(views.html.index(bookMap, map))
  }
}
