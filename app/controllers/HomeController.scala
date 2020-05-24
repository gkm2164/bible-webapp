package controllers

import java.io.PrintWriter

import javax.inject._
import play.api.libs.json._
import play.api.mvc._

import scala.collection.immutable.TreeMap
import scala.io.Source

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
  def index: Action[AnyContent] = Action {
    Ok(views.html.index())
  }

  def getBible: Action[AnyContent] = Action { request =>
    import entities.EntityJson._

    val bibles: Map[String, entities.Bible] = repository.read
    val jsonBibles = Json.toJson(bibles)
    Ok(jsonBibles)
  }
}
