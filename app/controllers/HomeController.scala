package controllers

import entities.{Bible, Book}
import javax.inject._
import play.api.libs.json._
import play.api.mvc._
import render.ClientRenderer
import entities.EntityJson._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  /**
   * Create an Action to render an HTML page with a welcome message.
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  val clientRenderer = new ClientRenderer()

  val bibles: Map[String, entities.Bible] = repository.read

  lazy val heightsMap = Json.toJson(clientRenderer.load(bibles("NRSV")))

  def load: Action[AnyContent] = Action {
    Ok(heightsMap)
  }

  def nonAjax: Action[AnyContent] = Action {
    Ok(views.html.contents(bibles))
  }

  def index: Action[AnyContent] = Action {
    Ok(views.html.index())
  }

  def getBooks: Action[AnyContent] = Action { request =>
    Ok(Json.toJson(bibles("NRSV").books.map {
      case Book(id, name, _) =>
        Book(id, name, Nil)
    }))
  }

  def getBible: Action[AnyContent] = Action { request =>

    val bookIdQuery = request.getQueryString("book")
    val chapterIdQuery = request.getQueryString("chap")
    val filteredBible = (for {
      bookId <- bookIdQuery
      chapId <- chapterIdQuery
    } yield {
      Json.toJson(bibles("NRSV").books.find(_.id == bookId.toInt)
        .flatMap(_.chapters.find(_.id == chapId.toInt)))
    }).getOrElse(Json.toJson(bibles))

    Ok(filteredBible)
  }
}
