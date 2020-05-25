package render

import java.io.File

import entities.{Bible, Book, Chapter}

import scala.collection.JavaConverters._
import io.github.bonigarcia.wdm.WebDriverManager
import org.openqa.selenium.{By, JavascriptExecutor}
import org.openqa.selenium.chrome.{ChromeDriver, ChromeOptions}
import org.openqa.selenium.support.ui.WebDriverWait

class ClientRenderer {
  WebDriverManager.chromedriver().setup();

  val driver = new ChromeDriver({
    val ret = new ChromeOptions
    ret.setHeadless(true)
    ret
  })

  def load(bibles: Bible): Map[String, String] = {
    driver.get("http://localhost:9000/raw")
    val driverWait: WebDriverWait = new WebDriverWait(driver, 10)

    driverWait.until(driver =>
      driver.asInstanceOf[JavascriptExecutor]
        .executeScript("return document.readyState;").equals("complete")
    )

    println("finishLoading: " + driver.executeScript("return document.readyState;"))

    val ret = for {
      Book(bookId, _, chapters) <- bibles.books
      Chapter(chapterId, _) <- (Chapter(0, Nil) +: chapters)
    } yield {
      val height = driver.findElement(By.cssSelector(s"#chapter-$bookId-$chapterId")).getCssValue("height")
      println(height)
      s"$bookId-$chapterId" -> height
    }

    ret.toMap
  }
}
