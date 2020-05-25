package render

import java.io.File

import scala.collection.JavaConverters._

import io.github.bonigarcia.wdm.WebDriverManager
import org.openqa.selenium.{By, JavascriptExecutor, OutputType}
import org.openqa.selenium.chrome.{ChromeDriver, ChromeOptions}
import org.openqa.selenium.support.ui.WebDriverWait

class ClientRenderer {
  WebDriverManager.chromedriver().setup();

  val driver = new ChromeDriver({
    val ret = new ChromeOptions
    ret.setHeadless(true)
    ret
  })

  def load = {
    driver.get("http://localhost:9000/raw")
    val driverWait: WebDriverWait = new WebDriverWait(driver, 10)

    driverWait.until(driver =>
      driver.asInstanceOf[JavascriptExecutor]
        .executeScript("return document.readyState;").equals("complete")
    )

    println("finishLoading: " + driver.executeScript("return document.readyState;"))
//    val file = driver.getScreenshotAs(OutputType.FILE)
//    import org.apache.commons.io.FileUtils
//    FileUtils.copyFile(file, new File(s"screenshot-${System.currentTimeMillis()}.png"))

    println(driver.findElements(By.cssSelector("div.book")).asScala.map(_.getCssValue("height")))
  }
}
