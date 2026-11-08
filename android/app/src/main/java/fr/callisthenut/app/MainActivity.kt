package fr.callisthenut.app

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.os.SystemClock
import android.util.Log
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.lifecycle.lifecycleScope
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import androidx.webkit.WebResourceErrorCompat
import androidx.webkit.ServiceWorkerClientCompat
import androidx.webkit.ServiceWorkerControllerCompat
import kotlinx.coroutines.launch
import org.json.JSONObject
import org.json.JSONTokener
import java.io.ByteArrayInputStream
import java.time.LocalDate
import java.time.ZoneId

class MainActivity : ComponentActivity() {
    private lateinit var web: WebView
    private val localOrigin = "https://appassets.androidplatform.net"
    private val migrationUrl = "$localOrigin/assets/migration.html"
    private var legacyState: String? = null
    @Volatile private var bootstrapping = false
    private var loadFailed = false
    private var errorDialog: AlertDialog? = null
    private var pausedAt = 0L
    private val permissions = setOf(HealthPermission.getReadPermission(StepsRecord::class))
    private val prefs by lazy { getSharedPreferences("health", MODE_PRIVATE) }
    private var pageReady = false
    private var syncing = false
    private var requesting = false
    private val permissionRequest = registerForActivityResult(PermissionController.createRequestPermissionResultContract()) { granted ->
        requesting = false
        if (granted.containsAll(permissions)) {
            prefs.edit().putBoolean("enabled", true).apply()
            web.post { syncSteps(false) }
        } else {
            prefs.edit().putBoolean("enabled", false).apply()
            sendError("Accès aux pas refusé. Tu peux continuer avec la saisie manuelle.")
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val container = FrameLayout(this)
        web = WebView(this)
        container.addView(web, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
        setContentView(container)
        // Pad the parent, so fixed CSS elements see the smaller, safe viewport.
        ViewCompat.setOnApplyWindowInsetsListener(container) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }
        ViewCompat.requestApplyInsets(container)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.allowFileAccess = false
        web.settings.allowContentAccess = false
        web.settings.cacheMode = WebSettings.LOAD_NO_CACHE
        web.settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        web.settings.setSupportMultipleWindows(false)
        val assets = WebViewAssetLoader.Builder().addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this)).build()
        val rationale = intent.action == "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" || intent.action == "android.intent.action.VIEW_PERMISSION_USAGE"
        web.webViewClient = object : WebViewClientCompat() {
            override fun onPageStarted(view: WebView, url: String, favicon: android.graphics.Bitmap?) {
                pageReady = false
                loadFailed = false
            }
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                if (request.url.toString() == SitePolicy.BOOTSTRAP && bootstrapping) {
                    return bootstrapResponse()
                }
                return assets.shouldInterceptRequest(request.url)
                    ?: if (SitePolicy.permitsResource(request.url.toString())) null else blockedResponse()
            }
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                if (SitePolicy.permitsResource(uri.toString()) || uri.toString() == migrationUrl || uri.toString() == "$localOrigin/assets/www/privacy.html") return false
                if (request.isForMainFrame && uri.scheme == "https") {
                    try { startActivity(Intent(Intent.ACTION_VIEW, uri)) } catch (_: Exception) { }
                }
                return true
            }
            override fun onPageFinished(view: WebView, url: String) {
                if (loadFailed) return
                if (url == migrationUrl) { readLegacyState(); return }
                if (url == SitePolicy.BOOTSTRAP && bootstrapping) { importLegacyState(); return }
                if (!SitePolicy.permitsHealth(url)) return
                if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
                    // Wait until the JS receiver exists, including when index.html has a #route.
                    view.evaluateJavascript("(function(){if(typeof window.receiveHealthSteps!=='function'||typeof renderHealth!=='function')return false;window.AndroidHealth={systemInsetsHandled:true,syncSteps:()=>HealthBridge.postMessage('sync'),disconnect:()=>HealthBridge.postMessage('disconnect')};renderHealth();return true})()") { ready ->
                        if (!SitePolicy.permitsHealth(web.url.orEmpty())) return@evaluateJavascript
                        if (ready == "true") {
                            pageReady = true
                            deliver(JSONObject().put("status", "ready").put("enabled", prefs.getBoolean("enabled", false)))
                            if (prefs.getBoolean("enabled", false)) syncSteps(false)
                        } else {
                            Log.e("CallisthenutHealth", "Web receiver not ready after page load")
                            showLoadError("Le site chargé ne contient pas encore la connexion Health Connect. Publie la version à jour du site sur GitHub Pages, puis réessaie.")
                        }
                    }
                } else {
                    view.evaluateJavascript("window.healthBridgeIssue='Cette version d’Android System WebView ne permet pas la connexion. Mets à jour Android System WebView et Chrome, puis rouvre Callisthenut.';if(typeof renderHealth==='function')renderHealth();", null)
                }
            }
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceErrorCompat) {
                if (request.isForMainFrame) {
                    loadFailed = true; pageReady = false
                    showLoadError("Le site GitHub Pages est inaccessible. Vérifie ta connexion Internet, puis réessaie.")
                }
            }
            override fun onReceivedHttpError(view: WebView, request: WebResourceRequest, response: WebResourceResponse) {
                if (request.isForMainFrame && response.statusCode >= 400) {
                    loadFailed = true; pageReady = false
                    showLoadError("GitHub Pages a répondu avec l’erreur ${response.statusCode}. Vérifie que le site est publié, puis réessaie.")
                }
            }
        }
        if (WebViewFeature.isFeatureSupported(WebViewFeature.SERVICE_WORKER_BASIC_USAGE)) {
            ServiceWorkerControllerCompat.getInstance().setServiceWorkerClient(object : ServiceWorkerClientCompat() {
                override fun shouldInterceptRequest(request: WebResourceRequest): WebResourceResponse? =
                    if (request.url.toString() == SitePolicy.BOOTSTRAP && bootstrapping) bootstrapResponse()
                    else if (SitePolicy.permitsResource(request.url.toString())) null else blockedResponse()
            })
        }
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(web, "HealthBridge", setOf(SitePolicy.ORIGIN)) { _, message, sourceOrigin, mainFrame, _ ->
                if (mainFrame && sourceOrigin.toString().trimEnd('/') == SitePolicy.ORIGIN) runOnUiThread {
                    if (!pageReady || !SitePolicy.permitsHealth(web.url.orEmpty())) return@runOnUiThread
                    when (message.data) {
                        "sync" -> syncSteps(true)
                        "disconnect" -> {
                            prefs.edit().putBoolean("enabled", false).apply()
                            deliver(JSONObject().put("status", "disconnected").put("enabled", false))
                        }
                    }
                }
            }
        }
        if (rationale) web.loadUrl("$localOrigin/assets/www/privacy.html")
        else if (!prefs.getBoolean("remoteStorageMigrated", false)) web.loadUrl(migrationUrl)
        else loadSite()
    }

    private fun blockedResponse() = WebResourceResponse("text/plain", "utf-8", 403, "Forbidden", emptyMap(), ByteArrayInputStream(ByteArray(0)))
    private fun bootstrapResponse() = WebResourceResponse("text/html", "utf-8", ByteArrayInputStream("<!doctype html><title>Callisthenut</title>".toByteArray()))

    private fun loadSite() {
        pageReady = false
        web.loadUrl(SitePolicy.HOME, mapOf("Cache-Control" to "no-cache"))
    }

    private fun readLegacyState() {
        web.evaluateJavascript("localStorage.getItem('callisthenut-state') || localStorage.getItem('callisterik-state') || ''") { value ->
            try {
                val raw = JSONTokener(value).nextValue() as? String
                if (!raw.isNullOrBlank()) {
                    JSONObject(raw) // Validate before copying, never log the user's data.
                    legacyState = raw
                    bootstrapping = true
                    web.loadUrl(SitePolicy.BOOTSTRAP)
                } else {
                    prefs.edit().putBoolean("remoteStorageMigrated", true).apply()
                    loadSite()
                }
            } catch (_: Exception) {
                showLoadError("L’ancienne progression n’a pas pu être transférée. Elle est conservée sur cet appareil. Réessaie avant d’ouvrir la nouvelle version.")
            }
        }
    }

    private fun importLegacyState() {
        val data = legacyState ?: return
        val script = "(function(){try{if(!localStorage.getItem('callisthenut-state')&&!localStorage.getItem('callisterik-state'))localStorage.setItem('callisthenut-state',${JSONObject.quote(data)});return true}catch(e){return false}})()"
        web.evaluateJavascript(script) { result ->
            if (result == "true") {
                legacyState = null; bootstrapping = false
                prefs.edit().putBoolean("remoteStorageMigrated", true).apply()
                loadSite()
            } else showLoadError("Le transfert de progression a échoué. Les données d’origine sont conservées ; réessaie.")
        }
    }

    private fun showLoadError(message: String) {
        if (isFinishing || errorDialog?.isShowing == true) return
        errorDialog = AlertDialog.Builder(this).setTitle("Chargement de Callisthenut").setMessage(message)
            .setPositiveButton("Réessayer") { _, _ ->
                if (!prefs.getBoolean("remoteStorageMigrated", false)) web.loadUrl(migrationUrl) else loadSite()
            }.setNegativeButton("Fermer") { _, _ -> finish() }.show()
    }

    override fun onResume() {
        super.onResume()
        val timeAway = if (pausedAt == 0L) 0L else SystemClock.elapsedRealtime() - pausedAt
        pausedAt = 0L
        if (pageReady && !requesting && timeAway >= 60000L) {
            // Refresh only from an idle home screen; never interrupt a workout or dialog.
            web.evaluateJavascript("!!document.querySelector('[data-view=\"today\"].active') && (typeof session==='undefined'||!session) && (typeof cindySession==='undefined'||!cindySession) && (typeof kettlebellSession==='undefined'||!kettlebellSession) && !document.querySelector('dialog[open]')") { idle ->
                if (idle == "true" && pageReady && SitePolicy.permitsHealth(web.url.orEmpty())) loadSite()
                else if (pageReady && prefs.getBoolean("enabled", false)) syncSteps(false)
            }
            return
        }
        if (pageReady && prefs.getBoolean("enabled", false) && !requesting) syncSteps(false)
    }

    override fun onPause() {
        pausedAt = SystemClock.elapsedRealtime()
        super.onPause()
    }

    private fun syncSteps(interactive: Boolean) {
        if (syncing || requesting || !pageReady) return
        syncing = true
        lifecycleScope.launch {
            try {
                when (HealthConnectClient.getSdkStatus(this@MainActivity)) {
                    HealthConnectClient.SDK_UNAVAILABLE -> { sendError("Health Connect n’est pas disponible sur cet appareil.", "unavailable"); return@launch }
                    HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> { sendError("Installe ou mets à jour Health Connect depuis Google Play, puis réessaie. Sur Android 14 et ultérieur, vérifie les mises à jour système et Google Play.", "update_required"); return@launch }
                }
                val client = HealthConnectClient.getOrCreate(this@MainActivity)
                if (!client.permissionController.getGrantedPermissions().containsAll(permissions)) {
                    prefs.edit().putBoolean("enabled", false).apply()
                    if (interactive) { requesting = true; permissionRequest.launch(permissions) }
                    else sendError("Autorisation des pas révoquée. Reconnecte Health Connect pour reprendre.", "permission_required")
                    return@launch
                }
                prefs.edit().putBoolean("enabled", true).apply()
                val day = LocalDate.now()
                val start = day.atStartOfDay(ZoneId.systemDefault()).toInstant()
                // Health Connect aggregation deduplicates overlapping sources.
                val result = client.aggregate(AggregateRequest(setOf(StepsRecord.COUNT_TOTAL), TimeRangeFilter.between(start, java.time.Instant.now())))
                val count = result[StepsRecord.COUNT_TOTAL]
                if (prefs.getBoolean("enabled", false)) deliver(JSONObject().put("date", day.toString()).put("steps", count ?: 0L).put("hasData", count != null).put("enabled", true))
            } catch (error: SecurityException) {
                requesting = false
                prefs.edit().putBoolean("enabled", false).apply()
                Log.w("CallisthenutHealth", "Step permission denied", error)
                sendError("La lecture des pas n’est pas autorisée. Ouvre les autorisations de Health Connect et accorde les pas à Callisthenut.", "permission_denied")
            } catch (error: Exception) {
                requesting = false
                Log.w("CallisthenutHealth", "Health Connect request failed", error)
                sendError("Health Connect n’a pas pu répondre. Vérifie sa mise à jour et ses autorisations, puis réessaie. Code : ${error.javaClass.simpleName}.", "read_failed")
            } finally { syncing = false }
        }
    }
    private fun sendError(message: String, code: String = "permission_denied") = deliver(JSONObject().put("error", message).put("code", code).put("enabled", prefs.getBoolean("enabled", false)))
    private fun deliver(payload: JSONObject) {
        if (pageReady && SitePolicy.permitsHealth(web.url.orEmpty())) web.evaluateJavascript("window.receiveHealthSteps && window.receiveHealthSteps($payload);", null)
    }
    override fun onDestroy() { pageReady = false; errorDialog?.dismiss(); web.destroy(); super.onDestroy() }
}
