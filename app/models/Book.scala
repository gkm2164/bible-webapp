package models

case class Book(id: Int, name: String, verses: Int)

case class Verse(id: String, bookId: Int, chap: Int, verse: Int, sentence: String)
