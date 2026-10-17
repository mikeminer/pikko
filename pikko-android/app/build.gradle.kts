// PIKKO for Android: a Trusted Web Activity of https://pikko.art/play/ (Solana dApp Store / sideload).
// The game runs in the phone's Chrome engine, full screen, so the web build is the app (always up to date
// from the server) and its Solana wallet path (Mobile Wallet Adapter -> Seed Vault Wallet on the Seeker,
// or any MWA wallet app) works exactly as in Chrome. It is deliberately not a WebView: a WebView cannot
// start Mobile Wallet Adapter.
plugins {
    id("com.android.application")
}

android {
    namespace = "art.pikko.app"
    compileSdk = 36
    buildToolsVersion = "36.0.0"

    defaultConfig {
        applicationId = "art.pikko.app"
        minSdk = 24
        targetSdk = 36
        versionCode = 2
        versionName = "1.0.1"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            // signed afterwards by build.mjs with the release key kept outside the project
            signingConfig = null
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    lint {
        abortOnError = true
        checkReleaseBuilds = true
    }
}

dependencies {
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.7.3")
}
