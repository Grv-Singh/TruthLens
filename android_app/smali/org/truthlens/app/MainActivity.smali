.class public Lorg/truthlens/app/MainActivity;
.super Landroid/app/Activity;
.source "MainActivity.java"

.field private webView:Landroid/webkit/WebView;

.method public constructor <init>()V
    .registers 1
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V
    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .registers 6

    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    new-instance v0, Landroid/webkit/WebView;
    invoke-direct {v0, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V
    iput-object v0, p0, Lorg/truthlens/app/MainActivity;->webView:Landroid/webkit/WebView;

    iget-object v0, p0, Lorg/truthlens/app/MainActivity;->webView:Landroid/webkit/WebView;
    invoke-virtual {v0}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;
    move-result-object v1

    const/4 v2, 0x1
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDatabaseEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowFileAccess(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowContentAccess(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setUseWideViewPort(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setLoadWithOverviewMode(Z)V

    iget-object v0, p0, Lorg/truthlens/app/MainActivity;->webView:Landroid/webkit/WebView;
    new-instance v3, Landroid/webkit/WebViewClient;
    invoke-direct {v3}, Landroid/webkit/WebViewClient;-><init>()V
    invoke-virtual {v0, v3}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V

    iget-object v0, p0, Lorg/truthlens/app/MainActivity;->webView:Landroid/webkit/WebView;
    new-instance v3, Landroid/webkit/WebChromeClient;
    invoke-direct {v3}, Landroid/webkit/WebChromeClient;-><init>()V
    invoke-virtual {v0, v3}, Landroid/webkit/WebView;->setWebChromeClient(Landroid/webkit/WebChromeClient;)V

    iget-object v0, p0, Lorg/truthlens/app/MainActivity;->webView:Landroid/webkit/WebView;
    const-string v3, "https://lens.truthortrust.com/demo"
    invoke-virtual {v0, v3}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V

    iget-object v0, p0, Lorg/truthlens/app/MainActivity;->webView:Landroid/webkit/WebView;
    invoke-virtual {p0, v0}, Landroid/app/Activity;->setContentView(Landroid/view/View;)V
    return-void
.end method

.method public onBackPressed()V
    .registers 2
    iget-object v0, p0, Lorg/truthlens/app/MainActivity;->webView:Landroid/webkit/WebView;
    if-eqz v0, :cond_f

    invoke-virtual {v0}, Landroid/webkit/WebView;->canGoBack()Z
    move-result v0
    if-eqz v0, :cond_f

    iget-object v0, p0, Lorg/truthlens/app/MainActivity;->webView:Landroid/webkit/WebView;
    invoke-virtual {v0}, Landroid/webkit/WebView;->goBack()V
    return-void

    :cond_f
    invoke-super {p0}, Landroid/app/Activity;->onBackPressed()V
    return-void
.end method
