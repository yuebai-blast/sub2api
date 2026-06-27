package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

// TestBuildSetupRouterHealth 验证安装向导模式下也提供 /health：
// 容器 healthcheck 探测 /health，若向导模式缺该端点会一直 unhealthy（见部署排障）。
func TestBuildSetupRouterHealth(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := buildSetupRouter()

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("向导模式 /health 期望 200，实际 %d，body=%s", w.Code, w.Body.String())
	}
}

// TestBuildSetupRouterSetupStatus 确认 /health 的加入没有破坏既有 /setup/status 路由
// （也间接保证没有重复注册导致 gin 在构建期 panic）。
func TestBuildSetupRouterSetupStatus(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := buildSetupRouter()

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/setup/status", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("向导模式 /setup/status 期望 200，实际 %d", w.Code)
	}
}
