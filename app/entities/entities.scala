import play.api.libs.functional.syntax._
import play.api.libs.json._

package object entities {

  case class Bible(language: String, version: String, books: Seq[Book])

  case class Book(id: Int, name: String, chapters: Seq[Chapter])

  case class Chapter(id: Int, verses: Seq[Verse])

  case class Verse(id: String, verse: Int, text: String)

  object EntityJson {
    implicit val verseWrites: Writes[Verse] = (
      (JsPath \ "id").write[String] and
        (JsPath \ "verse").write[Int] and
        (JsPath \ "text").write[String]
      ) (unlift(Verse.unapply))

    implicit val chapWrites: Writes[Chapter] = (
      (JsPath \ "id").write[Int] and
        (JsPath \ "verses").write[Seq[Verse]]
      ) (unlift(Chapter.unapply))

    implicit val bookWrites: Writes[Book] = (
      (JsPath \ "id").write[Int] and
        (JsPath \ "name").write[String] and
        (JsPath \ "chapters").write[Seq[Chapter]]
      ) (unlift(Book.unapply))

    implicit val bibleWrites: Writes[Bible] = (
      (JsPath \ "language").write[String] and
        (JsPath \ "version").write[String] and
        (JsPath \ "books").write[Seq[Book]]
      ) (unlift(Bible.unapply))
  }

}
