package fr.callisthenut.app

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SitePolicyTest {
    @Test fun healthIsRestrictedToTheAppEntryPoints() {
        listOf(SitePolicy.HOME, "${SitePolicy.HOME}index.html", "${SitePolicy.HOME}#steps", "${SitePolicy.HOME}?version=24#challenge/walk")
            .forEach { assertTrue(it, SitePolicy.permitsHealth(it)) }
        listOf("${SitePolicy.HOME}privacy.html", "${SitePolicy.HOME}images/picture.jpg", SitePolicy.BOOTSTRAP)
            .forEach { assertFalse(it, SitePolicy.permitsHealth(it)) }
    }
    @Test fun refusesOtherOriginsRepositoriesAndTraversal() {
        listOf(
            "http://godamz.github.io/Callisthenut/", "https://godamz.github.io:444/Callisthenut/",
            "https://other.github.io/Callisthenut/", "https://godamz.github.io/OtherRepo/",
            "https://godamz.github.io/Callisthenut-fake/", "https://godamz.github.io/",
            "https://godamz.github.io/Callisthenut/../OtherRepo/index.html",
            "https://godamz.github.io/Callisthenut/%2e%2e/OtherRepo/index.html",
            "https://godamz.github.io/Callisthenut/%252e%252e/OtherRepo/index.html",
            "https://user@godamz.github.io/Callisthenut/", "https://godamz.github.io.evil.test/Callisthenut/",
            "file:///Callisthenut/index.html", "javascript:alert(1)", "invalid"
        ).forEach { assertFalse(it, SitePolicy.permitsResource(it)); assertFalse(it, SitePolicy.permitsHealth(it)) }
    }
    @Test fun allowsOnlyResourcesInsideTheRepository() {
        listOf("${SitePolicy.HOME}health.js?v=23", "${SitePolicy.HOME}images/26325.jpg", "${SitePolicy.HOME}sw.js")
            .forEach { assertTrue(it, SitePolicy.permitsResource(it)) }
    }
}
