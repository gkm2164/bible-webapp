package controllers

import entities.Bible
import javax.inject._
import play.api.libs.json._
import play.api.mvc._
import render.ClientRenderer

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


  def load: Action[AnyContent] = Action {
    clientRenderer.load
    Ok("")
  }

  def nonAjax: Action[AnyContent] = Action {
    Ok(views.html.contents(bibles))
  }

  def index: Action[AnyContent] = Action {
    Ok(views.html.index())
  }

  def getBible: Action[AnyContent] = Action { request =>
    import entities.EntityJson._

    val bookId = request.getQueryString("book")
    val filteredBible = {
      bookId match {
        case Some(n) =>
          val id = n.toInt - 1
          bibles.mapValues{
            case Bible(language, version, books) =>
              Bible(language, version, books.slice(id, id + 1))
          }
        case None => bibles
      }
    }

    val jsonBibles = Json.toJson(filteredBible)
    Ok(jsonBibles)
  }
}
