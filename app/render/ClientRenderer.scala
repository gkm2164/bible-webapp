package render

import entities.{Bible, Book, Chapter}
import io.github.bonigarcia.wdm.WebDriverManager
import me.tongfei.progressbar.ProgressBar
import org.openqa.selenium.{By, JavascriptExecutor}
import org.openqa.selenium.chrome.{ChromeDriver, ChromeOptions}
import org.openqa.selenium.support.ui.WebDriverWait

class ClientRenderer {
  WebDriverManager.chromedriver()
    .setup()

  val driver = new ChromeDriver(
    new ChromeOptions() {{
      setHeadless(true)
    }}
  )

  def load(bibles: Bible): Map[String, String] = {
    driver.get("http://localhost:9000/raw")
    val driverWait: WebDriverWait = new WebDriverWait(driver, 10)

    driverWait.until(driver =>
      driver.asInstanceOf[JavascriptExecutor]
        .executeScript("return document.readyState;").equals("complete")
    )

    println("finishLoading: " + driver.executeScript("return document.readyState;"))

    val cnts = (for {
      Book(_, _, chapters) <- bibles.books
      Chapter(_, _) <- Chapter(0, Nil) +: chapters
    } yield 1).sum

    val pb = new ProgressBar("Loading heights", cnts)

    val ret = for {
      Book(bookId, _, chapters) <- bibles.books
      Chapter(chapterId, _) <- Chapter(0, Nil) +: chapters
    } yield {
      val height = driver.findElement(By.cssSelector(s"#chapter-$bookId-$chapterId")).getCssValue("height")
      pb.step()
      s"$bookId-$chapterId" -> height
    }

    pb.close()
    driver.close()

    ret.toMap
  }
}
