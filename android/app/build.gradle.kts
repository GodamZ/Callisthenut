plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }

val webAssets = tasks.register<Sync>("prepareWebAssets") {
    from(rootProject.projectDir.parentFile) {
        include("privacy.html")
    }
    into(layout.buildDirectory.dir("generated/webAssets/www"))
}
android {
    namespace = "fr.callisthenut.app"
    compileSdk = 36
    defaultConfig { applicationId = "fr.callisthenut.app"; minSdk = 28; targetSdk = 35; versionCode = 25; versionName = "2.5" }
    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/webAssets"))
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
}
tasks.named("preBuild").configure { dependsOn(webAssets) }
dependencies {
    testImplementation("junit:junit:4.13.2")
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.health.connect:connect-client:1.1.0")
}
