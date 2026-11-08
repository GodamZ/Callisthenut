package fr.callisthenut.app

import java.net.URI

// GitHub Pages shares an origin across repositories: pin the repository path too.
object SitePolicy {
    const val ORIGIN = "https://godamz.github.io"
    const val PATH = "/Callisthenut/"
    const val HOME = "$ORIGIN$PATH"
    const val BOOTSTRAP = "${HOME}__android_storage_bootstrap"

    fun permitsResource(url: String): Boolean = try {
        val uri = URI(url)
        uri.scheme == "https" && uri.host == "godamz.github.io" &&
            uri.userInfo == null && uri.port in setOf(-1, 443) &&
            uri.path.startsWith(PATH) && uri.normalize().path == uri.path &&
            uri.path.split('/').none { it == "." || it == ".." } &&
            !uri.path.contains('\\') && !uri.path.contains('%')
    } catch (_: Exception) { false }

    fun permitsHealth(url: String): Boolean = permitsResource(url) && try {
        URI(url).path in setOf(PATH, "${PATH}index.html")
    } catch (_: Exception) { false }
}
