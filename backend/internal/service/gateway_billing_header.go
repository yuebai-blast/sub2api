package service

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/cespare/xxhash/v2"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
)

// ccVersionInBillingRe matches the semver part of cc_version (X.Y.Z), preserving
// the trailing message-derived suffix (e.g. ".c02") if present.
var ccVersionInBillingRe = regexp.MustCompile(`cc_version=\d+\.\d+\.\d+`)

// cchSignedRe 匹配 billing header 文本中 5 位十六进制的 cch 字段（涵盖未签名的占位符
// 00000 与已签名的真实值），限定在 x-anthropic-billing-header 范围内以免误伤用户内容。
// 用于签名时归一化/替换 cch，以及从抓取到的真实请求里提取/还原 cch。
var cchSignedRe = regexp.MustCompile(`(x-anthropic-billing-header:[^"]*?\bcch=)([0-9a-f]{5})(;)`)

const cchSeed uint64 = 0x4D659218E32A3268

// syncBillingHeaderVersion rewrites cc_version in x-anthropic-billing-header
// system text blocks to match the version extracted from userAgent.
// Only touches system array blocks whose text starts with "x-anthropic-billing-header".
func syncBillingHeaderVersion(body []byte, userAgent string) []byte {
	version := ExtractCLIVersion(userAgent)
	if version == "" {
		return body
	}

	systemResult := gjson.GetBytes(body, "system")
	if !systemResult.Exists() || !systemResult.IsArray() {
		return body
	}

	replacement := "cc_version=" + version
	idx := 0
	systemResult.ForEach(func(_, item gjson.Result) bool {
		text := item.Get("text")
		if text.Exists() && text.Type == gjson.String &&
			strings.HasPrefix(text.String(), "x-anthropic-billing-header") {
			newText := ccVersionInBillingRe.ReplaceAllString(text.String(), replacement)
			if newText != text.String() {
				if updated, err := sjson.SetBytes(body, fmt.Sprintf("system.%d.text", idx), newText); err == nil {
					body = updated
				}
			}
		}
		idx++
		return true
	})

	return body
}

// signBillingHeaderCCH 计算请求 body 的 xxHash64 CCH 签名，并写回 billing header 的 cch 字段。
// 它会先把已有 cch（未签名的占位符 00000，或此前已签名的真实值）统一归一化为 00000，
// 在该占位形态上计算哈希（Anthropic 侧校验时同样对占位形态求哈希），再用计算结果替换回去。
// 若 body 不含 billing header 的 cch 字段，则原样返回。
func signBillingHeaderCCH(body []byte) []byte {
	if !cchSignedRe.Match(body) {
		return body
	}
	placeholderBody := cchSignedRe.ReplaceAll(body, []byte("${1}00000${3}"))
	cch := fmt.Sprintf("%05x", xxHash64Seeded(placeholderBody, cchSeed)&0xFFFFF)
	return cchSignedRe.ReplaceAll(placeholderBody, []byte("${1}"+cch+"${3}"))
}

// xxHash64Seeded computes xxHash64 of data with a custom seed.
func xxHash64Seeded(data []byte, seed uint64) uint64 {
	d := xxhash.NewWithSeed(seed)
	_, _ = d.Write(data)
	return d.Sum64()
}
