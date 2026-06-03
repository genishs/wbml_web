# 개발용 정적 서버 — ES 모듈 캐시 문제 방지(매 요청 no-store)
# ★ 멀티스레드: 단일 스레드면 브라우저 keep-alive 연결 하나가 이후 요청을 전부 블로킹해
#   "새로고침해도 최신 파일이 안 옴"이 발생한다. ThreadingHTTPServer로 동시 요청 처리.
import http.server

PORT = 8000

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'          # keep-alive 허용(단, Content-Length로 경계 명확)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, *args):
        pass                                # 콘솔 소음 제거

NoCacheHandler.extensions_map['.js'] = 'text/javascript'

http.server.ThreadingHTTPServer.allow_reuse_address = True
with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), NoCacheHandler) as httpd:
    httpd.daemon_threads = True
    print(f'dev server (no-cache, threaded) on http://127.0.0.1:{PORT}')
    httpd.serve_forever()
