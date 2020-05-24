import entities.{Bible, Book, Chapter, Verse}

import scala.io.Source

package object repository {
  val FILELIST: Seq[String] = "Bible_English_NRSV.spb" :: "Bible_English_TNIV.spb" :: Nil

  case class IntermBook(toInt: Int, name: String, toInt1: Int)

  case class IntermVerse(id: String, bookId: Int, chapter: Int, verse: Int, text: String)

  def readFile(filename: String): Bible = {
    val bibleSource = Source.fromFile(filename)
    val bibleStrings = bibleSource.mkString("")
    val bibleEntry = bibleStrings.split("\n").filterNot(_.startsWith("#"))
    val (booksRaw, contentsRaw_) = bibleEntry.span(x => !x.startsWith("-"))
    val contentsRaw = contentsRaw_.drop(1)

    val intermBooks = booksRaw.map(_.split("\t")).map {
      case Array(idStr, name, versesStr) =>
        idStr.toInt -> IntermBook(idStr.toInt, name, versesStr.toInt)
    }.toMap

    val intermVerses = contentsRaw.map(_.split("\t")).map {
      case Array(id, bookIdStr, chapStr, verseStr, text) =>
        IntermVerse(id, bookIdStr.toInt, chapStr.toInt, verseStr.toInt, text)
    }

    val Array(_, language, version) = filename.takeWhile(_ != '.').split("_")

    Bible(language, version,
      intermVerses.groupBy(_.bookId).toList.sortBy(_._1).map { case (id, chapters) =>
        Book(intermBooks(id).name, toChapter(chapters))
      })
  }

  def toChapter(chapters: Array[IntermVerse]): Seq[entities.Chapter] = {
    chapters.groupBy(_.chapter).toSeq.sortBy(_._1).map {
      case (id, verses) => {
        Chapter(id, verses.toSeq.sortBy(_.verse).map {
          case IntermVerse(id, _, _, verse, text) => Verse(id, verse, text)
        })
      }
    }
  }

  def read: Map[String, Bible] = {
    FILELIST.map(readFile).groupBy(_.version).mapValues(_.head)
  }
}