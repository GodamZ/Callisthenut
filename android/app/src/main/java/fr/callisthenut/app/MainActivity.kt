package fr.callisthenut.app

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.activity.ComponentActivity
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
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.ByteArrayInputStream
import java.time.LocalDate
import java.time.ZoneId

class MainActivity : ComponentActivity() {
    private lateinit var web: WebView
    private val origin = "https://appassets.androidplatform.net"
    private val permissions = setOf(HealthPermission.getReadPermission(StepsRecord::class))
    private val prefs by lazy { getSharedPreferences("health", MODE_PRIVATE) }
    private var pageReady = false
    private var syncing = false
    private var requesting = false
    private val permissionRequest = registerForActivityResult(PermissionController.createRequestPermissionResultContract()) { granted ->
        requesting = false
        if (granted.containsAll(permissions)) {
            prefs.edit().putBoolean("enabled", true).apply()
            syncSteps(false)
        } else {
            prefs.edit().putBoolean("enabled", false).apply()
            sendError("Accès aux pas refusé. Tu peux continuer avec la saisie manuelle.")
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        web = WebView(this)
        setContentView(web)
        web.setOnApplyWindowInsetsListener { view, insets ->
            view.setPadding(insets.systemWindowInsetLeft, insets.systemWindowInsetTop, insets.systemWindowInsetRight, insets.systemWindowInsetBottom)
            insets
        }
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.allowFileAccess = false
        web.settings.allowContentAccess = false
        val assets = WebViewAssetLoader.Builder().addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this)).build()
        val rationale = intent.action == "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" || intent.action == "android.intent.action.VIEW_PERMISSION_USAGE"
        web.webViewClient = object : WebViewClientCompat() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                return assets.shouldInterceptRequest(request.url)
                    ?: WebResourceResponse("text/plain", "utf-8", ByteArrayInputStream(ByteArray(0)))
            }
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                if (uri.scheme == "https" && uri.host == "appassets.androidplatform.net" && uri.path?.startsWith("/assets/www/") == true) return false
                if (request.isForMainFrame && uri.scheme == "https") {
                    try { startActivity(Intent(Intent.ACTION_VIEW, uri)) } catch (_: Exception) { }
                }
                return true
            }
            override fun onPageFinished(view: WebView, url: String) {
                if (url != "$origin/assets/www/index.html") return
                pageReady = true
                if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
                    view.evaluateJavascript("window.AndroidHealth={syncSteps:()=>HealthBridge.postMessage('sync'),disconnect:()=>HealthBridge.postMessage('disconnect')};renderHealth();", null)
                    if (prefs.getBoolean("enabled", false)) syncSteps(false)
                }
            }
        }
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(web, "HealthBridge", setOf(origin)) { _, message, _, mainFrame, _ ->
                if (mainFrame) runOnUiThread {
                    when (message.data) {
                        "sync" -> syncSteps(true)
                        "disconnect" -> prefs.edit().putBoolean("enabled", false).apply()
                    }
                }
            }
        }
        web.loadUrl("$origin/assets/www/${if (rationale) "privacy.html" else "index.html"}")
    }

    override fun onResume() {
        super.onResume()
        if (pageReady && prefs.getBoolean("enabled", false) && !requesting) syncSteps(false)
    }

    private fun syncSteps(interactive: Boolean) {
        if (syncing || requesting || !pageReady) return
        when (HealthConnectClient.getSdkStatus(this)) {
            HealthConnectClient.SDK_UNAVAILABLE -> { sendError("Health Connect n’est pas disponible sur cet appareil."); return }
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> { sendError("Installe ou mets à jour Health Connect, puis réessaie."); return }
        }
        syncing = true
        lifecycleScope.launch {
            try {
                val client = HealthConnectClient.getOrCreate(this@MainActivity)
                if (!client.permissionController.getGrantedPermissions().containsAll(permissions)) {
                    prefs.edit().putBoolean("enabled", false).apply()
                    if (interactive) { requesting = true; permissionRequest.launch(permissions) }
                    else sendError("Autorisation des pas révoquée. Reconnecte Health Connect pour reprendre.")
                    return@launch
                }
                prefs.edit().putBoolean("enabled", true).apply()
                val day = LocalDate.now()
                val start = day.atStartOfDay(ZoneId.systemDefault()).toInstant()
                // Health Connect aggregation deduplicates overlapping sources.
                val result = client.aggregate(AggregateRequest(setOf(StepsRecord.COUNT_TOTAL), TimeRangeFilter.between(start, java.time.Instant.now())))
                if (prefs.getBoolean("enabled", false)) deliver(JSONObject().put("date", day.toString()).put("steps", result[StepsRecord.COUNT_TOTAL] ?: 0L))
            } catch (_: Exception) {
                sendError("Synchronisation impossible. Vérifie Health Connect et ses autorisations, puis réessaie.")
            } finally { syncing = false }
        }
    }
    private fun sendError(message: String) = deliver(JSONObject().put("error", message))
    private fun deliver(payload: JSONObject) {
        if (pageReady) web.evaluateJavascript("window.receiveHealthSteps && window.receiveHealthSteps($payload);", null)
    }
    override fun onDestroy() { pageReady = false; web.destroy(); super.onDestroy() }
}
